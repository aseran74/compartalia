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
  other_user: {
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

  // Obtener conversaciones del usuario actual
  async getConversations(firebaseUserId?: string): Promise<Conversation[]> {
    try {
      let userId = firebaseUserId;
      
      if (!userId) {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');
        userId = user.id;
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

      if (error) throw error;

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
            other_user: {
              id: otherUser.id,
              name: otherUser.name,
              avatar_url: otherUser.avatar_url,
              role: otherUser.role
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
  async sendMessage(conversationId: string, content: string): Promise<Message | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await this.supabase
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

      if (error) throw error;

      // Actualizar timestamp de la conversación
      await this.supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data;
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      return null;
    }
  }

  // Crear nueva conversación
  async createConversation(otherUserId: string, firebaseUserId?: string): Promise<Conversation | null> {
    try {
      let userId = firebaseUserId;
      
      if (!userId) {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');
        userId = user.id;
      }

      // Verificar si ya existe una conversación
      const { data: existingConv } = await this.supabase
        .from('conversations')
        .select('*')
        .or(`and(user1_id.eq.${userId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${userId})`)
        .single();

      if (existingConv) {
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
        other_user: {
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
  async markMessagesAsRead(conversationId: string): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return;

      await this.supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);
    } catch (error) {
      console.error('Error marcando mensajes como leídos:', error);
    }
  }

  // Obtener usuarios disponibles para nueva conversación
  async getAvailableUsers(): Promise<any[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await this.supabase
        .from('profiles')
        .select('id, name, avatar_url, role')
        .neq('id', user.id)
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
