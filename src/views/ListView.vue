<template>
  <div class="header">
    <button 
        class="menu-button" 
        @click="toggleMenu"
      >⋮</button>

    <div v-if="showMenu" class="menu">
      <button 
        @click="startSelectMode"
      >選択削除
      </button>
    </div>
  </div>
  <div class="container">
    <div
      v-if="selectMode"
      class="select-actions"
    >
      <button @click="deleteSelected">
        削除
      </button>

      <button @click="cancelSelect">
        キャンセル
      </button>
    </div>
    <button @click="newMemo">
      新規作成
    </button>

    <div
      v-for="memo in memos"
      :key="memo.id"
      class="memo"
      @click="editMemo(memo)"
    >
      <div
        class="memo-preview"
        v-html="memo.content"
        @click="!selectMode && editMemo(memo)"
      ></div>
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

  const memos = ref([])
  const selectMode = ref(false)
  const selectedIds = ref([])
  const showMenu = ref(false)

  const toggleMenu = () => {
    showMenu.value = !showMenu.value
  }

  const startSelectMode = () => {
    selectMode.value = true
    showMenu.value = false
  }

  const loadMemos = async () => {
    memos.value = await db.memos
      .orderBy('createdAt')
      .reverse()
      .toArray()
  }
  const router = useRouter()

  const newMemo = () => {
    router.push('/edit')
  }
  
  const editMemo = (memo) => {
    router.push(`/edit/${memo.id}`)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  onMounted(async () => {
    await loadMemos()
  })
  const deleteSelected = async () => {

    if (!selectedIds.value.length) return

    if (!confirm('選択したメモを削除しますか？')) {
      return
    }

    for (const id of selectedIds.value) {
      await db.memos.delete(id)
    }

    selectedIds.value = []
    selectMode.value = false

    await loadMemos()
  }
  const cancelSelect = () => {
    selectedIds.value = []
    selectMode.value = false
  }
</script>

<style>
  .container {
    max-width: 90%;
    margin: 0 auto;
    padding: 16px;
  }
  .header {
    display: flex;
    justify-content: flex-end;
    position: sticky;
    top: 0;
    background: white;
    padding: 8px;
    z-index: 100;
  }

  .menu-button {
    border: none;
    background: none;
    font-size: 24px;
    cursor: pointer;
  }
  button {
    padding: 10px 18px;
    margin: 5px;
  }

  .memo {
    width: 95%;
    margin: 12px auto;

    border: 1px solid #ddd;
    border-radius: 12px;

    padding: 16px;
    box-sizing: border-box;
  }
  .memo-preview {
    overflow: hidden;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .memo-date {
    text-align: right;
    color: #888;
    font-size: 12px;
  }

  .actions {
    margin-top: 10px;
  }
  .clickable {
    cursor: pointer;
  }

  .clickable:hover {
    background-color: #f5f5f5;
  }

</style>