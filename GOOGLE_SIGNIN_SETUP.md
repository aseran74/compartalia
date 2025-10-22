# 🔐 Configuración de Google Sign-In para Compartalia

## 🚨 **Problema Actual:**
Google Sign-In no funciona porque no está configurado correctamente en Firebase Console.

## 📋 **Solución Paso a Paso:**

### 1. **Configurar Google Sign-In en Firebase Console**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `quincenalia-5eaa2`
3. Ve a **Authentication** > **Sign-in method**
4. Habilita **Google** como proveedor de autenticación
5. Configura los siguientes campos:
   - **Project support email**: Tu email
   - **Web SDK configuration**: 
     - **Web client ID**: Se genera automáticamente
     - **Web client secret**: Se genera automáticamente

### 2. **Configurar Dominios Autorizados**

En la misma página de **Sign-in method** > **Google**:

1. Ve a la sección **Authorized domains**
2. Añade los siguientes dominios:
   - `localhost` (para desarrollo)
   - `127.0.0.1` (para desarrollo)
   - `compartalia.netlify.app` (para producción)
   - `quincenalia-5eaa2.firebaseapp.com` (dominio de Firebase)

### 3. **Configurar OAuth Consent Screen (Google Cloud Console)**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona el proyecto: `quincenalia-5eaa2`
3. Ve a **APIs & Services** > **OAuth consent screen**
4. Configura la pantalla de consentimiento:
   - **User Type**: External
   - **App name**: Compartalia
   - **User support email**: Tu email
   - **Developer contact information**: Tu email
   - **Scopes**: email, profile, openid
   - **Authorized domains**: 
     - `compartalia.netlify.app`
     - `quincenalia-5eaa2.firebaseapp.com`

### 4. **Verificar Configuración de APIs**

En Google Cloud Console, ve a **APIs & Services** > **Library** y habilita:
- ✅ **Google+ API** (si no está habilitada)
- ✅ **People API** (para obtener información del perfil)

### 5. **Probar la Configuración**

1. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Ve a `http://localhost:5173`
3. Intenta hacer login con Google
4. Revisa la consola del navegador para ver los logs

## 🔧 **Código de Debug**

El código ya incluye funciones de debug. En la consola del navegador verás:

```javascript
// Para verificar la configuración de Firebase
debugFirebaseConfig();

// Para verificar el estado de autenticación
firebaseAuthService.debugCurrentState();
```

## 🚨 **Errores Comunes y Soluciones:**

### **Error: "This app is not verified"**
- **Solución**: En OAuth consent screen, cambia el estado a "Testing" y añade tu email como usuario de prueba

### **Error: "unauthorized-domain"**
- **Solución**: Añade tu dominio a la lista de dominios autorizados en Firebase Console

### **Error: "popup-blocked"**
- **Solución**: Permite popups para localhost en tu navegador

### **Error: "operation-not-allowed"**
- **Solución**: Habilita Google Sign-In en Firebase Console > Authentication > Sign-in method

## 📱 **Configuración para Móviles (Opcional)**

Si planeas usar la app en móviles, también configura:
- **Android package name**: `com.compartalia.app`
- **iOS bundle ID**: `com.compartalia.app`

## ✅ **Verificación Final**

Una vez configurado correctamente, deberías ver:
1. ✅ El botón de Google Sign-In funciona
2. ✅ Se abre un popup de Google
3. ✅ Después del login, el usuario aparece autenticado
4. ✅ Los datos del usuario se guardan en Supabase

## 🆘 **Si Aún No Funciona**

1. **Revisa la consola del navegador** para errores específicos
2. **Verifica que todas las APIs estén habilitadas** en Google Cloud Console
3. **Asegúrate de que los dominios estén correctamente configurados**
4. **Espera unos minutos** después de hacer cambios en la configuración

---

**¡Una vez configurado, Google Sign-In funcionará perfectamente! 🎉**
