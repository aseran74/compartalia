import { ref, reactive } from 'vue'

export interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  actions?: Array<{
    label: string
    class?: string
    action: () => void
  }>
}

interface Toast extends ToastOptions {
  id: string
}

const toasts = ref<Toast[]>([])

export function useToast() {
  const showToast = (options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: Toast = {
      id,
      type: 'info',
      duration: 5000,
      ...options
    }
    
    toasts.value.push(toast)
    
    // Auto remove after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }
    
    return id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clearAllToasts = () => {
    toasts.value = []
  }

  // Convenience methods
  const success = (title: string, message: string, options?: Partial<ToastOptions>) => {
    return showToast({ type: 'success', title, message, ...options })
  }

  const error = (title: string, message: string, options?: Partial<ToastOptions>) => {
    return showToast({ type: 'error', title, message, ...options })
  }

  const warning = (title: string, message: string, options?: Partial<ToastOptions>) => {
    return showToast({ type: 'warning', title, message, ...options })
  }

  const info = (title: string, message: string, options?: Partial<ToastOptions>) => {
    return showToast({ type: 'info', title, message, ...options })
  }

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info
  }
}
