<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
      <div class="p-6 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-bold text-gray-900">💳 Método de Pago</h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="p-6">
        <!-- Resumen del pago -->
        <div class="bg-blue-50 rounded-lg p-4 mb-6">
          <div class="flex justify-between items-center">
            <span class="font-medium text-gray-900">Total a pagar:</span>
            <span class="text-2xl font-bold text-blue-600">
              {{ totalAmount.toFixed(2) }}€
            </span>
          </div>
          <div class="text-sm text-gray-600 mt-1">
            {{ seats }} asiento{{ seats > 1 ? 's' : '' }} × {{ pricePerSeat }}€
          </div>
        </div>

        <!-- Métodos de pago -->
        <div class="space-y-4">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Selecciona método de pago:</h4>
          
          <!-- Efectivo al conductor -->
          <div
            @click="selectPaymentMethod('cash')"
            :class="[
              'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
              selectedMethod === 'cash' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'
            ]"
          >
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span class="text-2xl">💵</span>
              </div>
              <div class="flex-1">
                <h5 class="font-semibold text-gray-900">Efectivo al conductor</h5>
                <p class="text-sm text-gray-600">Paga directamente al conductor al inicio del viaje</p>
              </div>
              <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                   :class="selectedMethod === 'cash' ? 'border-green-500 bg-green-500' : 'border-gray-300'">
                <div v-if="selectedMethod === 'cash'" class="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          <!-- Bizum -->
          <div
            @click="selectPaymentMethod('bizum')"
            :class="[
              'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
              selectedMethod === 'bizum' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            ]"
          >
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-2xl">📱</span>
              </div>
              <div class="flex-1">
                <h5 class="font-semibold text-gray-900">Bizum</h5>
                <p class="text-sm text-gray-600">Pago instantáneo por móvil</p>
              </div>
              <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                   :class="selectedMethod === 'bizum' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'">
                <div v-if="selectedMethod === 'bizum'" class="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          <!-- Stripe -->
          <div
            @click="selectPaymentMethod('stripe')"
            :class="[
              'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
              selectedMethod === 'stripe' 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-200 hover:border-gray-300'
            ]"
          >
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span class="text-2xl">💳</span>
              </div>
              <div class="flex-1">
                <h5 class="font-semibold text-gray-900">Tarjeta de crédito/débito</h5>
                <p class="text-sm text-gray-600">Pago seguro con Stripe</p>
              </div>
              <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                   :class="selectedMethod === 'stripe' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'">
                <div v-if="selectedMethod === 'stripe'" class="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información adicional según método seleccionado -->
        <div v-if="selectedMethod" class="mt-6 p-4 bg-gray-50 rounded-lg">
          <div v-if="selectedMethod === 'cash'" class="text-sm text-gray-700">
            <p class="font-medium mb-2">💰 Pago en efectivo:</p>
            <ul class="list-disc list-inside space-y-1">
              <li>Paga directamente al conductor al inicio del viaje</li>
              <li>No hay comisiones adicionales</li>
              <li>Asegúrate de tener el cambio exacto</li>
            </ul>
          </div>
          
          <div v-if="selectedMethod === 'bizum'" class="text-sm text-gray-700">
            <p class="font-medium mb-2">📱 Pago por Bizum:</p>
            <ul class="list-disc list-inside space-y-1">
              <li>El conductor te enviará una solicitud de Bizum</li>
              <li>Pago instantáneo y seguro</li>
              <li>Sin comisiones para el usuario</li>
            </ul>
          </div>
          
          <div v-if="selectedMethod === 'stripe'" class="text-sm text-gray-700">
            <p class="font-medium mb-2">💳 Pago con tarjeta:</p>
            <ul class="list-disc list-inside space-y-1">
              <li>Pago procesado de forma segura por Stripe</li>
              <li>Acepta todas las tarjetas principales</li>
              <li>Protección completa del comprador</li>
            </ul>
          </div>
        </div>

        <!-- Botones -->
        <div class="flex space-x-3 pt-6">
          <button
            type="button"
            @click="closeModal"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="processPayment"
            :disabled="!selectedMethod || isProcessing"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="isProcessing">Procesando...</span>
            <span v-else>Continuar con {{ getPaymentMethodLabel() }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { stripeService } from '@/services/stripeService'

interface Props {
  isOpen: boolean
  totalAmount: number
  seats: number
  pricePerSeat: number
  tripId: string
  bookingData: any
}

interface Emits {
  (e: 'close'): void
  (e: 'payment-success', paymentData: any): void
  (e: 'payment-error', error: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedMethod = ref<'cash' | 'bizum' | 'stripe' | null>(null)
const isProcessing = ref(false)

const selectPaymentMethod = (method: 'cash' | 'bizum' | 'stripe') => {
  selectedMethod.value = method
}

const getPaymentMethodLabel = () => {
  switch (selectedMethod.value) {
    case 'cash': return 'Efectivo'
    case 'bizum': return 'Bizum'
    case 'stripe': return 'Tarjeta'
    default: return 'Pago'
  }
}

const processPayment = async () => {
  if (!selectedMethod.value) return
  
  isProcessing.value = true
  
  try {
    let paymentResult
    
    switch (selectedMethod.value) {
      case 'cash':
        paymentResult = await processCashPayment()
        break
      case 'bizum':
        paymentResult = await processBizumPayment()
        break
      case 'stripe':
        paymentResult = await processStripePayment()
        break
    }
    
    if (paymentResult.success) {
      emit('payment-success', {
        method: selectedMethod.value,
        amount: props.totalAmount,
        transactionId: paymentResult.transactionId,
        bookingData: props.bookingData,
        message: paymentResult.message
      })
    } else {
      emit('payment-error', paymentResult.error || 'Error en el procesamiento del pago')
    }
  } catch (error: any) {
    console.error('Error procesando pago:', error)
    emit('payment-error', error.message || 'Error inesperado en el pago')
  } finally {
    isProcessing.value = false
  }
}

const processCashPayment = async () => {
  // Simular procesamiento de pago en efectivo
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    success: true,
    transactionId: `CASH_${Date.now()}`,
    message: 'Reserva confirmada. Paga al conductor al inicio del viaje.'
  }
}

const processBizumPayment = async () => {
  // Simular procesamiento de Bizum
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  return {
    success: true,
    transactionId: `BIZUM_${Date.now()}`,
    message: 'Solicitud de Bizum enviada al conductor.'
  }
}

const processStripePayment = async () => {
  try {
    // Usar el servicio de Stripe
    const result = await stripeService.processPaymentSimple(
      props.totalAmount,
      props.tripId,
      props.bookingData
    )
    
    return result
  } catch (error: any) {
    console.error('Error procesando pago con Stripe:', error)
    return {
      success: false,
      error: error.message || 'Error procesando el pago con tarjeta'
    }
  }
}

const closeModal = () => {
  emit('close')
  selectedMethod.value = null
  isProcessing.value = false
}
</script>
