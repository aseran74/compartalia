<template>
  <div class="relative">
    <!-- Input que muestra la fecha seleccionada -->
    <input
      :value="formattedDate"
      @click="toggleCalendar"
      @focus="toggleCalendar"
      readonly
      :placeholder="placeholder"
      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
    />
    
    <!-- Icono de calendario -->
    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
      <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
    </div>

    <!-- Calendario desplegable -->
    <div
      v-if="isOpen"
      class="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg"
    >
      <!-- Header del calendario -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          @click="previousMonth"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <h3 class="text-lg font-semibold text-gray-900">
          {{ monthNames[currentMonth] }} {{ currentYear }}
        </h3>
        
        <button
          @click="nextMonth"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>

      <!-- Días de la semana -->
      <div class="grid grid-cols-7 gap-1 p-2">
        <div
          v-for="day in weekDays"
          :key="day"
          class="text-center text-sm font-medium text-gray-500 py-2"
        >
          {{ day }}
        </div>
      </div>

      <!-- Días del mes -->
      <div class="grid grid-cols-7 gap-1 p-2">
        <button
          v-for="day in calendarDays"
          :key="`${day.date}-${day.month}-${day.year}`"
          @click="selectDate(day)"
          :disabled="day.disabled"
          :class="[
            'p-2 text-sm rounded-lg transition-colors',
            day.disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100',
            day.isToday ? 'bg-blue-100 text-blue-600 font-semibold' : '',
            day.isSelected ? 'bg-green-600 text-white font-semibold' : 'text-gray-700',
            day.isCurrentMonth ? '' : 'text-gray-400'
          ]"
        >
          {{ day.date }}
        </button>
      </div>

      <!-- Botones de acción -->
      <div class="flex justify-between p-4 border-t border-gray-200">
        <button
          @click="selectToday"
          class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Hoy
        </button>
        <button
          @click="clearDate"
          class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Limpiar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  modelValue?: string
  placeholder?: string
  minDate?: string
  maxDate?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Selecciona una fecha',
  minDate: '',
  maxDate: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const currentDate = ref(new Date())
const selectedDate = ref<Date | null>(null)

const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const formattedDate = computed(() => {
  if (!selectedDate.value) return ''
  return selectedDate.value.toISOString().split('T')[0]
})

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const isCurrentMonth = date.getMonth() === month
    const isToday = date.getTime() === today.getTime()
    const isSelected = selectedDate.value && date.getTime() === selectedDate.value.getTime()
    
    // Verificar si la fecha está deshabilitada
    const dateStr = date.toISOString().split('T')[0]
    const isDisabled = (props.minDate && dateStr < props.minDate) || 
                      (props.maxDate && dateStr > props.maxDate) ||
                      date < today
    
    days.push({
      date: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      fullDate: date,
      isCurrentMonth,
      isToday,
      isSelected,
      disabled: isDisabled
    })
  }
  
  return days
})

const toggleCalendar = () => {
  isOpen.value = !isOpen.value
}

const selectDate = (day: any) => {
  if (day.disabled) return
  
  selectedDate.value = day.fullDate
  emit('update:modelValue', formattedDate.value)
  isOpen.value = false
}

const selectToday = () => {
  const today = new Date()
  selectedDate.value = today
  emit('update:modelValue', formattedDate.value)
  isOpen.value = false
}

const clearDate = () => {
  selectedDate.value = null
  emit('update:modelValue', '')
  isOpen.value = false
}

const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    isOpen.value = false
  }
}

onMounted(() => {
  if (props.modelValue) {
    selectedDate.value = new Date(props.modelValue)
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
