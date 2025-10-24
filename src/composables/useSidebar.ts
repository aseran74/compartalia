import { ref, computed, onMounted, onUnmounted, provide, inject } from 'vue'
import type { Ref } from 'vue' //

interface SidebarContextType {
  isExpanded: Ref<boolean>
  isMobileOpen: Ref<boolean>
  isHovered: Ref<boolean>
  activeItem: Ref<string | null>
  openSubmenu: Ref<string | null>
  toggleSidebar: () => void
  toggleMobileSidebar: () => void
  setIsHovered: (isHovered: boolean) => void
  setActiveItem: (item: string | null) => void
  toggleSubmenu: (item: string) => void
  handleMouseEnter: () => void
  handleMouseLeave: () => void
  startAutoHideTimer: () => void
  clearAutoHideTimer: () => void
}

const SidebarSymbol = Symbol()

export function useSidebarProvider() {
  const isExpanded = ref(true)
  const isMobileOpen = ref(false)
  const isMobile = ref(false)
  const isHovered = ref(false)
  const activeItem = ref<string | null>(null)
  const openSubmenu = ref<string | null>(null)
  const autoHideTimeout = ref<NodeJS.Timeout | null>(null)

  const handleResize = () => {
    const mobile = window.innerWidth < 768
    isMobile.value = mobile
    if (!mobile) {
      isMobileOpen.value = false
    }
  }

  onMounted(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    clearAutoHideTimer()
  })

  const toggleSidebar = () => {
    if (isMobile.value) {
      isMobileOpen.value = !isMobileOpen.value
    } else {
      isExpanded.value = !isExpanded.value
      // Si se abre la sidebar, iniciar timer de auto-ocultar
      if (isExpanded.value) {
        startAutoHideTimer()
      } else {
        clearAutoHideTimer()
      }
    }
  }

  const toggleMobileSidebar = () => {
    isMobileOpen.value = !isMobileOpen.value
  }

  const setIsHovered = (value: boolean) => {
    isHovered.value = value
  }

  const setActiveItem = (item: string | null) => {
    activeItem.value = item
  }

  const toggleSubmenu = (item: string) => {
    openSubmenu.value = openSubmenu.value === item ? null : item
  }

  const startAutoHideTimer = () => {
    // Limpiar timer anterior si existe
    if (autoHideTimeout.value) {
      clearTimeout(autoHideTimeout.value)
    }
    
    // Solo auto-ocultar en desktop y si no está siendo hovered
    if (!isMobile.value && !isHovered.value) {
      autoHideTimeout.value = setTimeout(() => {
        if (!isHovered.value) {
          isExpanded.value = false
        }
      }, 2000) // 2 segundos
    }
  }

  const clearAutoHideTimer = () => {
    if (autoHideTimeout.value) {
      clearTimeout(autoHideTimeout.value)
      autoHideTimeout.value = null
    }
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    clearAutoHideTimer()
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    startAutoHideTimer()
  }

  const context: SidebarContextType = {
    isExpanded: computed(() => (isMobile.value ? false : isExpanded.value)),
    isMobileOpen,
    isHovered,
    activeItem,
    openSubmenu,
    toggleSidebar,
    toggleMobileSidebar,
    setIsHovered,
    setActiveItem,
    toggleSubmenu,
    handleMouseEnter,
    handleMouseLeave,
    startAutoHideTimer,
    clearAutoHideTimer,
  }

  provide(SidebarSymbol, context)

  return context
}

export function useSidebar(): SidebarContextType {
  const context = inject<SidebarContextType>(SidebarSymbol)
  if (!context) {
    throw new Error(
      'useSidebar must be used within a component that has SidebarProvider as an ancestor',
    )
  }
  return context
}
