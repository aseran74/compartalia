# 📱 Configuración de Capacitor - Compartalia

## ✅ Estado Actual

- ✅ Capacitor instalado y configurado
- ✅ Plataformas Android e iOS añadidas
- ✅ Plugins instalados (App, Camera, Filesystem, Geolocation, Haptics, Keyboard, Status Bar)

## 🚀 Pasos para Android Studio

### 1. **Abrir el Proyecto Android en Android Studio**

1. Abre **Android Studio**
2. Selecciona **"Open"** o **"File > Open"**
3. Navega a la carpeta del proyecto y selecciona:
   ```
   vue-tailwind-admin-dashboard-main/android
   ```
4. Espera a que Android Studio indexe y sincronice el proyecto (puede tardar varios minutos la primera vez)

### 2. **Configurar el SDK de Android**

1. Ve a **Tools > SDK Manager**
2. Asegúrate de tener instalado:
   - **Android SDK Platform 33** o superior
   - **Android SDK Build-Tools**
   - **Android SDK Platform-Tools**
   - **Android SDK Tools**
3. También necesitarás:
   - **Android Support Repository**
   - **Google Play Services**

### 3. **Gradle Sync**

1. Cuando Android Studio termine de abrir el proyecto, debería hacer un **Gradle Sync** automático
2. Si no se hace automáticamente, haz clic en el banner que dice **"Sync Now"** o ve a **File > Sync Project with Gradle Files**
3. Espera a que termine (puede tardar varios minutos la primera vez)

### 4. **Configurar el Emulador o Dispositivo Físico**

#### Opción A: Emulador (Recomendado para empezar)

1. Ve a **Tools > Device Manager**
2. Haz clic en **"Create Device"**
3. Selecciona un dispositivo (recomendado: **Pixel 5** o **Pixel 6**)
4. Selecciona una imagen del sistema (recomendado: **Android 13 (API 33)** o superior)
5. Completa el wizard y haz clic en **"Finish"**
6. El emulador se creará y podrás iniciarlo desde Device Manager

#### Opción B: Dispositivo Físico

1. Habilita **"Opciones de desarrollador"** en tu dispositivo Android:
   - Ve a **Configuración > Acerca del teléfono**
   - Toca 7 veces en **"Número de compilación"**
2. Activa **"Depuración USB"**:
   - Ve a **Configuración > Opciones de desarrollador**
   - Activa **"Depuración USB"**
3. Conecta tu dispositivo al ordenador con un cable USB
4. Autoriza la conexión cuando aparezca el diálogo en el dispositivo
5. Verifica que el dispositivo aparece en Android Studio (barra superior)

### 5. **Construir y Ejecutar la App**

1. En la parte superior de Android Studio, verás un selector de dispositivos
2. Selecciona tu emulador o dispositivo físico
3. Haz clic en el botón **▶️ Run** (o presiona `Shift + F10`)
4. La app se compilará y se instalará en el dispositivo/emulador

### 6. **Configuración Adicional Recomendada**

#### Configurar la app para producción

Edita `android/app/build.gradle` y verifica/ajusta:

