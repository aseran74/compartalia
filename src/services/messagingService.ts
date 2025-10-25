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
  async getConversations(firebaseUserId?: string): Promise<Conversation[]> {
    try {
      console.log('🔍 getConversations - firebaseUserId recibido:', firebaseUserId);
      
      if (!firebaseUserId) {
        console.log('No hay firebaseUserId proporcionado, retornando array vacío');
        return [];
      }

      // Buscar el perfil en Supabase usando el firebaseUserId
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('id', firebaseUserId)
        .single();

      if (profileError || !profile) {
        console.log('No se encontró perfil para el usuario:', firebaseUserId);
        return [];
      }

      console.log('🔍 getConversations - perfil encontrado:', profile);

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
        .or(`user1_id.eq.${profile.id},user2_id.eq.${profile.id}`)
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
          const otherUser = conv.user1_id === profile.id ? conv.user2 : conv.user1;
          const otherUserId = conv.user1_id === profile.id ? conv.user2_id : conv.user1_id;

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
  async sendMessage(conversationId: string, content: string, firebaseUserId?: string): Promise<Message | null> {
    try {
      const userId = firebaseUserId;
      
      if (!userId) {
        console.log('No se proporcionó firebaseUserId');
        throw new Error('Usuario no autenticado');
      }

      console.log('Enviando mensaje con userId:', userId);

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
      console.log('🔍 createConversation - firebaseUserId:', firebaseUserId, 'otherUserId:', otherUserId);
      
      if (!firebaseUserId) {
        console.log('No hay firebaseUserId proporcionado, no se puede crear conversación');
        return null;
      }

      // Buscar el perfil del usuario actual
      const { data: currentProfile, error: currentProfileError } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('id', firebaseUserId)
        .single();

      if (currentProfileError || !currentProfile) {
        console.log('No se encontró perfil del usuario actual:', firebaseUserId);
        return null;
      }

      // Buscar el perfil del otro usuario
      const { data: otherProfile, error: otherProfileError } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('id', otherUserId)
        .single();

      if (otherProfileError || !otherProfile) {
        console.log('No se encontró perfil del otro usuario:', otherUserId);
        return null;
      }

      console.log('🔍 createConversation - perfiles encontrados:', { currentProfile, otherProfile });

      // Verificar si ya existe una conversación
      const { data: existingConv } = await this.supabase
        .from('conversations')
        .select('*')
        .or(`and(user1_id.eq.${currentProfile.id},user2_id.eq.${otherProfile.id}),and(user1_id.eq.${otherProfile.id},user2_id.eq.${currentProfile.id})`)
        .single();

      if (existingConv) {
        console.log('🔍 createConversation - conversación existente encontrada:', existingConv);
        // Retornar conversación existente
        const conversations = await this.getConversations(firebaseUserId);
        return conversations.find(c => c.id === existingConv.id) || null;
      }

      // Crear nueva conversación
      const { data, error } = await this.supabase
        .from('conversations')
        .insert({
          user1_id: currentProfile.id,
          user2_id: otherProfile.id
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
