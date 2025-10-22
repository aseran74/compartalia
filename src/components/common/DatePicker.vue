<template>
  <div class="relative">
    <div class="relative">
      <input
        :value="formattedDate"
        @click="toggleCalendar"
        @blur="handleBlur"
        type="text"
        :placeholder="placeholder"
        :class="inputClass"
        readonly
      />
      <button
        @click="toggleCalendar"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </button>
    </div>

    <!-- Calendario -->
    <div
      v-if="showCalendar"
      class="absolute z-50 mt-1 w-full rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark"
    >
      <!-- Header del calendario -->
      <div class="flex items-center justify-between border-b border-stroke p-4 dark:border-strokedark">
        <button
          @click="previousMonth"
          type="button"
          class="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        
        <h3 class="text-lg font-semibold text-black dark:text-white">
          {{ monthNames[currentMonth] }} {{ currentYear }}
        </h3>
        
        <button
          @click="nextMonth"
          type="button"
          class="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <!-- Días de la semana -->
      <div class="grid grid-cols-7 gap-1 p-2">
        <div
          v-for="day in weekDays"
          :key="day"
          class="p-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          {{ day }}
        </div>
      </div>

      <!-- Días del mes -->
      <div class="grid grid-cols-7 gap-1 p-2">
        <div
          v-for="day in calendarDays"
          :key="`${day.date}-${day.month}-${day.year}`"
          @click="selectDate(day)"
          :class="[
            'p-2 text-center text-sm rounded-lg cursor-pointer transition-colors',
            day.isCurrentMonth
              ? 'text-black dark:text-white hover:bg-primary hover:text-white'
              : 'text-gray-400 dark:text-gray-600',
            day.isToday
              ? 'bg-primary/10 text-primary font-semibold'
              : '',
            day.isSelected
              ? 'bg-primary text-white font-semibold'
              : ''
          ]"
        >
          {{ day.date }}
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex items-center justify-between border-t border-stroke p-4 dark:border-strokedark">
        <button
          @click="selectToday"
          type="button"
          class="text-sm text-primary hover:text-primary-dark"
        >
          Hoy
        </button>
        <button
          @click="selectTomorrow"
          type="button"
          class="text-sm text-primary hover:text-primary-dark"
        >
          Mañana
        </button>
        <button
          @click="closeCalendar"
          type="button"
          class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Props {
  modelValue?: string
  placeholder?: string
  inputClass?: string
  minDate?: string
  maxDate?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Selecciona una fecha',
  inputClass: 'w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary',
  minDate: '',
  maxDate: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showCalendar = ref(false)
const currentDate = ref(new Date())
const selectedDate = ref<Date | null>(null)

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const formattedDate = computed(() => {
  if (!selectedDate.value) return ''
  return selectedDate.value.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const today = new Date()
  
  // Primer día del mes
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // Días del mes anterior para completar la primera semana
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const current = new Date(startDate)
  
  // Generar 42 días (6 semanas)
  for (let i = 0; i < 42; i++) {
    const isCurrentMonth = current.getMonth() === month
    const isToday = current.toDateString() === today.toDateString()
    const isSelected = selectedDate.value ? current.toDateString() === selectedDate.value.toDateString() : false
    
    days.push({
      date: current.getDate(),
      month: current.getMonth(),
      year: current.getFullYear(),
      isCurrentMonth,
      isToday,
      isSelected,
      fullDate: new Date(current)
    })
    
    current.setDate(current.getDate() + 1)
  }
  
  return days
})

const toggleCalendar = () => {
  showCalendar.value = !showCalendar.value
}

const closeCalendar = () => {
  showCalendar.value = false
}

const handleBlur = () => {
  // Delay para permitir que los clicks en el calendario se procesen
  setTimeout(() => {
    showCalendar.value = false
  }, 200)
}

const selectDate = (day: any) => {
  if (!day.isCurrentMonth) return
  
  selectedDate.value = day.fullDate
  emit('update:modelValue', day.fullDate.toISOString().split('T')[0])
  closeCalendar()
}

const selectToday = () => {
  const today = new Date()
  selectedDate.value = today
  emit('update:modelValue', today.toISOString().split('T')[0])
  closeCalendar()
}

const selectTomorrow = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  selectedDate.value = tomorrow
  emit('update:modelValue', tomorrow.toISOString().split('T')[0])
  closeCalendar()
}

const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

// Inicializar con el valor del modelo
onMounted(() => {
  if (props.modelValue) {
    selectedDate.value = new Date(props.modelValue)
  }
})
</script>
