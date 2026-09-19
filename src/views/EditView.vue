<template>
  <div class="container">
    <div v-if="message" class="message">
      {{ message }}
    </div>
    <button @click="cancelEdit">
      戻る
    </button>

    <button @click="saveMemo">
      {{ editingId ? '更新' : '保存' }}
    </button>

    <QuillEditor
      v-model:content="content"
      contentType="html"
      theme="snow"
      :toolbar="toolbarOptions"
      :formats="formats"
    />
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { QuillEditor } from '@vueup/vue-quill'
  import '@vueup/vue-quill/dist/vue-quill.snow.css'
  import { db } from '../db'

  const route = useRoute()
  const router = useRouter()

  const content = ref('')
  const editingId = ref(null)
  
  const message = ref('')
  const formats = [
    'bold',
    'color',
    'background'
  ]

  const loadMemo = async () => {

    const id = Number(route.params.id)

    if (!id) return

    const memo = await db.memos.get(id)

    if (memo) {
      editingId.value = memo.id
      content.value = memo.content
    }
  }

  const saveMemo = async () => {

    if (!content.value) return

    if (editingId.value) {
      await db.memos.update(editingId.value, {
        content: content.value,
        updatedAt: new Date()
      })

      message.value = '更新しました'
    } else {
      await db.memos.add({
        content: content.value,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      message.value = '保存しました'
    }
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }

  onMounted(() => {
    loadMemo()
  })

  const cancelEdit = () => {
    if (!confirm('入力内容を破棄して一覧へ戻りますか？')) {
      return
    }
    router.push('/')
  }
  const toolbarOptions = [
    ['bold'],
    [
      {
        color: [
          '#0000ff', // 青
          '#ff0000'  // 赤
        ]
      }
    ],
    [
      {
        background: [
          '#ffff00', // 黄
          '#ccff99'  // 黄緑
        ]
      }
    ]
  ]

</script>

<style>
  .container {
    max-width: 800px;
    margin: auto;
    padding: 16px;
  }

  button {
    padding: 10px 18px;
    margin-right: 8px;
    margin-bottom: 10px;
  }
  .message {
    background: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #81c784;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 4px;
  }
</style>