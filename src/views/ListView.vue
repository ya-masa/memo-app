<template>
  <div
    class="container"
    :class="[themeClass, fontSizeClass]"
  >
    <div class="header">
      <button
        class="new-btn"
        @click="newMemo"
      >
        新規作成
      </button>
      <button
        class="menu-button"
        @click="toggleMenu"
      >
        メニュー
      </button>
    </div>
    <div
      v-if="showMenu"
      class="menu"
    >
      <button @click="
        mode = 'delete';
        showMenu = !showMenu;"
      >
        選択削除
      </button>
      <button @click="
        mode = 'find';
        showMenu = !showMenu;"
      >
        🔍探す
      </button>
      <select class="menu-select" v-model="sortOrder">
        <option value="updatedAt">並べ替え：更新日時順</option>
        <option value="createdAt">並べ替え：作成順</option>
      </select>
      <select 
        class="menu-select"
        v-model="theme"
        >
        <option value="light">
          カラー：ライト
        </option>
        <option value="dark">
          カラー：ダーク
        </option>
      </select>

      <select 
        class="menu-select" 
        v-model="fontSize"
        >
        <option value="xs">
          文字サイズ：極小
        </option>
        <option value="sm">
          文字サイズ：小
        </option>
        <option value="md">
          文字サイズ：標準
        </option>
        <option value="lg">
          文字サイズ：大
        </option>
        <option value="xl">
          文字サイズ：特大
        </option>
      </select>
    </div>
    <div
      v-if="mode === 'delete'"
      class="select-actions"
    >
        <h3>
          削除したいメモを選んでから削除を押してください
        </h3>

        <button
          class="del-btn"
          @click="deleteSelected"
        >
          削除
        </button>

        <button @click="mode = ''">
          キャンセル
        </button>
      </div>
      <div
        v-if="mode === 'find'"
        class="find-actions"
      >
        <input
          v-model="searchText"
          type="text"
          placeholder="キーワードを入力"
        >
        <button @click="mode = ''">
          閉じる
        </button>
      </div>
      <div>
        <p>お知らせ：アプリ修正中　ご迷惑おかけして申し訳ありません</p>
      </div>
    <!-- メモ一覧 -->
    <div
      v-for="memo in filteredMemos"
      :key="memo.id"
      class="memo"
      :class="{ selected: selectedIds.includes(memo.id) }"
      @click="mode === 'delete' && toggleSelect(memo.id)"
    >
      <span
        v-if="mode === 'delete'"
        class="checkmark"
      >
        {{ selectedIds.includes(memo.id) ? '✓' : '' }}
      </span>
      <button
        v-if="mode !== 'delete'"
        class="pin-btn"
        @click.stop="togglePin(memo)"
      >
        {{ memo.pinned ? '📌固定中' : '📍ピン止め' }}
      </button>
      <div
        class="memo-preview"
        v-html="memo.content"
        @click.stop="mode !== 'delete' && editMemo(memo)"
      ></div>
      <div class="memo-date">
        {{ formatDate(memo.updatedAt || memo.createdAt) }}
      </div>
    </div>
    <div
      v-if="mode === 'find' && filteredMemos.length === 0"
      class="no-result"
    >
      該当するメモはありません
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

import { db } from '../db'
import { useSettings } from '../composables/useSettings'

const router = useRouter()

const {
  theme,
  fontSize,
  themeClass,
  fontSizeClass,
  setTheme,
  setFontSize
} = useSettings()

const memos = ref([])
const selectedIds = ref([])

const showMenu = ref(false)
const mode = ref('')

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const searchText = ref('')
const sortOrder = ref('createdAt')

watch(theme, (value) => {
  setTheme(value)
})

watch(fontSize, (value) => {
  setFontSize(value)
})

const toggleSelect = (id) => {
  const index = selectedIds.value.indexOf(id)

  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}
const loadMemos = async () => {
  memos.value = await db.memos.toArray()
}

const newMemo = () => {
  router.push('/edit')
}

const editMemo = (memo) => {
  router.push(`/edit/${memo.id}`)
}

