

export interface Message {
  role: 'user' | 'model';
  text: string;
  isJson?: boolean;
  activityProposal?: ActivityProposal; // For Concierge proposals
}

export interface DayPlan {
  day: number;
  title: string;
  description: string;
  date?: string;
}

export interface TripOption {
  id: string; // Added for Favorites tracking
  title: string;
  destination: string;
  image?: string; // NEW: Real destination image
  summary: string;
  day_by_day: DayPlan[];
  activities: string[];
  mood: string;
  ideal_for: string;
  estimated_price: string;
  why_it_fits: string;
  metrics?: {
    adventure: number;
    relaxation: number;
    culture: number;
    food: number;
    nightlife: number;
  };
}

export interface TravelDNA {
  nickname: string;
  description: string;
  dominantStyle: string;
}

export interface TravelProfile {
  budget: 'Low' | 'Medium' | 'High';
  interests: string[]; // Max 3
  pace: 'Relaxed' | 'Balanced' | 'Fast-Paced';
  accommodation: 'Standard Hotel' | 'Boutique/Charm' | 'Resort/Luxury' | 'Apartment';
  climate: 'Hot' | 'Temperate' | 'Cold' | 'Any';
  duration: 'Weekend' | '4-7 Days' | '8-14 Days' | '15+ Days';
  priority: 'Savings' | 'Comfort' | 'Unique Experiences';
  email?: string; 
  password?: string;
  dna?: TravelDNA; // NEW: AI Generated Persona
  travelers?: number;
}

// NEW: App-Wide Settings
export interface AppSettings {
  language: 'English' | 'Italiano' | 'Español' | 'Français' | 'Deutsch';
  currency: 'EUR' | 'USD' | 'GBP' | 'JPY';
  theme: 'light' | 'dark' | 'system';
  aiTone: 'Fun & Energetic' | 'Professional & Formal' | 'Concise & Direct';
  notifications: {
    push: boolean;
    email: boolean;
    reminders: boolean;
  };
}

export interface PaymentMethod {
  id: string;
  type: 'Visa' | 'Mastercard' | 'Amex';
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export interface TravelDocument {
    id: string;
    name: string;
    date: string;
    type: 'Voucher' | 'Receipt' | 'Ticket';
}

// NEW: Data collected during the Refinement Wizard
export interface RefinedTripRequest {
  destination: string;
  startDate?: string;
  endDate?: string;
  duration?: string; // NEW: Duration for flexible dates
  flexibleMonths?: string[]; // NEW: Multiple months selection
  isFlexibleDate: boolean;
  travelers: number;
  // Enhanced Traveler Details
  adults: number;
  children: number;
  childAges: number[];
  hasPet: boolean;
  
  travelerType: 'Solo' | 'Partner' | 'Friends' | 'Family';
  
  // GRANULAR BUDGET PREFERENCES
  flightBudget: 'Economy' | 'Comfort' | 'Luxury';
  hotelBudget: 'Economy' | 'Comfort' | 'Luxury';
  transportBudget: 'Economy' | 'Comfort' | 'Luxury';
  activityBudget: 'Economy' | 'Comfort' | 'Luxury';
  
  // Legacy global budget (kept for compatibility, though granular is preferred)
  budgetLevel: 'Budget' | 'Medium' | 'Luxury';
  
