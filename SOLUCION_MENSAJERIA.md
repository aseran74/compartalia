# 🔧 Solución para el Sistema de Mensajería

## Problema
Los mensajes no se están enviando correctamente en el sistema de mensajería.

## Diagnóstico Implementado

He agregado logs detallados en:
- `src/services/messagingService.ts` - Servicio de mensajería con logs completos
- `src/components/carpooling/Mensajeria.vue` - Componente con validaciones mejoradas
- `src/utils/testMessaging.ts` - Script de diagnóstico completo

## Posibles Causas y Soluciones

### 1. Problema de Permisos RLS (Row Level Security) en Supabase

**Causa más probable:** Las políticas de seguridad de Supabase no permiten insertar mensajes.

**Solución:**

Ve a tu panel de Supabase (https://supabase.com/dashboard) y ejecuta estos comandos SQL:

```sql
-- 1. Habilitar RLS en las tablas si no está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para la tabla profiles
-- Permitir que todos lean todos los perfiles
DROP POLICY IF EXISTS "Permitir lectura pública de perfiles" ON profiles;
CREATE POLICY "Permitir lectura pública de perfiles" 
ON profiles FOR SELECT 
TO authenticated 
USING (true);

-- Permitir que los usuarios actualicen su propio perfil
DROP POLICY IF EXISTS "Permitir actualizar propio perfil" ON profiles;
CREATE POLICY "Permitir actualizar propio perfil" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Permitir inserción de nuevos perfiles
DROP POLICY IF EXISTS "Permitir inserción de perfiles" ON profiles;
CREATE POLICY "Permitir inserción de perfiles" 
ON profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- 3. Políticas para la tabla conversations
-- Permitir leer conversaciones donde el usuario es participante
DROP POLICY IF EXISTS "Usuarios pueden ver sus conversaciones" ON conversations;
CREATE POLICY "Usuarios pueden ver sus conversaciones" 
ON conversations FOR SELECT 
TO authenticated 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Permitir crear nuevas conversaciones
DROP POLICY IF EXISTS "Usuarios pueden crear conversaciones" ON conversations;
CREATE POLICY "Usuarios pueden crear conversaciones" 
ON conversations FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Permitir actualizar conversaciones (para timestamp)
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus conversaciones" ON conversations;
CREATE POLICY "Usuarios pueden actualizar sus conversaciones" 
ON conversations FOR UPDATE 
TO authenticated 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 4. Políticas para la tabla messages
-- Permitir leer mensajes de conversaciones donde el usuario participa
DROP POLICY IF EXISTS "Usuarios pueden ver mensajes de sus conversaciones" ON messages;
CREATE POLICY "Usuarios pueden ver mensajes de sus conversaciones" 
ON messages FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
  )
);

-- Permitir enviar mensajes en conversaciones donde el usuario participa
DROP POLICY IF EXISTS "Usuarios pueden enviar mensajes en sus conversaciones" ON messages;
CREATE POLICY "Usuarios pueden enviar mensajes en sus conversaciones" 
ON messages FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() = sender_id 
  AND EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
  )
);

-- Permitir actualizar mensajes (para marcar como leído)
DROP POLICY IF EXISTS "Usuarios pueden actualizar mensajes" ON messages;
CREATE POLICY "Usuarios pueden actualizar mensajes" 
ON messages FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
  )
);
```

### 2. Problema de Autenticación

**Causa:** El usuario no está correctamente autenticado en Supabase.

**Verificación:**
1. Abre la consola del navegador (F12)
2. Ve a la sección de mensajería
3. Busca los logs que empiezan con 🔵, ✅ o ❌
4. Verifica que `userId` tenga un valor válido

**Solución:**
Si el usuario no está autenticado:
- Asegúrate de que el login con Firebase esté sincronizado con Supabase
- Verifica que el `uid` de Firebase coincida con el `id` en la tabla `profiles` de Supabase

### 3. Problema de Sincronización Firebase-Supabase

**Causa:** El `uid` de Firebase no coincide con el `id` en Supabase.

**Solución:**

Ejecuta este código en la consola del navegador cuando estés autenticado:

```javascript
// Verificar usuario de Firebase
import { auth } from '@/config/firebase';
console.log('Firebase user:', auth.currentUser);

// Verificar usuario de Supabase
import { supabaseClean } from '@/config/supabaseClean';
const { data, error } = await supabaseClean.auth.getUser();
console.log('Supabase user:', data.user);
```

Si los IDs no coinciden, necesitas:
1. Crear el perfil en Supabase con el mismo ID de Firebase
2. O actualizar el sistema para usar solo Supabase Auth

### 4. Estructura de Tablas Incorrecta

**Verificación:**
Asegúrate de que las tablas tengan esta estructura:

```sql
-- Tabla profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'pasajero',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Tabla messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
```

## Cómo Probar la Solución

### Opción 1: Usar el Script de Diagnóstico

1. Abre la consola del navegador (F12)
2. Importa y ejecuta el script de diagnóstico:

```javascript
import { testMessagingSystem, checkRLSPolicies } from '@/utils/testMessaging';

// Ejecutar diagnóstico completo
await testMessagingSystem();

// Verificar políticas RLS
await checkRLSPolicies();
```

### Opción 2: Probar Manualmente

1. Inicia sesión en la aplicación
2. Ve a la sección de mensajería (`/carpooling/mensajeria`)
3. Selecciona una conversación existente
4. Intenta enviar un mensaje
5. Revisa la consola del navegador para ver los logs detallados

## Logs a Buscar

Cuando intentes enviar un mensaje, deberías ver en la consola:

```
📤 === ENVIANDO MENSAJE ===
Conversación ID: [uuid]
Usuario ID: [uid]
Contenido: [tu mensaje]

🔵 === MessagingService.sendMessage ===
   conversationId: [uuid]
   userId: [uid]
   content length: [número]

✅ userId válido, procediendo a insertar...
✅ Conversación encontrada: {...}
✅ Usuario autorizado, insertando mensaje...
✅ Mensaje insertado exitosamente: {...}
✅ Timestamp actualizado
```

Si ves algún ❌, el error te dirá exactamente qué está fallando.

## Solución Rápida (Si tienes acceso a Supabase)

1. Ve a tu proyecto en Supabase
2. Navega a: **Authentication** > **Policies**
3. Para cada tabla (`profiles`, `conversations`, `messages`):
   - Haz clic en "New Policy"
   - Selecciona "Enable access to all users" (temporalmente para probar)
   - Guarda

4. Prueba enviar un mensaje
5. Si funciona, entonces el problema era RLS
6. Aplica las políticas SQL más restrictivas del paso 1

## Contacto con Soporte

Si ninguna de estas soluciones funciona, necesitarás:

1. Compartir los logs de la consola (los que empiezan con 🔵, ✅, ❌)
2. Verificar los permisos en Supabase Dashboard
3. Revisar si hay errores en los logs de Supabase (Dashboard > Logs)

## Cambios Realizados en el Código

### Archivos Modificados:
1. ✅ `src/services/messagingService.ts` - Logs detallados y validaciones
2. ✅ `src/components/carpooling/Mensajeria.vue` - Mejor manejo de errores
3. ✅ `src/utils/testMessaging.ts` - Script de diagnóstico (NUEVO)

### Próximos Pasos:
1. Ejecutar el script de diagnóstico
2. Aplicar las políticas SQL en Supabase
3. Probar el envío de mensajes
4. Reportar resultados