```gradle
android {
    defaultConfig {
        applicationId "com.compartalia.app"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

#### Permisos en AndroidManifest.xml

El archivo `android/app/src/main/AndroidManifest.xml` ya debería tener los permisos necesarios, pero verifica que incluye:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## 🔄 Flujo de Trabajo de Desarrollo

### Después de hacer cambios en el código Vue:

1. **Construir el proyecto web:**
   ```bash
   npm run build
   ```

2. **Sincronizar con Capacitor:**
   ```bash
   npm run cap:sync
   ```
   O usar el script completo:
   ```bash
   npm run build:mobile
   ```

3. **Abrir Android Studio:**
   ```bash
   npm run cap:open:android
   ```

4. **Ejecutar desde Android Studio** (botón ▶️ Run)

### Scripts Disponibles

- `npm run build:mobile` - Construye y sincroniza todo
- `npm run cap:sync` - Sincroniza cambios con Android/iOS
- `npm run cap:open:android` - Abre Android Studio
- `npm run cap:open:ios` - Abre Xcode (si estás en Mac)

## 📝 Notas Importantes

1. **Primera vez:** La sincronización inicial puede tardar bastante (5-10 minutos)
2. **Variables de entorno:** Asegúrate de tener configuradas las variables de entorno necesarias (Google Maps API, Supabase, etc.)
3. **Permisos:** La app solicitará permisos de ubicación y cámara al usuario cuando sean necesarios
4. **Hot Reload:** No funciona directamente en móvil, necesitas construir y sincronizar después de cada cambio

## 🐛 Solución de Problemas

### Error: "Gradle sync failed"
- Ve a **File > Invalidate Caches / Restart**
- Selecciona **"Invalidate and Restart"**

### Error: "SDK not found"
- Ve a **Tools > SDK Manager**
- Instala el SDK que falta

### La app no aparece en el dispositivo
- Verifica que el dispositivo está conectado: `adb devices`
- Revisa los logs en **Logcat** de Android Studio

### Error de permisos
- Verifica que `AndroidManifest.xml` tiene todos los permisos necesarios
- En Android 6.0+, algunos permisos deben solicitarse en tiempo de ejecución

## 🎯 Próximos Pasos

1. ✅ Abre Android Studio y carga el proyecto
2. ✅ Configura un emulador o conecta un dispositivo
3. ✅ Ejecuta la app
4. 🔜 Prueba todas las funcionalidades en el dispositivo
5. 🔜 Configura la firma para producción (cuando estés listo para publicar)

## 📱 Configuración Completa de Capacitor

### ✅ Plugins Instalados y Configurados:

1. **@capacitor/status-bar** - Controla la barra de estado
2. **@capacitor/keyboard** - Manejo mejorado del teclado con listeners
3. **@capacitor/network** - Detección de conectividad en tiempo real
4. **@capacitor/app** - Control del ciclo de vida de la app (back button, deep links, etc.)
5. **@capacitor/splash-screen** - Pantalla de carga profesional

### 🎨 Safe Area (Área Segura) Configurado:

- ✅ **CSS Variables**: `--safe-area-top`, `--safe-area-bottom`, `--safe-area-left`, `--safe-area-right`
- ✅ **#app con padding automático**: Respeta todas las áreas seguras
- ✅ **Clases helper**: `.header-fixed`, `.footer-fixed`, `.safe-area-*`
- ✅ **Detección de plataforma**: Clases `.android` y `.ios` en el body
- ✅ **Viewport optimizado**: `viewport-fit=cover` para dispositivos con notch

### ⌨️ Keyboard Configurado:

- **Modo**: `native` - El teclado redimensiona nativamente el contenido
- **Listeners**: Detecta cuando el teclado aparece/desaparece
- **Accessory Bar**: Visible para mejor UX en iOS

### 🌐 Network Status:

- Detecta cambios de conectividad en tiempo real
- Variable reactiva `isOnline` disponible en el composable
- Logs automáticos de cambios de estado

### 🔄 App Lifecycle:

- **Back Button** (Android): Navega hacia atrás o cierra la app
- **App State**: Detecta cuando la app pasa a segundo plano/primer plano
- **Deep Links**: Listener configurado para URLs

### 📋 Archivos Modificados:

- `src/composables/useCapacitor.ts` - Configuración completa de todos los plugins
- `src/assets/main.css` - Variables CSS y clases helper para safe areas
- `capacitor.config.ts` - Configuración de StatusBar y Keyboard
- `index.html` - Viewport meta tag optimizado

### 🚀 Próximos Pasos:

1. ✅ Build completado: `npm run build`
2. ✅ Sync completado: `npx cap sync`
3. 🔜 Abre Android Studio: `npx cap open android`
4. 🔜 Ejecuta la app y verifica:
   - Status bar se muestra correctamente
   - Keyboard funciona sin cortar contenido
   - Safe areas respetadas en headers/footers
   - Network status se detecta correctamente

¡La app está completamente configurada con todos los plugins esenciales! 🎉