  selectedInterests: string[];
  // Legacy fields for compatibility
  flightPref?: string;
  hotelPref?: string;
  transportPref?: string;
}

export interface DetailedPreferences {
  flightPriority: 'Price' | 'Balanced' | 'Comfort' | 'Speed';
  hotelStyle: 'Modern' | 'Boutique' | 'Luxury' | 'Minimal' | 'Traditional';
  hotelLocation: 'City Center' | 'Quiet' | 'Beach/Nature' | 'No Preference';
  transportMode: 'Private' | 'Public' | 'Rental' | 'Mix';
  activityVibe: string[]; // e.g., ["Food", "Adventure"]
  budgetStrategy: 'Strict Cap' | 'Best Value' | 'Splurge';
}

export interface UserPreferences {
  inferred_mood: string;
  inferred_style: string;
  loves: string[];
  avoids: string[];
  // Legacy fields kept optional for safety
  budget?: string;
  dates?: string;
  duration_days?: number;
  travelers?: number;
}

export interface TripResponse {
  user_preferences: UserPreferences;
  trip_options: TripOption[];
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  from: string;
  to: string;
  price: number;
  class: 'Economy' | 'Business' | 'First';
  baggage: string;
  stops: string; // NEW: e.g. "Direct" or "1 stop"
}

export interface Hotel {
  id: string;
  name: string;
  stars: number;
  image: string;
  roomType: string;
  price: number; // Price per person/total depending on calculation logic
  location: string;
  tags?: string[];
}

export interface Transport {
  id: string;
  type: string;
  description: string;
  price: number;
  icon: string;
}

export interface Pricing {
  base: number;
  taxes: number;
  fees: number;
  total: number;
  currency: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  bookedAt: string;
}

// Used when AI proposes an activity in chat
export interface ActivityProposal {
  title: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  bookedAt?: string;
}

export interface TripRecommendation {
  type: 'info' | 'tip' | 'reminder' | 'upgrade';
  title: string;
  description: string;
  icon: string;
}

// The Final Confirmed Booking
export interface BookingDetails {
  id: string; // Unique booking ID
  trip: TripOption;
  outboundFlight: Flight;
  returnFlight: Flight;
  hotel: Hotel;
  transport: Transport;
  pricing: Pricing;
  travelers: number;
  dateBooked: string; // ISO date string
  bookedActivities: Activity[]; // New field for post-booking
  destinationImage: string; // Stable image URL
  recommendations: TripRecommendation[]; // New field for Zippy Intel
}

// The Draft State during Customization
export interface DraftTrip {
  id?: string; // NEW: Unique ID for the draft
  updatedAt?: string; // NEW: To sort by recent
  baseTrip: TripOption;
  travelers: number;
  currency: string;
  
  // Options available to choose from
  availableFlights: { outbound: Flight, return: Flight }[];
  availableHotels: Hotel[];
  availableTransports: Transport[];
  availableActivities: ActivityProposal[];

  // Current Selections
  selectedFlightIndex: number;
  selectedHotelId: string;
  selectedTransportId: string; // Main selection (e.g. arrival or rental)
  selectedActivityIndices: number[];
  
  // NEW: Map specific items to specific days (0-based Day Index)
  activityDayMap: Record<number, number>; // Activity Index -> Day Index
  transportDayMap: Record<number, string>; // Day Index -> Transport ID
}

// Actions the AI can take in the Configurator
export type ConfigActionType = 
  | 'SELECT_FLIGHT' 
  | 'SELECT_HOTEL' 
  | 'SELECT_TRANSPORT' 
  | 'ADD_HOTEL' 
  | 'ADD_ACTIVITY' 
  | 'ADD_FLIGHT' 
  | 'ADD_TRANSPORT' 
  | 'SWITCH_TAB' 
  | 'BUILD_TRIP' 
  | 'REFINEMENT_COMPLETE'
  | 'UPDATE_ITINERARY' 
  | 'UPDATE_DRAFT_DETAILS'
  | 'UPDATE_TRIP_DETAILS' // NEW: Simpler action for changing days/travelers
  | 'REMOVE_ACTIVITY';    // NEW: Action to remove items

export interface ConfiguratorAction {
  action: ConfigActionType;
  tab?: string; // for switching tabs
  id?: string; // for selecting items
  index?: number; // for selecting flights or removing activities
  data?: any; // for creating NEW items OR passing RefinedTripRequest OR new itinerary
  text_response: string; // What the AI says to the user
}
