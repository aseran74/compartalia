<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <admin-layout>
      <div class="max-w-4xl mx-auto p-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          ⚙️ Configuración
        </h1>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Preferencias de la cuenta
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              Aquí podrás configurar tus preferencias de cuenta, notificaciones y privacidad.
            </p>
          </div>
          
          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Opciones disponibles próximamente
            </h3>
            <ul class="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• Notificaciones por email</li>
              <li>• Preferencias de privacidad</li>
              <li>• Configuración de perfil</li>
              <li>• Gestión de datos</li>
            </ul>
          </div>
        </div>
      </div>
    </admin-layout>
  </div>
</template>

<script setup>
import AdminLayout from '@/components/layout/AdminLayout.vue'
</script>