const formatDate = (date) => {
  const d = new Date(date)
  const now = new Date()

  const dateStr = d.getFullYear() === now.getFullYear()
    ? `${d.getMonth() + 1}月${d.getDate()}日`
    : `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`

  const timeStr = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`

  return `${dateStr} ${timeStr}`
}

const deleteSelected = async () => {
  if (!selectedIds.value.length) return

  if (!confirm('選択したメモを削除しますか？')) {
    return
  }

  for (const id of selectedIds.value) {
    await db.memos.delete(id)
  }

  selectedIds.value = []
  mode.value = ''

  await loadMemos()
}

const cancelSelect = () => {
  selectedIds.value = []
  mode.value = ''
}

onMounted(async () => {
  await loadMemos()
})

  const filteredMemos = computed(() => {
    const result = [...memos.value]

    result.sort((a, b) => {
      // ピン止めしたメモを先頭にする
      const pinDiff =
        Number(!!b.pinned) - Number(!!a.pinned)

      if (pinDiff !== 0) return pinDiff

      // 選択した日時で並べ替える
      const dateA = new Date(
        sortOrder.value === 'updatedAt'
          ? (a.updatedAt || a.createdAt)
          : a.createdAt
      ).getTime()

      const dateB = new Date(
        sortOrder.value === 'updatedAt'
          ? (b.updatedAt || b.createdAt)
          : b.createdAt
      ).getTime()

      return dateB - dateA
    })

    if (mode.value !== 'find' || !searchText.value.trim()) {
      return result
    }

    const keyword = searchText.value.trim().toLowerCase()

    return result.filter(memo => {
      const text = (memo.content || '')
        .replace(/<[^>]*>/g, '')
        .toLowerCase()

      return text.includes(keyword)
    })
  })
  const togglePin = async (memo) => {
    const pinned = !memo.pinned

    await db.memos.update(memo.id, { pinned })

    const target = memos.value.find(
      item => item.id === memo.id
    )

    if (target) {
      target.pinned = pinned
    }
  }
</script>


<style scoped>

  .container {
    max-width: 640px;
    margin: 0 auto;
    padding: 12px;
    min-height: 100vh;
  }


  /* ---------------- */
  /* ヘッダー          */
  /* ---------------- */

  .header {
    display: flex;
    justify-content: flex-end;

    position: sticky;
    top: 0;

    padding: 8px;

    background: inherit;

    z-index: 100;
  }

  /* ---------------- */
  /* ボタン            */
  /* ---------------- */

  button ,.menu select{
    padding: 10px 18px;

    min-height: var(--button-height);

    font-size: var(--button-font-size);
    font-weight: bold;

    border-radius: 20px;

    cursor: pointer;
  }

  .new-btn {
    width: 200px;
    height: var(--button-height);

    background: #4caf50;
    color: white;
    border: none;

    display: block;
    margin: 0px auto;

    box-shadow: 0 4px 10px rgba(0, 0, 0, .2);
  }

  .menu-button {
    border: none;
    background: none;
  }

  .del-btn {
    width: 140px;
    height: var(--button-height);

    background: #fb6565;
    color: white;
  }

  /* ---------------- */
  /* メニュー          */
  /* ---------------- */

  .menu {
    text-align: right;
    margin-bottom: 20px;
  }

  /* ---------------- */
  /* モード画面        */
  /* ---------------- */

  .select-actions,
  .select-color {
    width: 95%;

    margin: 5px auto;
    padding: 20px;

    border: 1px solid #ddd;
    border-radius: 15px;

    box-sizing: border-box;
  }

  .dark .select-actions,
  .dark .select-color {
    border-color: #555;
  }

  .select-color label {
    font-size: var(--date-font-size);
    line-height: 2;
  }

  .select-color input[type="radio"] {
    transform: scale(1.5);
    margin-right: 10px;
  }

  /* ---------------- */
  /* メモ一覧          */
  /* ---------------- */

  .memo {
    position: relative;

    width: 95%;
    margin: 12px auto;

    padding: var(--memo-padding);

    min-height: var(--memo-min-height);

    border: 1px solid #ddd;
    border-radius: 12px;

    box-sizing: border-box;

    line-height: 1.5;
    transition: all .2s;
  }

  .memo-preview {
    flex: 1;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    font-size: var(--memo-font-size);
    line-height: 1.5;
    
    padding-right: 100px;
  }

  .memo-date {
    text-align: right;
    color: #222;
    font-size: var(--date-font-size);
  }

  /* ---------------- */
  /* 削除選択状態      */
  /* ---------------- */

  .selected {
    border: 4px solid #fb86b7;

    background: #fbbbca;

    transform: scale(1.03);

    box-shadow: 0 0 15px rgba(243, 33, 103, 0.6);
  }

  .checkmark {
    position: absolute;

    top: 10px;
    right: 10px;

    font-size: var(--button-font-size);

    color: #f32121;

    font-weight: bold;
  }

  /* ---------------- */
  /* ホバー            */
  /* ---------------- */

  .clickable {
    cursor: pointer;
  }

  .clickable:hover {
    background: #f5f5f5;
  }

  .dark .clickable:hover {
    background: #2a2d35;
  }

  .find-actions input{
    font-size:var(--editor-font-size);
    height:80px;
  }

  /*　ピン止め */
  .pin-btn {
    position: absolute;
    top: 6px;
    right: 6px;

    min-height: 36px;
    padding: 4px 12px;
    margin: 0;

    border: 1px solid #ddd;
    border-radius: 12px;
    background: transparent;
    font-size: var(--date-font-size);
  }
</style>