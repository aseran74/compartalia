// Script de diagnóstico para el sistema de mensajería
import { supabaseClean } from '@/config/supabaseClean';

export async function testMessagingSystem() {
  console.log('🔍 === DIAGNÓSTICO DEL SISTEMA DE MENSAJERÍA ===');
  
  // 1. Verificar conexión a Supabase
  console.log('\n1️⃣ Verificando conexión a Supabase...');
  try {
    const { data, error } = await supabaseClean
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error);
      return { success: false, error: 'Error de conexión a Supabase' };
    }
    console.log('✅ Conexión exitosa a Supabase');
  } catch (err) {
    console.error('❌ Error fatal de conexión:', err);
    return { success: false, error: 'Error fatal de conexión' };
  }

  // 2. Verificar permisos de lectura en tabla profiles
  console.log('\n2️⃣ Verificando permisos de lectura en tabla profiles...');
  try {
    const { data, error } = await supabaseClean
      .from('profiles')
      .select('id, name, email, role')
      .limit(5);
    
    if (error) {
      console.error('❌ Error de permisos en profiles:', error);
      console.error('Código de error:', error.code);
      console.error('Mensaje:', error.message);
      return { success: false, error: `Error de permisos en profiles: ${error.message}` };
    }
    console.log('✅ Permisos de lectura en profiles OK');
    console.log(`   Usuarios encontrados: ${data?.length || 0}`);
  } catch (err) {
    console.error('❌ Error en profiles:', err);
    return { success: false, error: 'Error al leer profiles' };
  }

  // 3. Verificar permisos en tabla conversations
  console.log('\n3️⃣ Verificando permisos en tabla conversations...');
  try {
    const { data, error } = await supabaseClean
      .from('conversations')
      .select('id, user1_id, user2_id, created_at')
      .limit(5);
    
    if (error) {
      console.error('❌ Error de permisos en conversations:', error);
      console.error('Código de error:', error.code);
      console.error('Mensaje:', error.message);
      return { success: false, error: `Error de permisos en conversations: ${error.message}` };
    }
    console.log('✅ Permisos de lectura en conversations OK');
    console.log(`   Conversaciones encontradas: ${data?.length || 0}`);
  } catch (err) {
    console.error('❌ Error en conversations:', err);
    return { success: false, error: 'Error al leer conversations' };
  }

  // 4. Verificar permisos en tabla messages
  console.log('\n4️⃣ Verificando permisos en tabla messages...');
  try {
    const { data, error } = await supabaseClean
      .from('messages')
      .select('id, conversation_id, sender_id, content, created_at')
      .limit(5);
    
    if (error) {
      console.error('❌ Error de permisos en messages:', error);
      console.error('Código de error:', error.code);
      console.error('Mensaje:', error.message);
      return { success: false, error: `Error de permisos en messages: ${error.message}` };
    }
    console.log('✅ Permisos de lectura en messages OK');
    console.log(`   Mensajes encontrados: ${data?.length || 0}`);
  } catch (err) {
    console.error('❌ Error en messages:', err);
    return { success: false, error: 'Error al leer messages' };
  }

  // 5. Verificar autenticación actual
  console.log('\n5️⃣ Verificando autenticación actual...');
  try {
    const { data: { user }, error } = await supabaseClean.auth.getUser();
    
    if (error) {
      console.error('❌ Error obteniendo usuario:', error);
      return { success: false, error: 'Error de autenticación' };
    }
    
    if (!user) {
      console.log('⚠️ No hay usuario autenticado');
      return { success: false, error: 'No hay usuario autenticado' };
    }
    
    console.log('✅ Usuario autenticado:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
  } catch (err) {
    console.error('❌ Error verificando autenticación:', err);
    return { success: false, error: 'Error verificando autenticación' };
  }

  // 6. Probar inserción de mensaje (sin commit)
  console.log('\n6️⃣ Probando permisos de escritura en messages...');
  try {
    const { data: { user } } = await supabaseClean.auth.getUser();
    
    if (!user) {
      console.log('⚠️ No se puede probar escritura sin usuario autenticado');
      return { success: true, warning: 'No se pudo probar escritura (sin usuario)' };
    }

    // Buscar una conversación existente del usuario
    const { data: conversations } = await supabaseClean
      .from('conversations')
      .select('id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .limit(1);

    if (!conversations || conversations.length === 0) {
      console.log('⚠️ No hay conversaciones para probar escritura');
      return { success: true, warning: 'No hay conversaciones para probar' };
    }

    const testConversationId = conversations[0].id;
    
    // Intentar insertar un mensaje de prueba
    const { data, error } = await supabaseClean
      .from('messages')
      .insert({
        conversation_id: testConversationId,
        sender_id: user.id,
        content: '[TEST] Mensaje de prueba - puede ser eliminado'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error de permisos de escritura en messages:', error);
      console.error('Código de error:', error.code);
      console.error('Mensaje:', error.message);
      return { success: false, error: `Error de permisos de escritura: ${error.message}` };
    }

    console.log('✅ Permisos de escritura en messages OK');
    console.log(`   Mensaje de prueba creado con ID: ${data.id}`);

    // Eliminar el mensaje de prueba
    await supabaseClean
      .from('messages')
      .delete()
      .eq('id', data.id);
    
    console.log('✅ Mensaje de prueba eliminado');
  } catch (err) {
    console.error('❌ Error probando escritura:', err);
    return { success: false, error: 'Error probando escritura' };
  }

  console.log('\n✅ === DIAGNÓSTICO COMPLETADO EXITOSAMENTE ===\n');
  return { success: true };
}

// Función para probar el envío de un mensaje real
export async function testSendMessage(conversationId: string, content: string) {
  console.log('📤 Probando envío de mensaje...');
  console.log(`   Conversación: ${conversationId}`);
  console.log(`   Contenido: ${content}`);

  try {
    const { data: { user }, error: authError } = await supabaseClean.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Usuario no autenticado');
      return { success: false, error: 'Usuario no autenticado' };
    }

    console.log(`   Usuario: ${user.email} (${user.id})`);

    const { data, error } = await supabaseClean
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim()
      })
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        read_at,
        created_at
      `)
      .single();

    if (error) {
      console.error('❌ Error enviando mensaje:', error);
      console.error('Código:', error.code);
      console.error('Mensaje:', error.message);
      console.error('Detalles:', error.details);
      return { success: false, error: error.message };
    }

    console.log('✅ Mensaje enviado exitosamente');
    console.log('   Datos:', data);

    // Actualizar timestamp de la conversación
    await supabaseClean
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return { success: true, data };
  } catch (err) {
    console.error('❌ Error fatal:', err);
    return { success: false, error: 'Error fatal' };
  }
}

// Función para verificar RLS (Row Level Security)
export async function checkRLSPolicies() {
  console.log('🔒 === VERIFICANDO POLÍTICAS RLS ===\n');

  const { data: { user } } = await supabaseClean.auth.getUser();
  
  if (!user) {
    console.log('⚠️ No hay usuario autenticado para verificar RLS');
    return;
  }

  console.log(`Usuario actual: ${user.email} (${user.id})\n`);

  // Verificar si puede leer sus propias conversaciones
  console.log('1️⃣ Verificando lectura de conversaciones propias...');
  const { data: myConversations, error: convError } = await supabaseClean
    .from('conversations')
    .select('*')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

  if (convError) {
    console.error('❌ Error:', convError.message);
  } else {
    console.log(`✅ Puede leer ${myConversations?.length || 0} conversaciones`);
  }

  // Verificar si puede leer mensajes de sus conversaciones
  if (myConversations && myConversations.length > 0) {
    console.log('\n2️⃣ Verificando lectura de mensajes...');
    const { data: messages, error: msgError } = await supabaseClean
      .from('messages')
      .select('*')
      .eq('conversation_id', myConversations[0].id);

    if (msgError) {
      console.error('❌ Error:', msgError.message);
    } else {
      console.log(`✅ Puede leer ${messages?.length || 0} mensajes`);
    }
  }

  console.log('\n✅ === VERIFICACIÓN RLS COMPLETADA ===\n');
}

