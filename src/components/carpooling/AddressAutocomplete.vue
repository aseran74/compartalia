<template>
  <div class="relative">
    <!-- Input de dirección -->
    <div class="relative">
      <input
        :value="modelValue"
        @input="handleInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="handleKeydown"
        type="text"
        :placeholder="placeholder"
        :class="inputClasses"
        :required="required"
        autocomplete="off"
      />
      
      <!-- Icono de ubicación -->
      <span class="absolute right-4 top-4">
        <svg class="h-5 w-5 text-body-color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </span>

      <!-- Indicador de carga -->
      <div v-if="isLoading" class="absolute right-12 top-4">
        <svg class="h-4 w-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </div>

    <!-- Lista de sugerencias -->
    <div
      v-if="showSuggestions && suggestions.length > 0"
      class="absolute z-50 mt-1 w-full rounded-md border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark"
    >
      <div class="max-h-60 overflow-auto">
        <div
          v-for="(suggestion, index) in suggestions"
          :key="suggestion.id"
          @mousedown="selectSuggestion(suggestion)"
          :class="[
            'cursor-pointer px-4 py-3 text-sm transition-colors',
            index === selectedIndex
              ? 'bg-primary text-white'
              : 'text-black hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700'
          ]"
        >
          <div class="flex items-start space-x-3">
            <div class="mt-0.5">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-medium">{{ suggestion.name }}</p>
              <p class="text-xs opacity-75">{{ suggestion.address }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón de ubicación actual -->
    <div
      v-if="showCurrentLocation && !modelValue"
      class="mt-2 flex items-center justify-between"
    >
      <button
        @click="getCurrentLocation"
        :disabled="isGettingLocation"
        class="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 disabled:opacity-50"
      >
        <svg v-if="!isGettingLocation" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <svg v-else class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ isGettingLocation ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual' }}</span>
      </button>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="mt-1 text-xs text-red-500">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import type { Location } from '@/types/carpooling';
import { geolocationService } from '@/services/geolocation';

interface Props {
  modelValue: string;
  placeholder?: string;
  required?: boolean;
  showCurrentLocation?: boolean;
  class?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'select', location: Location): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Ingresa una dirección...',
  required: false,
  showCurrentLocation: true,
  class: ''
});

const emit = defineEmits<Emits>();

// Estado del componente
const suggestions = ref<Location[]>([]);
const selectedIndex = ref(-1);
const showSuggestions = ref(false);
const isLoading = ref(false);
const isGettingLocation = ref(false);
const error = ref('');

// Debounce para evitar demasiadas llamadas a la API
let debounceTimer: NodeJS.Timeout | null = null;

// Clases del input
const inputClasses = computed(() => {
  const baseClasses = 'w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary';
  return `${baseClasses} ${props.class}`;
});

// Métodos
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  
  emit('update:modelValue', value);
  error.value = '';
  
  if (value.length < 2) {
    suggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  // Debounce para evitar demasiadas llamadas
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
    await searchAddresses(value);
  }, 300);
};

const searchAddresses = async (query: string) => {
  isLoading.value = true;
  showSuggestions.value = true;
  
  try {
    const results = await geolocationService.autocompleteAddress(query);
    suggestions.value = results;
    selectedIndex.value = -1;
  } catch (err) {
    error.value = 'Error al buscar direcciones';
    suggestions.value = [];
  } finally {
    isLoading.value = false;
  }
};

const selectSuggestion = (suggestion: Location) => {
  emit('update:modelValue', suggestion.address);
  emit('select', suggestion);
  suggestions.value = [];
  showSuggestions.value = false;
  selectedIndex.value = -1;
};

const handleKeydown = (event: KeyboardEvent) => {
  if (!showSuggestions.value || suggestions.value.length === 0) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      selectedIndex.value = Math.min(selectedIndex.value + 1, suggestions.value.length - 1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1);
      break;
    case 'Enter':
      event.preventDefault();
      if (selectedIndex.value >= 0 && selectedIndex.value < suggestions.value.length) {
        selectSuggestion(suggestions.value[selectedIndex.value]);
      }
      break;
    case 'Escape':
      suggestions.value = [];
      showSuggestions.value = false;
      selectedIndex.value = -1;
      break;
  }
};

const onFocus = () => {
  if (suggestions.value.length > 0) {
    showSuggestions.value = true;
  }
};

const onBlur = () => {
  // Delay para permitir que el click en las sugerencias se procese
  setTimeout(() => {
    showSuggestions.value = false;
    selectedIndex.value = -1;
  }, 150);
};

const getCurrentLocation = async () => {
  isGettingLocation.value = true;
  error.value = '';
  
  try {
    const location = await geolocationService.getCurrentLocation();
    if (location) {
      emit('update:modelValue', location.address);
      emit('select', location);
    } else {
      error.value = 'No se pudo obtener la ubicación actual';
    }
  } catch (err) {
    error.value = 'Error al obtener la ubicación';
  } finally {
    isGettingLocation.value = false;
  }
};

// Limpiar timer al desmontar
const cleanup = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
};

// Cleanup al desmontar
import { onUnmounted } from 'vue';
onUnmounted(cleanup);
</script>
