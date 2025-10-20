# Triggers de Supabase para Firebase Auth

## Descripción

Se han creado triggers automáticos en Supabase que se ejecutan cuando un usuario se registra o actualiza su información en Firebase Auth. Estos triggers aseguran que los perfiles de usuario se mantengan sincronizados entre Firebase y Supabase.

## Triggers Creados

### 1. `on_auth_user_created`
- **Evento**: `AFTER INSERT` en `auth.users`
- **Función**: `create_user_profile()`
- **Propósito**: Crea automáticamente un perfil en la tabla `profiles` cuando se registra un nuevo usuario

### 2. `on_auth_user_updated`
- **Evento**: `AFTER UPDATE` en `auth.users`
- **Función**: `update_user_profile()`
- **Propósito**: Actualiza el perfil existente cuando se modifica la información del usuario

## Estructura de la Tabla Profiles

```sql
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY,                    -- ID del usuario de Firebase
    email text NOT NULL,                    -- Email del usuario
    name text,                              -- Nombre del usuario
    role text DEFAULT 'pasajero',           -- Rol: 'conductor' o 'pasajero'
    avatar_url text,                        -- URL del avatar
    phone text,                             -- Teléfono del usuario
    preferences jsonb DEFAULT '{}',         -- Preferencias del usuario
    created_at timestamptz DEFAULT now(),   -- Fecha de creación
    updated_at timestamptz DEFAULT now()    -- Fecha de actualización
);
```

## Datos que se Extraen de Firebase

### Para Registro con Google:
- `id`: UID del usuario de Firebase
- `email`: Email de la cuenta de Google
- `name`: Nombre completo de Google (`full_name` o `name`)
- `avatar_url`: URL de la foto de perfil de Google
- `role`: Por defecto 'pasajero'
- `preferences`: Configuración inicial por defecto

### Para Registro Normal:
- `id`: UID del usuario de Firebase
- `email`: Email del formulario
- `name`: Nombre del formulario o extraído del email
- `role`: Por defecto 'pasajero'
- `preferences`: Configuración inicial por defecto

## Preferencias por Defecto

```json
{
  "role": "pasajero",
  "notifications": true,
  "language": "es",
  "theme": "light"
}
```

## Funcionamiento

1. **Usuario se registra en Firebase** (Google o email/password)
2. **Trigger se ejecuta automáticamente**
3. **Se crea/actualiza el perfil en Supabase**
4. **El perfil queda disponible para la aplicación**

## Ventajas

- ✅ **Sincronización automática**: No hay necesidad de código adicional
- ✅ **Consistencia de datos**: Los perfiles siempre están actualizados
- ✅ **Manejo de conflictos**: Usa `ON CONFLICT` para evitar duplicados
- ✅ **Flexibilidad**: Maneja tanto Google Auth como registro normal
- ✅ **Seguridad**: Usa `SECURITY DEFINER` para permisos apropiados

## Testing

Para probar que los triggers funcionan:

1. Registra un nuevo usuario en Firebase
2. Verifica que aparece en la tabla `profiles` de Supabase
3. Actualiza la información del usuario en Firebase
4. Verifica que se actualiza en Supabase

## Migraciones Aplicadas

- `create_user_profile_trigger`: Crea los triggers y funciones
- `update_user_profile_trigger`: Añade el trigger de actualización
- `update_profiles_table_structure`: Actualiza la estructura de la tabla profiles
