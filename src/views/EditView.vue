<template>
  <div class="container">
    <div v-if="message" class="message">
      {{ message }}
    </div>
    <button 
      class="back-btn" 
      @click="cancelEdit"
    >戻る
    </button>

    <button
      class="save-btn"
      @click="saveMemo"
    >
      {{ editingId ? '更新' : '保存' }}
    </button>

    <div class="editor-wrapper">
      <QuillEditor
        ref="editor"
        @ready="onReady"
        v-model:content="content"
        contentType="html"
        theme="snow"
      />
    </div>
  </div>
  <div class="footer-toolbar">
    <button @click="toggleBold" class="bold-btn">
      B
    </button>
    <button
      @click="toggleBlue"
      :class="{ active: activeFormat === 'blue' }"
      class="color-btn-f blue"
    ></button>

    <button
      @click="toggleRed"
      :class="{ active: activeFormat === 'red' }"
      class="color-btn-f red"
    ></button>

    <button
      @click="toggleYellow"
      :class="{ active: activeFormat === 'yellow' }"
      class="color-btn-m yellow"
    ></button>

    <button
      @click="toggleGreen"
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
  const isBold = ref(false)
  const fontColor = ref('black')
  const markerColor = ref('')

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
  const toggleBold = () => {
    isBold.value = !isBold.value

    const quill = editor.value.getQuill()

    quill.format('bold', isBold.value)
  }
const toggleBlue = () => {

  const quill = editor.value.getQuill()

  if (fontColor.value === 'blue') {
    fontColor.value = 'black'
    quill.format('color', '#000000')
  } else {
    fontColor.value = 'blue'
    quill.format('color', '#0000ff')
  }
}
  const toggleRed = () => {

    const quill = editor.value.getQuill()

    if (fontColor.value === 'red') {
      fontColor.value = 'black'
      quill.format('color', '#000000')
    } else {
      fontColor.value = 'red'
      quill.format('color', '#ff0000')
    }
  }

  const toggleYellow = () => {

    const quill = editor.value.getQuill()

    if (markerColor.value === 'yellow') {
      markerColor.value = ''
      quill.format('background', false)
    } else {
      markerColor.value = 'yellow'
      quill.format('background', '#ffff00')
    }
  }
  const toggleGreen = () => {

    const quill = editor.value.getQuill()

    if (markerColor.value === 'green') {
      markerColor.value = ''
      quill.format('background', false)
    } else {
      markerColor.value = 'green'
      quill.format('background', '#ccff99')
    }
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
  .back-btn {
    width: 80px;
    height: 40px;
  }
  .save-btn {
    width: 120px;
    height: 50px;
    font-size: 20px;
    font-weight: bold;

    background: #2196f3;
    color: white;

    border: none;
    border-radius: 10px;
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
  .ql-toolbar {
    display:none;
  }
  .bold-btn {
    width: 40px;
    height: 40px;
    font-weight: bold;
  }
  .tool-btn {
    width: 44px;
    height: 44px;
    border: 1px solid #ccc;
    border-radius: 8px;
    background: white;
  }

  .tool-btn.active {
    box-shadow: inset 0 0 8px rgba(0,0,0,.3);
    transform: translateY(2px);
    border: 2px solid #2196f3;
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
  .bold-btn.active {
    background: #333;
    color: white;
  }

  .blue.active,
  .red.active,
  .yellow.active,
  .green.active {
    border: 4px solid #000;
    transform: scale(1.3);
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
    transform: scale(1.25);
    border: 4px solid #000;
    box-shadow:
      0 0 12px rgba(0,0,0,.4),
      0 0 0 3px #fff;
  }
</style>