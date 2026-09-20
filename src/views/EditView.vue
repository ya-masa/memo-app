<template>
  <div class="container">

    <button
      class="back-btn"
      @click="cancelEdit"
    >
      戻る
    </button>

    <button
      class="save-btn"
      @click="saveMemo"
    >
      {{ editingId ? '更新' : '保存' }}
    </button>

    <div
      ref="editor"
      class="editor"
      contenteditable="true"
    ></div>

  </div>

  <div class="footer-toolbar">
    <button
      class="tool-btn"
      @click="toggleBold"
    >
      B
    </button>

    <button
      class="color-btn blue"
      @click="toggleBlue"
    ></button>

    <button
      class="color-btn red"
      @click="toggleRed"
    ></button>

    <button
      class="color-btn yellow"
      @click="toggleYellow"
    ></button>

    <button
      class="color-btn green"
      @click="toggleGreen"
    ></button>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { db } from '../db'

  const route = useRoute()
  const router = useRouter()

  const editor = ref(null)

  const editingId = ref(null)

  const loadMemo = async () => {

    const id = Number(route.params.id)

    if (!id) return

    const memo = await db.memos.get(id)

    if (memo) {
      editingId.value = memo.id
      editor.value.innerHTML = memo.content
    }
  }

  const saveMemo = async () => {

    const content = editor.value.innerHTML

    if (!content.trim()) return

    if (editingId.value) {

      await db.memos.update(
        editingId.value,
        {
          content,
          updatedAt: new Date()
        }
      )

    } else {

      await db.memos.add({
        content,
        createdAt: new Date(),
        updatedAt: new Date()
      })

    }

    router.push('/')
  }

  const cancelEdit = () => {
    router.push('/')
  }

  const toggleBold = () => {
    document.execCommand('bold')
  }

  const toggleBlue = () => {
    document.execCommand(
      'foreColor',
      false,
      '#0000ff'
    )
  }

  const toggleRed = () => {
    document.execCommand(
      'foreColor',
      false,
      '#ff0000'
    )
  }

  const toggleYellow = () => {
    document.execCommand(
      'hiliteColor',
      false,
      '#ffff00'
    )
  }

  const toggleGreen = () => {
    document.execCommand(
      'hiliteColor',
      false,
      '#ccff99'
    )
  }

  onMounted(() => {
    loadMemo()
  })
</script>

<style>
  .container {
    max-width: 640px;
    margin: 0 auto;
    padding: 12px;
  }

  .editor {
    min-height: 500px;

    margin-top: 10px;

    padding: 16px;

    border: 1px solid #ddd;
    border-radius: 12px;

    background: white;

    font-size: 18px;
    line-height: 1.8;

    outline: none;
  }

  .footer-toolbar {
    position: fixed;

    bottom: 0;
    left: 0;
    right: 0;

    display: flex;
    justify-content: center;
    gap: 12px;

    background: white;

    border-top: 1px solid #ddd;

    padding: 10px;
  }

  .tool-btn {
    width: 44px;
    height: 44px;
    font-weight: bold;
  }

  .color-btn {
    width: 36px;
    height: 36px;

    border-radius: 50%;

    border: 2px solid #ccc;
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
</style>