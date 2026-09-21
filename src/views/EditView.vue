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
    
    <div class="current-format">
      <span v-if="isBold">
        B
      </span>
      <span
        v-if="fontColor === 'black'"
        class="black-indicator"
      >
        ⚫
      </span>
      <span
        v-if="fontColor === 'blue'"
      >
        🔵
      </span>
      <span
        v-if="fontColor === 'red'"
      >
        🔴
      </span>
      <span
        v-if="markerColor === 'yellow'"
      >
        🟨
      </span>

      <span
        v-if="markerColor === 'green'"
      >
        🟩
      </span>
    </div>
    <div class="toolbar">
      <button
        class="bold-btn"
        :class="{ active: isBold }"
        @click="toggleBold"
      >
        B{{ isBold === true ? '✓' : '' }}
      </button>

      <button
        class="color-btn black"
        :class="{ active: fontColor === 'black' }"
        @click="toggleBlack"
      >
        ⚫{{ fontColor === 'black' ? '✓' : '' }}
      </button>
      <button
        class="color-btn blue"
        :class="{ active: fontColor === 'blue' }"
        @click="toggleBlue"
      >
        🔵{{ fontColor === 'blue' ? '✓' : '' }}
      </button>

      <button
        class="color-btn red"
        :class="{ active: fontColor === 'red' }"
        @click="toggleRed"
      >
        🔴{{ fontColor === 'red' ? '✓' : '' }}
      </button>

      <button
        class="color-btn yellow"
        :class="{ active: markerColor === 'yellow' }"
        @click="toggleYellow"
      >
      🟨 {{ markerColor === 'yellow' ? '✓' : '' }}
      </button>

      <button
        class="color-btn green"
        :class="{ active: markerColor === 'green' }"
        @click="toggleGreen"
      >🟩
        {{ markerColor === 'green' ? '✓' : '' }}
      </button>
    </div>
    <div
      ref="editor"
      class="editor"
      contenteditable="true"
      @keyup="updateToolbarState"
      @mouseup="updateToolbarState"
      @focus="updateToolbarState"
    ></div>
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

  const isBold = ref(false)
  const fontColor = ref('black')
  const markerColor = ref('')

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
    updateToolbarState()
  }
  const toggleBlack = () => {
    document.execCommand(
      'foreColor',
      false,
      '#000000'
    )
    updateToolbarState()
  }


  const toggleBlue = () => {
    document.execCommand(
      'foreColor',
      false,
      '#0000ff'
    )
    updateToolbarState()
  }

  const toggleRed = () => {
    document.execCommand(
      'foreColor',
      false,
      '#ff0000'
    )
    updateToolbarState()
  }

  const toggleYellow = () => {
    document.execCommand(
      'hiliteColor',
      false,
      '#ffff00'
    )
    updateToolbarState()
  }

  const toggleGreen = () => {
    document.execCommand(
      'hiliteColor',
      false,
      '#ccff99'
    )
    updateToolbarState()
  }

  onMounted(() => {
    loadMemo()
  })

  const updateToolbarState = () => {
    // 太字
    isBold.value = document.queryCommandState('bold')

    // 文字色
    const foreColor = document.queryCommandValue('foreColor')

    if (
      foreColor === '#ff0000' ||
      foreColor === 'rgb(255, 0, 0)'
    ) {
      fontColor.value = 'red'
    } else if (
      foreColor === '#0000ff' ||
      foreColor === 'rgb(0, 0, 255)'
    ) {
      fontColor.value = 'blue'
    } else if (
      foreColor === '#000000' ||
      foreColor === 'rgb(0, 0, 0)'
    ) {
      fontColor.value = 'black'
    } else {
      fontColor.value = 'black'
    }

    // 背景色
    const hiliteColor = document.queryCommandValue('hiliteColor')
    console.log("hiliteColor:"+hiliteColor)
    console.log(document.queryCommandSupported('hiliteColor'))
    console.log(document.queryCommandState('styleWithCSS'))
    console.log(JSON.stringify(hiliteColor))

    if (
      hiliteColor === '#ffff00' ||
      hiliteColor === 'rgb(255, 255, 0)'
    ) {
      markerColor.value = 'yellow'
    } else if (
      hiliteColor === '#ccff99' ||
      hiliteColor === 'rgb(204, 255, 153)'
    ) {
      markerColor.value = 'green'
    } else {
      markerColor.value = 'none'
    }
  }
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

    font-size: 21px;
    line-height: 1.8;

    outline: none;
  }

.toolbar {
  position: sticky;
  top: 0;
  z-index: 100;

  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;

  margin: 12px 0;

  padding: 10px;

  background: white;
  border: 1px solid #ddd;
  border-radius: 10px;
}

  .tool-btn {
    width: 44px;
    height: 44px;
    font-weight: bold;
  }

  .color-btn {
    width: 40px;
    height: 40px;

    border-radius: 50%;

    color: black;
    font-weight: bold;
    font-size: 18px;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tool-btn,
  .color-btn {
    transition: all 0.2s ease;
  }
  .color-btn {
  position: relative;
  }
  
  .active {
    transform: scale(1.4);
    border: 4px solid #000;
    box-shadow: 0 0 12px rgba(0,0,0,.4);
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
  .active {
    transform: scale(1.25);

    border: 4px solid #000;

    box-shadow:
      0 0 15px rgba(0,0,0,.5),
      inset 0 0 10px rgba(0,0,0,.3);

    filter: brightness(0.9);
  }
  .bold-btn.active {
    background: #222;
    color: white;

    transform: scale(1.15);

    border: 3px solid #fff;

    box-shadow:
      0 0 15px rgba(0,0,0,.5);
  }
  .color-btn.active {
    transform: scale(1.4);

    border: 5px solid #000;

    box-shadow:
      0 0 10px rgba(0,0,0,.3),
      0 0 20px rgba(0,0,0,.2);
  }

</style>