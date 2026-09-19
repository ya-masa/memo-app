<template>
  <div class="container">

    <button @click="newMemo">
      新規作成
    </button>

    <div
      v-for="memo in memos"
      :key="memo.id"
      class="memo"
    >
      <div class="memo-date">
        {{ formatDate(memo.updatedAt || memo.createdAt) }}
      </div>

      <div
        class="memo-preview"
        v-html="memo.content"
      ></div>

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
  import '@vueup/vue-quill/dist/vue-quill.snow.css'
  import { useRouter } from 'vue-router'
  import { db } from '../db'

  const content = ref('')
  const memos = ref([])
  const editingId = ref(null)

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
    router.push(`/edit/${memo.id}`)
  }
  const deleteMemo = async (id) => {
    if (!confirm('削除しますか？')) return

    await db.memos.delete(id)
    await loadMemos()
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
.memo-preview {
  overflow: hidden;
  display: -webkit-box;
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
</style>