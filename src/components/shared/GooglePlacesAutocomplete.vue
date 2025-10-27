<template>
  <div class="relative">
    <input 
      :value="modelValue"
      @input="handleInput"
      @focus="showSuggestions = true"
      @blur="handleBlur"
      type="text"
      :placeholder="placeholder"
      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      :required="required"
    />
    
    <!-- Lista de sugerencias -->
    <div 
      v-if="showSuggestions && suggestions.length > 0"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <button
        v-for="suggestion in suggestions"
        :key="suggestion.place_id"
        type="button"
        @mousedown.prevent="selectSuggestion(suggestion)"
        class="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition"
      >
        <div class="font-medium text-gray-900">
          {{ suggestion.structured_formatting.main_text }}
        </div>
        <div class="text-sm text-gray-500">
          {{ suggestion.structured_formatting.secondary_text }}
        </div>
      </button>
    </div>

    <!-- Loading indicator -->
    <div 
      v-if="loading"
      class="absolute right-3 top-1/2 transform -translate-y-1/2"
    >
      <svg class="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
  required?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'place-selected', place: google.maps.places.AutocompletePrediction): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Escribe una dirección...',
  required: false
})

const emit = defineEmits<Emits>()

const suggestions = ref<google.maps.places.AutocompletePrediction[]>([])
const showSuggestions = ref(false)
const loading = ref(false)
let autocompleteService: google.maps.places.AutocompleteService | null = null
let debounceTimer: NodeJS.Timeout | null = null

// Inicializar Google Places Autocomplete Service
const initAutocompleteService = () => {
  if (window.google && window.google.maps && window.google.maps.places) {
    autocompleteService = new google.maps.places.AutocompleteService()
    console.log('✅ Google Places Autocomplete Service inicializado')
  } else {
    console.warn('⚠️ Google Maps no disponible, reintentando...')
    setTimeout(initAutocompleteService, 500)
  }
}

// Inicializar al montar
initAutocompleteService()

const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)
  
  // Limpiar el timer anterior
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  // Debounce para evitar demasiadas llamadas a la API
  debounceTimer = setTimeout(() => {
    searchPlaces(value)
  }, 300)
}

const searchPlaces = async (input: string) => {
  if (!input || input.length < 3) {
    suggestions.value = []
    return
  }

  if (!autocompleteService) {
    console.warn('⚠️ Autocomplete service no disponible')
    return
  }

  loading.value = true

  try {
    const request: google.maps.places.AutocompleteRequest = {
      input: input,
      componentRestrictions: { country: 'es' },
      types: ['geocode', 'establishment'],
      language: 'es'
    }

    autocompleteService.getPlacePredictions(request, (predictions, status) => {
      loading.value = false
      
      if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
        suggestions.value = predictions
        showSuggestions.value = true
        console.log(`✅ ${predictions.length} sugerencias encontradas`)
      } else {
        suggestions.value = []
        console.warn('⚠️ No se encontraron sugerencias:', status)
      }
    })
  } catch (error) {
    loading.value = false
    console.error('❌ Error buscando lugares:', error)
  }
}

const selectSuggestion = (suggestion: google.maps.places.AutocompletePrediction) => {
  emit('update:modelValue', suggestion.description)
  emit('place-selected', suggestion)
  suggestions.value = []
  showSuggestions.value = false
}

const handleBlur = () => {
  // Delay para permitir el clic en las sugerencias
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}
</script>


