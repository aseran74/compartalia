import { supabaseClean } from '@/config/supabaseClean';

// Interfaces
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
  otherUser: {
    id: string;
    name: string;
    avatar_url: string | null;
    role: string;
  };
  last_message?: Message;
  unread_count: number;
}

export class MessagingService {
  public supabase = supabaseClean;

  // Crear perfil de usuario si no existe
  async ensureUserProfile(userId: string, userEmail?: string, userName?: string): Promise<boolean> {
    try {
      // Verificar si el usuario ya existe
      const { data: existingProfile } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        console.log('Usuario ya existe en profiles:', userId);
        return true;
      }

      // Crear el perfil
      const { error } = await this.supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userEmail || 'usuario@ejemplo.com',
          name: userName || 'Usuario',
          role: 'pasajero',
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creando perfil:', error);
        return false;
      }

      console.log('Perfil creado exitosamente:', userId);
      return true;
    } catch (error) {
      console.error('Error en ensureUserProfile:', error);
      return false;
    }
  }

  // Obtener conversaciones del usuario actual
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      console.log('🔍 getConversations - userId recibido:', userId);
      
      if (!userId) {
        console.log('No hay userId proporcionado');
        return [];
      }

      const { data, error } = await this.supabase
        .from('conversations')
        .select(`
          id,
          user1_id,
          user2_id,
          created_at,
          updated_at,
          user1:profiles!conversations_user1_id_fkey(id, name, avatar_url, role),
          user2:profiles!conversations_user2_id_fkey(id, name, avatar_url, role)
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Error en getConversations:', error);
        throw error;
      }

      console.log('🔍 getConversations - datos obtenidos:', data);
      console.log('🔍 getConversations - número de conversaciones:', data?.length || 0);

      // Transformar datos para incluir información del otro usuario
      const conversations: Conversation[] = await Promise.all(
        (data || []).map(async (conv) => {
          const otherUser = conv.user1_id === userId ? conv.user2 : conv.user1;
          const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;

          // Obtener último mensaje
          const { data: lastMessage } = await this.supabase
            .from('messages')
            .select(`
              id,
              content,
              created_at,
              sender_id
            `)
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Contar mensajes no leídos
          const { count: unreadCount } = await this.supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('sender_id', otherUserId)
            .is('read_at', null);

          return {
            id: conv.id,
            user1_id: conv.user1_id,
            user2_id: conv.user2_id,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            otherUser: {
              id: otherUser.id,
              name: otherUser.name,
              avatar: otherUser.avatar_url,
              avatar_url: otherUser.avatar_url,
              nombre: otherUser.name,
              role: otherUser.role,
              estado: 'activo'
            },
            last_message: lastMessage ? {
              id: lastMessage.id,
              conversation_id: conv.id,
              sender_id: lastMessage.sender_id,
              content: lastMessage.content,
              read_at: null,
              created_at: lastMessage.created_at
            } : undefined,
            unread_count: unreadCount || 0
          };
        })
      );

      console.log('🔍 getConversations - conversaciones transformadas:', conversations);
      console.log('🔍 getConversations - número de conversaciones finales:', conversations.length);
      
      // Log detallado de cada conversación
      conversations.forEach((conv, index) => {
        console.log(`🔍 Conversación ${index}:`, {
          id: conv.id,
          otherUser: conv.otherUser,
          lastMessage: conv.last_message,
          unreadCount: conv.unread_count
        });
      });

      return conversations;
    } catch (error) {
      console.error('Error obteniendo conversaciones:', error);
      return [];
    }
  }

  // Obtener mensajes de una conversación
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          read_at,
          created_at,
          sender:profiles!messages_sender_id_fkey(id, name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error obteniendo mensajes:', error);
      return [];
    }
  }

  // Enviar mensaje
  async sendMessage(conversationId: string, content: string, userId: string): Promise<Message | null> {
    console.log('🔵 === MessagingService.sendMessage ===');
    console.log('   conversationId:', conversationId);
    console.log('   userId:', userId);
    console.log('   content length:', content.length);
    
    try {
      if (!userId) {
        console.error('❌ No se proporcionó userId');
        throw new Error('Usuario no autenticado');
      }

      console.log('✅ userId válido, procediendo a insertar...');

      // Verificar que la conversación existe
      const { data: conversation, error: convError } = await this.supabase
        .from('conversations')
        .select('id, user1_id, user2_id')
        .eq('id', conversationId)
        .single();

      if (convError) {
        console.error('❌ Error verificando conversación:', convError);
        throw new Error(`Conversación no encontrada: ${convError.message}`);
      }

      console.log('✅ Conversación encontrada:', conversation);

      // Verificar que el usuario es parte de la conversación
      if (conversation.user1_id !== userId && conversation.user2_id !== userId) {
        console.error('❌ Usuario no es parte de la conversación');
        throw new Error('No tienes permiso para enviar mensajes en esta conversación');
      }

      console.log('✅ Usuario autorizado, insertando mensaje...');

      const { data, error } = await this.supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
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
        console.error('❌ Error de Supabase al insertar mensaje:', error);
        console.error('   Código:', error.code);
        console.error('   Mensaje:', error.message);
        console.error('   Detalles:', error.details);
        console.error('   Hint:', error.hint);
        throw error;
      }

      console.log('✅ Mensaje insertado exitosamente:', data);

      // Actualizar timestamp de la conversación
      console.log('Actualizando timestamp de conversación...');
      const { error: updateError } = await this.supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (updateError) {
        console.warn('⚠️ Error actualizando timestamp:', updateError);
        // No lanzamos error aquí porque el mensaje ya se envió
      } else {
        console.log('✅ Timestamp actualizado');
      }

      return data;
    } catch (error: any) {
      console.error('❌ Error en sendMessage:', error);
      console.error('   Tipo:', typeof error);
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
      return null;
    }
  }

  // Crear nueva conversación
  async createConversation(otherUserId: string, userId: string): Promise<Conversation | null> {
    try {
      console.log('🔍 createConversation - userId:', userId, 'otherUserId:', otherUserId);
      
      if (!userId || !otherUserId) {
        console.log('Faltan parámetros para crear conversación');
        return null;
      }

      // Verificar si ya existe una conversación
      const { data: existingConv } = await this.supabase
        .from('conversations')
        .select('*')
        .or(`and(user1_id.eq.${userId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${userId})`)
        .single();

      if (existingConv) {
        console.log('🔍 createConversation - conversación existente encontrada:', existingConv);
        // Retornar conversación existente
        const conversations = await this.getConversations(userId);
        return conversations.find(c => c.id === existingConv.id) || null;
      }

      // Crear nueva conversación
      const { data, error } = await this.supabase
        .from('conversations')
        .insert({
          user1_id: userId,
          user2_id: otherUserId
        })
        .select(`
          id,
          user1_id,
          user2_id,
          created_at,
          updated_at
        `)
        .single();

      if (error) throw error;

      // Obtener información del otro usuario
      const { data: otherUser } = await this.supabase
        .from('profiles')
        .select('id, name, avatar_url, role')
        .eq('id', otherUserId)
        .single();

      return {
        id: data.id,
        user1_id: data.user1_id,
        user2_id: data.user2_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          avatar_url: otherUser.avatar_url,
          role: otherUser.role
        },
        unread_count: 0
      };
    } catch (error) {
      console.error('Error creando conversación:', error);
      return null;
    }
  }

  // Marcar mensajes como leídos
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      if (!userId) return;

      await this.supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .is('read_at', null);
    } catch (error) {
      console.error('Error marcando mensajes como leídos:', error);
    }
  }

  // Obtener usuarios disponibles para nueva conversación
  async getAvailableUsers(currentUserId: string): Promise<any[]> {
    try {
      if (!currentUserId) return [];

      const { data, error } = await this.supabase
        .from('profiles')
        .select('id, name, avatar_url, role')
        .neq('id', currentUserId)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo usuarios disponibles:', error);
      return [];
    }
  }
}

export const messagingService = new MessagingService();
