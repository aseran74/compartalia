// Tipos para el sistema de carpooling
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  rating: number;
  totalTrips: number;
  preferences: UserPreferences;
  verified: boolean;
  createdAt: Date;
}

export interface UserPreferences {
  maxDeviation: number; // metros de desviación máxima
  maxWaitTime: number; // minutos de espera máxima
  walkDistance: number; // metros que está dispuesto a caminar
  preferredHubs: string[]; // hubs preferidos para transbordos
  smokingAllowed: boolean;
  petsAllowed: boolean;
  musicPreference: 'none' | 'low' | 'normal' | 'high';
}

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: 'origin' | 'destination' | 'waypoint' | 'hub';
}

export interface Route {
  id: string;
  origin: Location;
  destination: Location;
  waypoints: Location[];
  distance: number; // en metros
  estimatedDuration: number; // en minutos
  polyline?: string; // para dibujar en el mapa
}

export interface Trip {
  id: string;
  driver: User;
  route: Route;
  departureTime: Date;
  arrivalTime: Date;
  availableSeats: number;
  pricePerSeat: number;
  currency: string;
  status: 'active' | 'full' | 'completed' | 'cancelled';
  description?: string;
  vehicle: Vehicle;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  seats: number;
  features: VehicleFeatures;
}

export interface VehicleFeatures {
  airConditioning: boolean;
  smokingAllowed: boolean;
  petsAllowed: boolean;
  luggageSpace: boolean;
  wifi: boolean;
  chargingPorts: boolean;
}

export interface Booking {
  id: string;
  trip: Trip;
  passenger: User;
  pickupLocation: Location;
  dropoffLocation: Location;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  price: number;
  currency: string;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RouteMatch {
  id: string;
  originalRoute: Route;
  compatibleRoute: Route;
  sharedDistance: number;
  totalDeviation: number;
  compatibilityScore: number;
  sharedSegment: Location;
  estimatedPickupTime: Date;
  estimatedDropoffTime: Date;
}

export interface Hub {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  facilities: string[];
  description?: string;
}

export interface ChatMessage {
  id: string;
  tripId: string;
  sender: User;
  message: string;
  timestamp: Date;
  type: 'text' | 'image' | 'location';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'booking_request' | 'booking_confirmed' | 'trip_reminder' | 'route_match' | 'message';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

// Enums para estados
export enum TripStatus {
  ACTIVE = 'active',
  FULL = 'full',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

// Interfaces para filtros y búsquedas
export interface TripFilters {
  origin?: string;
  destination?: string;
  departureDate?: Date;
  departureTime?: string;
  maxPrice?: number;
  availableSeats?: number;
  smokingAllowed?: boolean;
  petsAllowed?: boolean;
  vehicleFeatures?: Partial<VehicleFeatures>;
}

export interface SearchParams {
  origin: Location;
  destination: Location;
  departureDate: Date;
  departureTime?: string;
  passengers: number;
  preferences: Partial<UserPreferences>;
}
