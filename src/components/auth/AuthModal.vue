<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
      <div class="text-center mb-6">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          {{ isLogin ? 'Iniciar Sesión' : 'Crear Cuenta' }}
        </h2>
        <p class="text-gray-600">
          {{ isLogin ? 'Accede a tu cuenta de Compartalia' : 'Únete a la comunidad de carpooling' }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Name field (only for register) -->
        <div v-if="!isLogin">
          <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Tu nombre completo"
          />
        </div>

        <!-- Role field (only for register) -->
        <div v-if="!isLogin">
          <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de usuario</label>
          <select
            v-model="form.role"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="pasajero">Pasajero</option>
            <option value="conductor">Conductor</option>
          </select>
        </div>

        <!-- Email field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="tu@email.com"
          />
        </div>

        <!-- Password field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <!-- Error message -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error }}
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-150 ease-in-out"
          :class="isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'"
        >
          {{ isLoading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta') }}
        </button>

        <!-- Botón de usuario de prueba -->
        <button
          v-if="!isLogin"
          type="button"
          @click="createTestUser"
          :disabled="isLoading"
          class="w-full mt-2 py-2 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition duration-150 ease-in-out"
        >
          Crear Usuario de Prueba
        </button>

        <!-- Divider -->
        <div class="relative my-4">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">O continúa con</span>
          </div>
        </div>

        <!-- Botón de Google -->
        <button
          type="button"
          @click="handleGoogleLogin"
          :disabled="isLoading"
          class="w-full py-3 px-4 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition duration-150 ease-in-out flex items-center justify-center space-x-3"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continuar con Google</span>
        </button>

        <!-- Credenciales de prueba -->
        <div v-if="isLogin" class="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-sm font-medium text-gray-700 mb-3">Credenciales de Prueba:</h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between">
              <span class="font-medium">Admin:</span>
              <div class="text-gray-600">
                <div>administrador@compartalia.com</div>
                <div>admin123</div>
              </div>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Test:</span>
              <div class="text-gray-600">
                <div>test@compartalia.com</div>
                <div>123456</div>
              </div>
            </div>
          </div>
          <div class="mt-3 flex space-x-2">
            <button
              type="button"
              @click="fillCredentials('administrador@compartalia.com', 'admin123')"
              class="flex-1 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Usar Admin
            </button>
            <button
              type="button"
              @click="fillCredentials('test@compartalia.com', '123456')"
              class="flex-1 px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Usar Test
            </button>
          </div>
          <div class="mt-3 flex space-x-2">
            <button
              type="button"
              @click="createTestUsers()"
              :disabled="isLoading"
              class="w-full px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition disabled:opacity-50"
            >
              {{ isLoading ? 'Creando...' : 'Crear Usuarios de Prueba' }}
            </button>
          </div>
        </div>

        <!-- Toggle between login and register -->
        <div class="text-center">
          <button
            type="button"
            @click="toggleMode"
            class="text-green-600 hover:text-green-700 font-medium"
          >
            {{ isLogin ? '¿No tienes cuenta? Crear una' : '¿Ya tienes cuenta? Iniciar sesión' }}
          </button>
        </div>
      </form>

      <!-- Close button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { auth } from '@/config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

interface Props {
  isOpen: boolean;
  defaultMode?: 'login' | 'register';
}

interface Emits {
  (e: 'close'): void;
  (e: 'success'): void;
}

const props = withDefaults(defineProps<Props>(), {
  defaultMode: 'login'
});

const emit = defineEmits<Emits>();

const { login, register } = useAuth();

const isLogin = ref(props.defaultMode === 'login');
const isLoading = ref(false);
const error = ref('');

const form = reactive({
  name: '',
  email: '',
  password: '',
  role: 'pasajero' as 'conductor' | 'pasajero'
});

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    error.value = '';

    if (isLogin.value) {
      await login(form.email, form.password);
    } else {
      await register(form.email, form.password, form.name, form.role);
    }

    emit('success');
    emit('close');
  } catch (err: any) {
    error.value = err.message || 'Ha ocurrido un error. Inténtalo de nuevo.';
  } finally {
    isLoading.value = false;
  }
};

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  error.value = '';
  // Reset form
  form.name = '';
  form.email = '';
  form.password = '';
  form.role = 'pasajero';
};

const fillCredentials = (email: string, password: string) => {
  form.email = email;
  form.password = password;
  error.value = '';
};

const createTestUsers = async () => {
  try {
    isLoading.value = true;
    error.value = '';

    console.log('=== CREANDO USUARIOS DE PRUEBA ===');

    // Crear usuario admin usando Firebase directamente
    try {
      console.log('Creando usuario admin...');
      const adminCredential = await createUserWithEmailAndPassword(auth, 'administrador@compartalia.com', 'admin123');
      console.log('✅ Usuario admin creado exitosamente:', adminCredential.user.email);
    } catch (err: any) {
      console.log('❌ Error creando admin:', err.code, err.message);
      if (err.code === 'auth/email-already-in-use') {
        console.log('ℹ️ Usuario admin ya existe');
      } else if (err.code === 'auth/too-many-requests') {
        console.log('⚠️ Demasiadas solicitudes. Espera unos minutos antes de intentar de nuevo.');
      } else {
        console.error('❌ Error inesperado creando admin:', err);
      }
    }

    // Esperar un poco antes de crear el segundo usuario
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Crear usuario test usando Firebase directamente
    try {
      console.log('Creando usuario test...');
      const testCredential = await createUserWithEmailAndPassword(auth, 'test@compartalia.com', '123456');
      console.log('✅ Usuario test creado exitosamente:', testCredential.user.email);
    } catch (err: any) {
      console.log('❌ Error creando test:', err.code, err.message);
      if (err.code === 'auth/email-already-in-use') {
        console.log('ℹ️ Usuario test ya existe');
      } else if (err.code === 'auth/too-many-requests') {
        console.log('⚠️ Demasiadas solicitudes. Espera unos minutos antes de intentar de nuevo.');
      } else {
        console.error('❌ Error inesperado creando test:', err);
      }
    }

    console.log('=== FIN CREACIÓN USUARIOS ===');

    // Mostrar mensaje de éxito
    error.value = 'Usuarios de prueba procesados. Si ves errores de "too-many-requests", espera unos minutos y vuelve a intentar.';
    
  } catch (err: any) {
    console.error('❌ Error general creando usuarios:', err);
    error.value = err.message || 'Error al crear usuarios de prueba';
  } finally {
    isLoading.value = false;
  }
};

const createTestUser = async () => {
  try {
    isLoading.value = true;
    error.value = '';

    // Datos de usuario de prueba
    const testEmail = 'test@compartalia.com';
    const testPassword = '123456';
    const testName = 'Usuario de Prueba';
    const testRole = 'pasajero';

    await register(testEmail, testPassword, testName, testRole);
    
    emit('success');
    emit('close');
  } catch (err: any) {
    error.value = err.message || 'Error al crear usuario de prueba';
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleLogin = async () => {
  try {
    isLoading.value = true;
    error.value = '';

    // Usar Firebase Auth para Google login
    await loginWithGoogle();
    
    emit('success');
    emit('close');
  } catch (err: any) {
    console.error('Error con Google Auth:', err);
    error.value = err.message || 'Error al iniciar sesión con Google';
  } finally {
    isLoading.value = false;
  }
};
</script>
