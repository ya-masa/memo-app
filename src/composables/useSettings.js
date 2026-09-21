import { ref, computed } from 'vue'

const theme = ref(
  localStorage.getItem('theme') || 'light'
)

const fontSize = ref(
  localStorage.getItem('fontSize') || 'md'
)

export function useSettings() {

  const setTheme = (value) => {
    theme.value = value
    localStorage.setItem('theme', value)
  }

  const setFontSize = (value) => {
    fontSize.value = value
    localStorage.setItem('fontSize', value)
  }

  const themeClass = computed(() => {
    return theme.value
  })

  const fontSizeClass = computed(() => {
    return `font-${fontSize.value}`
  })

  return {
    theme,
    fontSize,
    themeClass,
    fontSizeClass,
    setTheme,
    setFontSize
  }
}