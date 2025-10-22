<template>
  <div class="relative">
    <input
      :value="modelValue"
      @input="handleInput"
      @focus="showSuggestions = true"
      @blur="handleBlur"
      :placeholder="placeholder"
      :class="inputClass"
      type="text"
      autocomplete="off"
    />
    
    <!-- Sugerencias -->
    <div
      v-if="showSuggestions && suggestions.length > 0"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <div
        v-for="(suggestion, index) in suggestions"
        :key="suggestion.id"
        @mousedown="selectSuggestion(suggestion)"
        :class="[
          'px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0',
          index === selectedIndex ? 'bg-blue-50' : ''
        ]"
      >
        <div class="font-medium text-gray-900">{{ suggestion.name }}</div>
        <div class="text-sm text-gray-500">{{ suggestion.address }}</div>
      </div>
    </div>
    
    <!-- Loading indicator -->
    <div
      v-if="isLoading"
      class="absolute right-3 top-1/2 transform -translate-y-1/2"
    >
      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

interface Suggestion {
  id: string
  name: string
  address: string
  coordinates?: {
    lat: number
    lng: number
  }
}

interface Props {
  modelValue: string
  placeholder?: string
  inputClass?: string
  suggestions: Suggestion[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  inputClass: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent',
  isLoading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'select': [suggestion: Suggestion]
  'input': [value: string]
}>()

const showSuggestions = ref(false)
const selectedIndex = ref(-1)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  emit('update:modelValue', value)
  emit('input', value)
  showSuggestions.value = true
  selectedIndex.value = -1
}

const selectSuggestion = (suggestion: Suggestion) => {
  emit('update:modelValue', suggestion.name)
  emit('select', suggestion)
  showSuggestions.value = false
  selectedIndex.value = -1
}

const handleBlur = () => {
  // Delay para permitir que el click en la sugerencia se procese
  setTimeout(() => {
    showSuggestions.value = false
    selectedIndex.value = -1
  }, 200)
}

// Watch para cerrar sugerencias cuando no hay input
watch(() => props.modelValue, (newValue) => {
  if (!newValue || newValue.length < 2) {
    showSuggestions.value = false
  }
})
</script>
