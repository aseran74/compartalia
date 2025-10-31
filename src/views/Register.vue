<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-6 sm:space-y-8">
      <div class="mb-6 sm:mb-8">
        <img class="mx-auto h-12 w-auto mb-6 sm:mb-8" src="/images/logo/Compartalia2.png" alt="Compartalia" />
        <h2 class="text-center text-3xl font-extrabold text-gray-900">
          Crea tu cuenta
        </h2>
        <p class="mt-3 sm:mt-4 text-center text-sm text-gray-600">
          O
          <router-link to="/login" class="font-medium text-green-600 hover:text-green-500">
            inicia sesión aquí
          </router-link>
        </p>
      </div>
      <form class="space-y-5 sm:space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4 sm:space-y-5">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
            <input
              id="name"
              v-model="form.name"
              name="name"
              type="text"
              required
              class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-shadow"
              placeholder="Tu nombre completo"
            />
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-shadow"
              placeholder="tu@email.com"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-shadow"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">Confirmar contraseña</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-shadow"
              placeholder="Repite tu contraseña"
            />
          </div>
        </div>

        <div class="flex items-start pt-2">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            class="h-4 w-4 mt-1 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label for="terms" class="ml-3 block text-sm text-gray-900 leading-relaxed">
            Acepto los 
            <a href="#" class="text-green-600 hover:text-green-500 underline">términos y condiciones</a>
          </label>
        </div>

        <div class="pt-2">
          <button
            type="submit"
            :disabled="isLoading || !isFormValid"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
          >
            <span v-if="isLoading">Creando cuenta...</span>
            <span v-else>Crear cuenta</span>
          </button>
        </div>

        <div class="pt-4 sm:pt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-3 bg-gray-50 text-gray-500">O regístrate con</span>
            </div>
          </div>

          <div class="mt-5 sm:mt-6 grid grid-cols-1 gap-3">
            <button
              @click="handleGoogleRegister"
              type="button"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="ml-2">Google</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { supabase } from '@/config/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const isLoading = ref(false)

const isFormValid = computed(() => {
  return form.name && 
         form.email && 
         form.password && 
         form.password === form.confirmPassword && 
         form.password.length >= 6
})

const handleRegister = async () => {
  if (!isFormValid.value) {
    alert('Por favor, completa todos los campos correctamente')
    return
  }

  isLoading.value = true
  try {
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name
        }
      }
    })
    
    if (error) {
      alert('Error al crear la cuenta: ' + error.message)
    } else {
      alert('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.')
      router.push('/login')
    }
  } catch (error) {
    alert('Error inesperado: ' + error)
  } finally {
    isLoading.value = false
  }
}

const handleGoogleRegister = async () => {
  isLoading.value = true
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    
    if (error) {
      alert('Error al registrarse con Google: ' + error.message)
    }
  } catch (error) {
    alert('Error inesperado: ' + error)
  } finally {
    isLoading.value = false
  }
}
</script>
