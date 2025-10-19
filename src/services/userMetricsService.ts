import { supabase } from '@/config/supabase';

export interface UserMetrics {
  tripsCompleted: number;
  tripsThisMonth: number;
  co2Saved: number;
  co2ThisMonth: number;
  moneySaved: number;
  moneyThisMonth: number;
  messages: number;
  unreadMessages: number;
}

export interface UserImpact {
  co2Saved: number;
  treesEquivalent: number;
  monthlyProgress: number;
}

export interface UserMessage {
  id: string;
  content: string;
  created_at: string;
  isUnread: boolean;
  sender: {
    name: string;
    id: string;
  };
  trip: {
    route: string;
    id: string;
  };
}

class UserMetricsService {
  // Obtener métricas del usuario
  async getUserMetrics(userId: string, userRole: 'conductor' | 'pasajero'): Promise<UserMetrics> {
    try {
      // Aquí conectarías con tu API real para obtener datos del usuario
      // Por ahora calculamos datos basados en el rol del usuario
      const isConductor = userRole === 'conductor';
      
      // Datos calculados basados en el rol del usuario
      return {
        tripsCompleted: isConductor ? 24 : 18,
        tripsThisMonth: isConductor ? 8 : 6,
        co2Saved: isConductor ? 156.8 : 98.4,
        co2ThisMonth: isConductor ? 52.4 : 32.8,
        moneySaved: isConductor ? 89.50 : 67.20,
        moneyThisMonth: isConductor ? 29.80 : 22.40,
        messages: 12,
        unreadMessages: 3
      };
    } catch (error) {
      console.error('Error getting user metrics:', error);
      throw error;
    }
  }

  // Obtener datos de impacto ambiental del usuario
  async getUserImpact(userId: string, userRole: 'conductor' | 'pasajero'): Promise<UserImpact> {
    try {
      const isConductor = userRole === 'conductor';
      
      const co2Saved = isConductor ? 156.8 : 98.4;
      const treesEquivalent = Math.round(co2Saved / 22); // Aproximadamente 22kg CO2 por árbol al año
      const monthlyProgress = Math.min(Math.round((co2Saved / 200) * 100), 100); // Meta de 200kg CO2
      
      return {
        co2Saved,
        treesEquivalent,
        monthlyProgress
      };
    } catch (error) {
      console.error('Error getting user impact:', error);
      throw error;
    }
  }

  // Obtener mensajes recientes del usuario
  async getUserMessages(userId: string, userRole: 'conductor' | 'pasajero'): Promise<UserMessage[]> {
    try {
      const isConductor = userRole === 'conductor';
      
      return [
        {
          id: '1',
          content: isConductor 
            ? '¡Hola! ¿Te parece bien si nos encontramos en la parada de Metro?' 
            : '¿Podrías confirmarme la hora de salida?',
          created_at: '2024-01-15T10:30:00Z',
          isUnread: true,
          sender: {
            name: 'María García',
            id: 'user1'
          },
          trip: {
            route: 'Torrejón → Madrid',
            id: 'trip1'
          }
        },
        {
          id: '2',
          content: isConductor 
            ? 'Perfecto, nos vemos a las 8:00 como acordamos' 
            : 'Gracias por el viaje de ayer, fue muy cómodo',
          created_at: '2024-01-15T09:15:00Z',
          isUnread: false,
          sender: {
            name: 'Carlos López',
            id: 'user2'
          },
          trip: {
            route: 'Getafe → Madrid',
            id: 'trip2'
          }
        },
        {
          id: '3',
          content: isConductor 
            ? '¿Podrías confirmarme si mañana sigues disponible?' 
            : '¿Hay plazas disponibles para el viernes?',
          created_at: '2024-01-14T16:45:00Z',
          isUnread: true,
          sender: {
            name: 'Ana Martín',
            id: 'user3'
          },
          trip: {
            route: 'Alcalá → Madrid',
            id: 'trip3'
          }
        }
      ];
    } catch (error) {
      console.error('Error getting user messages:', error);
      throw error;
    }
  }

  // Obtener estadísticas de miembros
  async getMembersStats(): Promise<{
    total: number;
    conductores: number;
    pasajeros: number;
    verificados: number;
    amigos: number;
  }> {
    try {
      // Aquí conectarías con tu API real para obtener estadísticas
      return {
        total: 156,
        conductores: 89,
        pasajeros: 67,
        verificados: 142,
        amigos: 12
      };
    } catch (error) {
      console.error('Error getting members stats:', error);
      throw error;
    }
  }
}

export const userMetricsService = new UserMetricsService();
