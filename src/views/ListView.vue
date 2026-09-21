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
      <button @click="mode = 'delete'">
        選択削除
      </button>

      <button @click="mode = 'color'">
        カラー選択
      </button>

      <button @click="mode = 'fontsize'">
        文字サイズ選択
      </button>
    </div>

    <!-- 削除 -->
    <div class="del-container">
      <div
        v-if="mode === 'delete'"
        class="select-actions"
      >
      <h3>削除したいメモを選んでから削除を押してください</h3>
        <button
          class="del-btn"
          @click="deleteSelected"
        >
          削除
        </button>

        <br><br>

        <button @click="mode = ''">
          キャンセル
        </button>
      </div>
    </div>

    <br><br>

    <!-- カラー -->
    <div class="color-container">
      <div
        v-if="mode === 'color'"
        class="select-color"
      >
        <h3>モード</h3>

        <label>
          <input
            type="radio"
            v-model="theme"
            value="light"
          >
          ライトモード
        </label>

        <br>

        <label>
          <input
            type="radio"
            v-model="theme"
            value="dark"
          >
          ダークモード
        </label>

        <br><br>

        <button
          class="ok-btn"
          @click="colorSelected"
        >
          決定
        </button>

        <br><br>

        <button
          class="cancel-btn"
          @click="mode = ''"
        >
          キャンセル
        </button>
      </div>
    </div>

    <!-- フォントサイズ -->
    <div class="fontsize-container">
      <div
        v-if="mode === 'fontsize'"
        class="select-color"
      >
        <h3>文字サイズ</h3>

        <label>
          <input
            type="radio"
            v-model="fontSize"
            value="xs"
          >
          極小
        </label><br>

        <label>
          <input
            type="radio"
            v-model="fontSize"
            value="sm"
          >
          小
        </label><br>

        <label>
          <input
            type="radio"
            v-model="fontSize"
            value="md"
          >
          標準
        </label><br>

        <label>
          <input
            type="radio"
            v-model="fontSize"
            value="lg"
          >
          大
        </label><br>

        <label>
          <input
            type="radio"
            v-model="fontSize"
            value="xl"
          >
          特大
        </label>

        <br><br>

        <button
          class="ok-btn"
          @click="fontsizeSelected"
        >
          決定
        </button>

        <br><br>

        <button
          class="cancel-btn"
          @click="mode = ''"
        >
          キャンセル
        </button>
      </div>
    </div>

    <!-- メモ一覧 -->
    <div
      v-for="memo in memos"
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

      <br><br>

      <div
        class="memo-preview"
        v-html="memo.content"
        @click.stop="mode !== 'delete' && editMemo(memo)"
      ></div>

      <br><br>

      <div class="memo-date">
        {{ formatDate(memo.updatedAt || memo.createdAt) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { useRouter } from 'vue-router'
import { db } from '../db'
import { useSettings } from '../composables/useSettings'

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

/* 削除モード */

const delSelectMode = () => {
  mode.value = 'delete'
  showMenu.value = false
}

/* カラーモード */

const colorSelectMode = () => {
  mode.value = 'color'
  showMenu.value = false
}

/* 文字サイズモード */

const fontsizeSelectMode = () => {
  mode.value = 'fontsize'
  showMenu.value = false
}

/* 選択処理 */

const toggleSelect = (id) => {
  const index = selectedIds.value.indexOf(id)

  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

/* メモ読込 */

const loadMemos = async () => {
  memos.value = await db.memos
    .orderBy('createdAt')
    .reverse()
    .toArray()
}

/* ルーター */

const router = useRouter()

const newMemo = () => {
  router.push('/edit')
}

const editMemo = (memo) => {
  router.push(`/edit/${memo.id}`)
}

/* 日付表示 */

const formatDate = (date) => {
  const d = new Date(date)
  const now = new Date()

  if (d.getFullYear() === now.getFullYear()) {
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }

  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

/* 削除 */

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

/* キャンセル */

const cancelSelect = () => {
  selectedIds.value = []
  mode.value = ''
}

/* テーマ保存 */

const colorSelected = () => {
  setTheme(theme.value)
  mode.value = ''
}

/* フォントサイズ保存 */

const fontsizeSelected = () => {
  setFontSize(fontSize.value)
  mode.value = ''
}

onMounted(async () => {
  await loadMemos()
})
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

  button {
    padding: 10px 18px;
    margin: 5px;

    min-height: 50px;

    font-size: var(--button-font-size);
    font-weight: bold;

    border-radius: 20px;

    cursor: pointer;
  }

  .new-btn {
    width: 200px;
    height: 70px;

    background: #4caf50;
    color: white;
    border: none;

    display: block;
    margin: 30px auto;

    box-shadow: 0 4px 10px rgba(0, 0, 0, .2);
  }

  .menu-button {
    border: none;
    background: none;
  }

  .del-btn {
    width: 140px;
    height: 70px;

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

    margin: 15px auto;
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
    font-size: var(--memo-font-size);
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

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    display: flex;

    transition: all .2s;
  }

  .memo-preview {
    flex: 1;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    font-size: var(--memo-font-size);
  }

  .memo-date {
    text-align: right;

    color: #888;

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

    font-size: var(--memo-font-size);

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

</style>