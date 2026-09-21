<template>
  <div
    class="edit-container"
    :class="[themeClass, fontSizeClass]"
  >
    <button
      class="back-btn"
      @click="cancelEdit"
    >
      戻る
    </button>
    <div class="toolbar">
      <button
        class="bold-btn"
        :class="{ active: isBold }"
        @click="toggleBold"
      >
        太字
      </button>
      <div class="tool-group">
        <span>文字</span>
        <button
          class="color-btn black"
          :class="{ active: fontColor === 'black' }"
          @click="toggleBlack"
        >
          ⚫黒
        </button>
        <button
          class="color-btn blue"
          :class="{ active: fontColor === 'blue' }"
          @click="toggleBlue"
        >
          🔵青
        </button>

        <button
          class="color-btn red"
          :class="{ active: fontColor === 'red' }"
          @click="toggleRed"
        >
          🔴赤
        </button>
      </div>
      <div class="tool-group">
        <span>マーカー</span>
        <button
          class="color-btn yellow"
          :class="{ active: markerColor === 'yellow' }"
          @click="toggleYellow"
        >
          🟨黄
        </button>

        <button
          class="color-btn green"
          :class="{ active: markerColor === 'green' }"
          @click="toggleGreen"
        >🟩緑
        </button>
      </div>
    </div>
    <div
      ref="editor"
      class="editor"
      contenteditable="true"
      @keyup="updateToolbarState"
      @mouseup="updateToolbarState"
      @focus="updateToolbarState"
    ></div>
      <button
      class="save-btn"
      @click="saveMemo"
    >
      {{ editingId ? '更新して終わる' : '保存して終わる' }}
    </button>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { db } from '../db'
  import { useSettings } from '../composables/useSettings'

  const {
    themeClass,
    fontSizeClass
  } = useSettings()
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
    if (!confirm('変更を破棄して戻りますか？')) {
      return
    }router.push('/')
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
    if (markerColor.value === 'yellow') {
      document.execCommand(
        'hiliteColor', 
        false, 
        '#ffffff'
      )
    } else {
      document.execCommand(
        'hiliteColor',
        false,
        '#ffff00'
      )
    }

    updateToolbarState()
  }

  const toggleGreen = () => {
    if (markerColor.value === 'green') {
      document.execCommand(
        'hiliteColor', 
        false, 
        '#ffffff'
      )
    } else {
      document.execCommand(
        'hiliteColor',
        false,
        '#ccff99'
      )
    }

    updateToolbarState()
  }

  onMounted(() => {
    loadMemo()
  })

  const updateToolbarState = () => {
    const selection = window.getSelection()

    console.log(selection.anchorNode)
    console.log(selection.anchorNode?.parentElement)
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
    const bgColor = getHighlightColor()

    if (bgColor === 'rgb(255, 255, 0)') {
      markerColor.value = 'yellow'
    } else if (bgColor === 'rgb(204, 255, 153)') {
      markerColor.value = 'green'
    } else {
      markerColor.value = 'none'
    }
  }
  function getHighlightColor() {
    const selection = window.getSelection()

    if (!selection.rangeCount) return ''

    let el = selection.anchorNode

    if (el.nodeType === Node.TEXT_NODE) {
      el = el.parentElement
    }

    while (el && el !== editor.value) {
      const bg = getComputedStyle(el).backgroundColor

      if (
        bg !== 'rgba(0, 0, 0, 0)' &&
        bg !== 'transparent'
      ) {
        return bg
      }

      el = el.parentElement
    }

    return ''
  }
</script>

<style scoped>

  /* ---------------- */
  /* コンテナ          */
  /* ---------------- */

  .edit-container {
    max-width: 640px;
    margin: 0 auto;
    padding: 12px;
    min-height: 100vh;
  }
  /* ---------------- */
  /* 現在の書式表示    */
  /* ---------------- */

  .current-format {
    padding: 12px;
  }

  .current-format span {
    font-size: var(--label-font-size);
    font-weight: bold;
  }

  /* ---------------- */
  /* 編集エリア        */
  /* ---------------- */

  .editor {
    min-height: 500px;

    margin-top: 10px;
    padding: 16px;

    border: 1px solid #ddd;
    border-radius: 12px;

    background: white;

    font-size: var(--editor-font-size);
    line-height: 1.8;

    outline: none;
  }

  .dark .editor {
    background: #222;
    color: #fff;
    border-color: #555;
  }

  /* ---------------- */
  /* ツールバー        */
  /* ---------------- */

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

    background: inherit;

    border: 1px solid #ddd;
    border-radius: 10px;
    line-height: 1.5;
  }

  .dark .toolbar {
    border-color: #555;
  }

  .tool-group span,.toolbar span {
    font-size: var(--button-font-size);
    font-weight: bold;
    
  }
  .tool-group{
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    line-height: 1.5;
  }

  /* ---------------- */
  /* 汎用ボタン        */
  /* ---------------- */

  button {
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: var(--button-font-size);
  }

  /* ---------------- */
  /* 戻るボタン        */
  /* ---------------- */

  .back-btn {
    width: 100px;
    height: 55px;

    border: none;
    border-radius: 10px;
    font-weight: bold;
  }

  /* ---------------- */
  /* 保存ボタン        */
  /* ---------------- */

  .save-btn {
    max-width: 500px;
    width:100%;
    height: 70px;
    margin:auto 0;
    margin-top: 20px;

    font-size: var(--button-font-size);
    font-weight: bold;

    background: #2196f3;
    color: white;

    border: none;
    border-radius: 10px;
  }

  .save-btn:hover {
    filter: brightness(1.05);
  }

  /* ---------------- */
  /* ツールボタン      */
  /* ---------------- */

  .tool-btn {
    width: ver(--toolbtn-height);
    height:ver(--toolbtn-height);
    margin:14px;
  }

  /* ---------------- */
  /* 色選択ボタン      */
  /* ---------------- */
  
  .bold-btn,
  .color-btn {
    width: ver(--toolbtn-height);
    height:ver(--toolbtn-height) ;

    margin:14px;
    border-radius: 50%;

    color: black;

    font-weight: bold;
    font-size:ver(--toolbtn-font-size);

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .color-btn {
    position: relative;
  }

  /* ---------------- */
  /* 選択状態          */
  /* ---------------- */

  .active {
    transform: scale(1.25);

    border: 4px solid #000;

    box-shadow:
      0 0 15px rgba(0, 0, 0, .5),
      inset 0 0 10px rgba(0, 0, 0, .3);

    filter: brightness(.9);
  }

  .bold-btn.active {
    background: #ffd180;
    color: black;

    transform: scale(1.15);

    border: 3px solid #ffb74d;
    box-shadow:
          0 0 15px rgba(0, 0, 0, .5),
          inset 0 0 10px rgba(0, 0, 0, .3);
  }

  .color-btn.active {
    transform: scale(1.4);

    background: #ffd180;

    border: 2px solid #ffb74d;

    box-shadow:
      0 0 10px rgba(0,0,0,.3),
      0 0 20px rgba(0,0,0,.2);
  }

  /* ---------------- */
  /* ダークモード補助  */
  /* ---------------- */

  .dark .back-btn {
    background: #333;
    color: white;
  }

  .dark .save-btn {
    background: #1976d2;
  }

  .dark .current-format {
    color: #f3f4f6;
  }

</style>