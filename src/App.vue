<template>
  <div class="container">
    <h1>予定メモ</h1>

    <QuillEditor
      v-model:content="content"
      contentType="html"
      theme="snow"
      toolbar="full"
    />

    <button @click="saveMemo">
      {{ editingId ? '更新' : '保存' }}
    </button>

    <hr>

    <div
      v-for="memo in memos"
      :key="memo.id"
      class="memo"
    >
      <div class="date">
        {{ formatDate(memo.updatedAt || memo.createdAt) }}
      </div>

      <div v-html="memo.content"></div>

      <div class="actions">
        <button @click="editMemo(memo)">
          編集
        </button>

        <button @click="deleteMemo(memo.id)">
          削除
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { db } from './db'

const content = ref('')
const memos = ref([])
const editingId = ref(null)

const loadMemos = async () => {
  memos.value = await db.memos
    .orderBy('createdAt')
    .reverse()
    .toArray()
}

const saveMemo = async () => {
  if (!content.value) return

  if (editingId.value) {
    await db.memos.update(editingId.value, {
      content: content.value,
      updatedAt: new Date()
    })
  } else {
    await db.memos.add({
      content: content.value,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  content.value = ''
  editingId.value = null

  await loadMemos()
}

const editMemo = (memo) => {
  content.value = memo.content
  editingId.value = memo.id

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const deleteMemo = async (id) => {
  if (!confirm('削除しますか？')) return

  await db.memos.delete(id)
  await loadMemos()
}

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

onMounted(async () => {
  await loadMemos()
})
</script>

<style>
.container {
  max-width: 800px;
  margin: auto;
  padding: 16px;
}

button {
  padding: 10px 18px;
  margin: 5px;
}

.memo {
  border: 1px solid #ccc;
  padding: 12px;
  margin-top: 12px;
}

.date {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.actions {
  margin-top: 10px;
}
</style>