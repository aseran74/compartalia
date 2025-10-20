<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-2 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="opacity-100 translate-y-0 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0 sm:translate-x-0"
      leave-to-class="opacity-0 translate-y-2 sm:translate-y-0 sm:translate-x-2"
    >
      <div
        v-if="isVisible"
        class="fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <div v-if="type === 'success'" class="w-6 h-6 text-green-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div v-else-if="type === 'error'" class="w-6 h-6 text-red-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <div v-else-if="type === 'warning'" class="w-6 h-6 text-yellow-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div v-else class="w-6 h-6 text-blue-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium text-gray-900">{{ title }}</p>
              <p class="mt-1 text-sm text-gray-500">{{ message }}</p>
              <div v-if="actions && actions.length > 0" class="mt-3 flex space-x-2">
                <button
                  v-for="action in actions"
                  :key="action.label"
                  @click="handleAction(action)"
                  class="text-sm font-medium rounded-md px-3 py-1.5 transition-colors"
                  :class="action.class || 'bg-green-600 text-white hover:bg-green-700'"
                >
                  {{ action.label }}
                </button>
              </div>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="close"
                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <span class="sr-only">Close</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface ToastAction {
  label: string
  class?: string
  action: () => void
}

interface Props {
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  actions?: ToastAction[]
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 5000,
  actions: () => []
})

const emit = defineEmits<{
  close: []
}>()

const isVisible = ref(false)
let timeoutId: number | null = null

onMounted(() => {
  isVisible.value = true
  
  if (props.duration > 0) {
    timeoutId = window.setTimeout(() => {
      close()
    }, props.duration)
  }
})

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})

const close = () => {
  isVisible.value = false
  setTimeout(() => {
    emit('close')
  }, 300) // Wait for transition to complete
}

const handleAction = (action: ToastAction) => {
  action.action()
  close()
}
</script>
