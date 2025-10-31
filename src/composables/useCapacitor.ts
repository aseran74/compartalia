import { onMounted, onUnmounted, ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Keyboard } from '@capacitor/keyboard'
import { Network } from '@capacitor/network'
import { App } from '@capacitor/app'
import { SplashScreen } from '@capacitor/splash-screen'

export function useCapacitor() {
  const isNative = Capacitor.isNativePlatform()
  const platform = Capacitor.getPlatform()
  const isOnline = ref(true)

  const initCapacitor = async () => {
    if (!isNative) {
      console.log('🌐 Running on web platform')
      return
    }

    console.log('📱 Running on native platform:', platform)

    // Añadir clase al body para estilos específicos de plataforma
    if (platform === 'android') {
      document.body.classList.add('android')
    } else if (platform === 'ios') {
      document.body.classList.add('ios')
    }

    try {
      // 1. Configurar Status Bar - Color gris (Solución 2)
      await StatusBar.setOverlaysWebView({ overlay: false }) // Sin overlay, status bar con su propio color
      await StatusBar.setBackgroundColor({ color: '#6b7280' }) // Gris (gray-500 de Tailwind)
      await StatusBar.setStyle({ style: Style.Light }) // Iconos blancos para status bar gris oscuro
      await StatusBar.show()
      console.log('✅ Status Bar configured (gray color)')
      
      // 2. Configurar Keyboard
      Keyboard.setResizeMode({ mode: 'native' })
      Keyboard.setAccessoryBarVisible({ isVisible: true })
      
      // Listeners del teclado
      Keyboard.addListener('keyboardWillShow', (info) => {
        console.log('⌨️ Keyboard will show with height:', info.keyboardHeight)
      })
      
      Keyboard.addListener('keyboardWillHide', () => {
        console.log('⌨️ Keyboard will hide')
      })
      
      console.log('✅ Keyboard configured')
      
      // 3. Ocultar Splash Screen después de un delay
      setTimeout(async () => {
        try {
          await SplashScreen.hide()
          console.log('✅ Splash Screen hidden')
        } catch (error) {
          console.warn('⚠️ Could not hide splash screen:', error)
        }
      }, 2000)

      // 4. Configurar Network Status
      const status = await Network.getStatus()
      isOnline.value = status.connected
      console.log('📡 Network status:', status.connected ? 'Connected' : 'Disconnected')

      // 5. Listeners para App lifecycle
      setupAppListeners()
      
      console.log('✅ Capacitor initialized successfully')
      console.log('📱 Platform class added to body:', platform)
    } catch (error) {
      console.error('❌ Error initializing Capacitor:', error)
    }
  }

  const setupAppListeners = () => {
    // Network Status Listener
    Network.addListener('networkStatusChange', (status) => {
      isOnline.value = status.connected
      console.log('📡 Network status changed:', status.connected ? 'Connected' : 'Disconnected')
      
      if (!status.connected) {
        console.warn('⚠️ Device is offline')
      }
    })

    // App State Change Listener
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('📱 App state changed. Is active:', isActive)
    })

    // Back Button Listener (Android)
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back()
      } else {
        App.exitApp()
      }
    })

    // URL Listener (Deep Links)
    App.addListener('appUrlOpen', (data) => {
      console.log('🔗 App opened with URL:', data.url)
    })
  }

  const removeAppListeners = () => {
    Network.removeAllListeners()
    App.removeAllListeners()
  }

  onMounted(() => {
    initCapacitor()
  })

  onUnmounted(() => {
    if (isNative) {
      removeAppListeners()
    }
  })

  return {
    isNative,
    platform,
    isOnline,
    initCapacitor
  }
}

