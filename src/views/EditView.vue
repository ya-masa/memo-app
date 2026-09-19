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

    <div class="editor-wrapper">
      <QuillEditor
        ref="editor"
        v-model:content="content"
        contentType="html"
        theme="snow"
        toolbar="false"
      />
    </div>
  </div>
  <div class="footer-toolbar">
    <button @click="setBold" class="bold-btn">
      太字
    </button>
    <button
      @click="setBlue"
      :class="{ active: activeFormat === 'blue' }"
      class="color-btn-f blue"
    ></button>

    <button
      @click="setRed"
      :class="{ active: activeFormat === 'red' }"
      class="color-btn-f red"
    ></button>

    <button
      @click="setYellow"
      :class="{ active: activeFormat === 'yellow' }"
      class="color-btn-m yellow"
    ></button>

    <button
      @click="setGreen"
      :class="{ active: activeFormat === 'green' }"
      class="color-btn-m green"
    ></button>
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
  const editor = ref(null)
  const activeFormat = ref('')

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
  const setBold = () => {
    const quill = editor.value.getQuill()
    quill.format('bold', true)
  }
const setBlue = () => {
  const quill = editor.value.getQuill()
  quill.format('color', '#0000ff')

  activeFormat.value = 'blue'
}
const setRed = () => {
  const quill = editor.value.getQuill()
  quill.format('color', '#ff0000')

  activeFormat.value = 'red'
}

  const setYellow = () => {
    const quill = editor.value.getQuill()
    quill.format('background', '#ffff00')
  }
  const setGreen = () => {
    const quill = editor.value.getQuill()
    quill.format('background', '#ccff99')
  }
</script>

<style>
  .container {
    max-width: 90%;
    margin: 0 auto;
    padding: 16px;
  }
  .editor-wrapper {
    width: 95%;
    margin: 0 auto;
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
  .footer-toolbar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;

    display: flex;
    justify-content: center;
    gap: 12px;

    padding: 10px;

    background: white;
    border-top: 1px solid #ddd;
  }

  .bold-btn {
    width: 40px;
    height: 40px;
    font-weight: bold;
  }

  .color-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #ddd;
  }

  .blue {
    background: #2196f3;
  }

  .red {
    background: #f44336;
  }

  .yellow {
    background: #ffeb3b;
  }

  .green {
    background: #8bc34a;
  }
  .color-btn-f{
    width: 32px;
    height: 32px;
    border-radius: 50%;
  }
  .color-btn-b{
    width: 32px;
    height: 32px;
    border-radius: 10%;
  }

  .active {
    transform: scale(1.2);
    border: 4px solid #333;
    box-shadow: 0 0 8px rgba(0,0,0,.3);
  }
</style>