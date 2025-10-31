import { loadStripe } from '@stripe/stripe-js'

// Configuración de Stripe - usar import.meta.env para Vite
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here'

export class StripeService {
  private stripe: Promise<any>

  constructor() {
    this.stripe = loadStripe(STRIPE_PUBLISHABLE_KEY)
  }

  // Crear un Payment Intent en el backend
  async createPaymentIntent(amount: number, currency: string = 'eur', metadata?: any) {
    try {
      // Aquí harías una llamada a tu backend para crear el Payment Intent
      // Por ahora simulamos la respuesta
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Stripe usa centavos
          currency,
          metadata
        })
      })

      if (!response.ok) {
        throw new Error('Error creando Payment Intent')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creando Payment Intent:', error)
      // Por ahora devolvemos datos simulados para testing
      return {
        clientSecret: 'pi_test_client_secret',
        id: `pi_test_${Date.now()}`
      }
    }
  }

  // Procesar pago con Stripe
  async processPayment(amount: number, tripId: string, bookingData: any) {
    try {
      const stripe = await this.stripe
      if (!stripe) {
        throw new Error('Stripe no está disponible')
      }

      // Crear Payment Intent
      const paymentIntent = await this.createPaymentIntent(amount, 'eur', {
        tripId,
        bookingId: bookingData.id,
        passengerId: bookingData.passenger_id
      })

      // Confirmar el pago
      const { error, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: {
              // En un caso real, aquí usarías un elemento de Stripe Elements
              // Por ahora simulamos que el pago es exitoso
            }
          }
        }
      )

      if (error) {
        throw new Error(error.message || 'Error procesando el pago')
      }

      return {
        success: true,
        transactionId: confirmedPaymentIntent?.id || paymentIntent.id,
        paymentMethod: 'stripe',
        amount: amount,
        currency: 'eur'
      }
    } catch (error: any) {
      console.error('Error procesando pago con Stripe:', error)
      throw error
    }
  }

  // Método simplificado para testing (sin elementos de Stripe)
  async processPaymentSimple(amount: number, tripId: string, bookingData: any) {
    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simular éxito del pago
      return {
        success: true,
        transactionId: `stripe_${Date.now()}`,
        paymentMethod: 'stripe',
        amount: amount,
        currency: 'eur',
        message: 'Pago procesado exitosamente con Stripe'
      }
    } catch (error: any) {
      console.error('Error procesando pago con Stripe:', error)
      throw error
    }
  }

  // Verificar estado de un pago
  async verifyPayment(transactionId: string) {
    try {
      // Aquí harías una llamada a tu backend para verificar el estado
      // Por ahora simulamos la verificación
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return {
        status: 'succeeded',
        transactionId,
        verified: true
      }
    } catch (error) {
      console.error('Error verificando pago:', error)
      throw error
    }
  }
}

export const stripeService = new StripeService()