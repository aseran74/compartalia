<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <admin-layout>
      <div class="max-w-4xl mx-auto p-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          💬 Soporte
        </h1>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              ¿Necesitas ayuda?
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              Estamos aquí para ayudarte. Contáctanos por cualquiera de estos medios:
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">📧 Email</h3>
              <p class="text-gray-600 dark:text-gray-400">
                soporte@compartalia.com
              </p>
            </div>
            
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">📱 Teléfono</h3>
              <p class="text-gray-600 dark:text-gray-400">
                +34 900 123 456
              </p>
            </div>
          </div>
          
          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Preguntas frecuentes
            </h3>
            <div class="space-y-4">
              <div class="border-l-4 border-green-500 pl-4">
                <h4 class="font-semibold text-gray-900 dark:text-white">¿Cómo reservo un viaje?</h4>
                <p class="text-gray-600 dark:text-gray-400 mt-1">
                  Busca un viaje que te interese y haz clic en "Reservar Ahora".
                </p>
              </div>
              <div class="border-l-4 border-green-500 pl-4">
                <h4 class="font-semibold text-gray-900 dark:text-white">¿Puedo cancelar una reserva?</h4>
                <p class="text-gray-600 dark:text-gray-400 mt-1">
                  Sí, puedes cancelar tu reserva hasta 24 horas antes del viaje.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </admin-layout>
  </div>
</template>

<script setup>
import AdminLayout from '@/components/layout/AdminLayout.vue'
</script>

