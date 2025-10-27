# 📸 Configurar Storage para Avatars en Supabase

## ✅ Funcionalidad Implementada

He agregado la funcionalidad para cambiar la foto de perfil del usuario. Ahora puedes:

- 📸 Hacer hover sobre tu foto de perfil
- 📤 Hacer clic para seleccionar una nueva imagen
- ✅ La imagen se sube automáticamente a Supabase Storage
- 🔄 El perfil se actualiza en tiempo real

## 🔧 Configuración Requerida en Supabase

Para que funcione, necesitas crear el bucket de almacenamiento en Supabase:

### Paso 1: Crear el Bucket

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. En el menú lateral, haz clic en **Storage**
3. Haz clic en **"New bucket"** o **"Create a new bucket"**
4. Configura el bucket:
   - **Name:** `avatars`
   - **Public bucket:** ✅ **Activado** (para que las imágenes sean públicas)
   - **File size limit:** 5 MB (opcional)
   - **Allowed MIME types:** `image/*` (opcional)
5. Haz clic en **"Create bucket"**

### Paso 2: Configurar Políticas de Seguridad

Necesitas crear políticas para permitir que los usuarios suban y lean sus avatars:

#### 2.1 Política de Lectura (SELECT)

```sql
-- Permitir que todos lean los avatars (son públicos)
CREATE POLICY "Avatars son públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

#### 2.2 Política de Subida (INSERT)

```sql
-- Permitir que usuarios autenticados suban avatars
CREATE POLICY "Usuarios pueden subir avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'avatars'
);
```

#### 2.3 Política de Actualización (UPDATE)

```sql
-- Permitir que usuarios actualicen sus propios avatars
CREATE POLICY "Usuarios pueden actualizar sus avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND owner = auth.uid()
);
```

#### 2.4 Política de Eliminación (DELETE)

```sql
-- Permitir que usuarios eliminen sus propios avatars
CREATE POLICY "Usuarios pueden eliminar sus avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND owner = auth.uid()
);
```

### Paso 3: Aplicar las Políticas

1. En Supabase Dashboard, ve a **Storage** → **Policies**
2. Selecciona el bucket `avatars`
3. Haz clic en **"New Policy"**
4. Para cada política:
   - Selecciona el tipo de operación (SELECT, INSERT, UPDATE, DELETE)
   - Copia y pega el código SQL correspondiente
   - Haz clic en **"Save"**

### Alternativa Rápida (Menos Segura)

Si quieres probar rápidamente sin configurar políticas detalladas:

1. Ve a **Storage** → **Policies**
2. Selecciona el bucket `avatars`
3. Haz clic en **"New Policy"**
4. Selecciona **"Enable access to all users"** (temporalmente)
5. Esto permitirá todas las operaciones a todos los usuarios

⚠️ **Nota:** Esta opción es menos segura y solo se recomienda para desarrollo/pruebas.

## 🎨 Cómo Usar

### Para el Usuario:

1. Ve a tu perfil (generalmente en `/user-profile` o desde el menú)
2. Pasa el mouse sobre tu foto de perfil
3. Verás un icono de cámara aparecer
4. Haz clic en la foto
5. Selecciona una imagen de tu computadora
6. La imagen se subirá automáticamente
7. ¡Listo! Tu foto de perfil se actualizará

### Validaciones Implementadas:

- ✅ Solo acepta archivos de imagen (jpg, png, gif, etc.)
- ✅ Tamaño máximo: 5 MB
- ✅ Muestra spinner mientras se sube
- ✅ Mensajes de error si algo falla
- ✅ Confirmación cuando se actualiza correctamente

## 🔍 Logs de Depuración

Cuando subas una imagen, verás logs en la consola:

```
📤 Subiendo imagen de perfil...
✅ Imagen subida: {...}
🔗 URL pública: https://...
✅ Perfil actualizado con nueva imagen
```

Si hay un error, verás:
```
❌ Error subiendo imagen: {...}
```

## 📊 Estructura de Archivos

Las imágenes se guardan con este formato:
```
avatars/
  ├── {userId}-{timestamp}.jpg
  ├── {userId}-{timestamp}.png
  └── ...
```

Ejemplo:
```
avatars/XYFVtzQ8gqhWeKmOTN8AEAKriSH3-1730000000000.jpg
```

## 🚨 Solución de Problemas

### Error: "Bucket not found"
**Solución:** Verifica que el bucket `avatars` existe en Supabase Storage

### Error: "Permission denied"
**Solución:** Verifica que las políticas de seguridad estén configuradas correctamente

### Error: "File too large"
**Solución:** La imagen debe ser menor a 5MB. Comprime la imagen antes de subirla.

### La imagen no se actualiza
**Solución:** 
1. Verifica que el usuario esté autenticado
2. Revisa la consola del navegador (F12) para ver errores
3. Verifica que la tabla `profiles` tenga el campo `avatar_url`

## 📝 Código Implementado

### Archivos Modificados:

- ✅ `src/components/profile/ProfileCard.vue` - Componente con funcionalidad de subida

### Características:

1. **Botón de cámara al hacer hover**
2. **Input de archivo oculto**
3. **Validación de tipo y tamaño**
4. **Subida a Supabase Storage**
5. **Actualización en base de datos**
6. **Indicador de carga (spinner)**
7. **Mensajes de éxito/error**
8. **Actualización en tiempo real del perfil**

## 🎉 Resultado

Una vez configurado, tendrás un sistema completo de gestión de avatars:

- 📸 Cambio fácil de foto de perfil
- ☁️ Almacenamiento en la nube (Supabase)
- 🔒 Seguro con políticas RLS
- ⚡ Rápido y eficiente
- 📱 Funciona en móvil y desktop

¡Listo para usar! 🚀


