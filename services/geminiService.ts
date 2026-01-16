
import { GoogleGenAI, Chat } from "@google/genai";
import { ZIPPY_SYSTEM_INSTRUCTION, ZIPPY_CONCIERGE_INSTRUCTION, ZIPPY_CONFIGURATOR_INSTRUCTION, ZIPPY_ONBOARDING_INSTRUCTION, ZIPPY_REFINEMENT_INSTRUCTION } from "../constants";
import { BookingDetails, TravelProfile, DraftTrip, TripOption, AppSettings } from "../types";

let mainChatSession: Chat | null = null;
let conciergeChatSession: Chat | null = null;
let configuratorChatSession: Chat | null = null;
let onboardingChatSession: Chat | null = null;
let refinementChatSession: Chat | null = null;
let ai: GoogleGenAI | null = null;

// Initialize the API client
const getAIClient = (): GoogleGenAI => {
  if (!ai) {
    if (!process.env.API_KEY) {
      console.error("API_KEY is missing from environment variables");
      throw new Error("API Key missing");
    }
    // Correctly initializing with named parameter as per guidelines.
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

// Start Main Planning Chat
export const startChatSession = (userProfile?: TravelProfile | null, settings?: AppSettings): void => {
  const client = getAIClient();
  
  let instruction = ZIPPY_SYSTEM_INSTRUCTION(settings);
  
  if (userProfile) {
    const profileContext = `
    
    [USER TRAVEL PROFILE - BASELINE]
    Use these preferences as a starting point.
    - Budget Level: ${userProfile.budget}
    - Trip Types: ${userProfile.interests.join(", ")}
    - Preferred Pace: ${userProfile.pace}
    - Accommodation Style: ${userProfile.accommodation}
    - Climate Preference: ${userProfile.climate}
    - Typical Duration: ${userProfile.duration}
    - Top Priority: ${userProfile.priority}
    
    [TRAVEL DNA]
    Nickname: ${userProfile.dna?.nickname || "N/A"}
    Style: ${userProfile.dna?.dominantStyle || "N/A"}
    Vibe: ${userProfile.dna?.description || "N/A"}
    `;
    instruction += profileContext;
  }

  mainChatSession = client.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: instruction,
      temperature: 0.9,
      topP: 0.95,
      topK: 40,
    },
  });
};

// Start Concierge Chat (Specific to a Trip)
export const startConciergeSession = (booking: BookingDetails, settings?: AppSettings): void => {
  const client = getAIClient();
  
  const context = `
    CONTEXT:
    User is traveling to: ${booking.trip.destination}
    Staying at: ${booking.hotel.name}
    Outbound Flight: ${booking.outboundFlight.airline} arriving at ${booking.outboundFlight.arrivalTime}
    Trip Style: ${booking.trip.mood}
    
    You are their personal digital concierge.
  `;

  conciergeChatSession = client.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: ZIPPY_CONCIERGE_INSTRUCTION(settings) + context,
      temperature: 0.8,
    },
  });
};

// Start Onboarding Chat (Step 2 - Interview)
export const startOnboardingSession = (trip: TripOption, settings?: AppSettings): void => {
  const client = getAIClient();
  const context = `[TARGET DESTINATION: ${trip.destination}]`;

  onboardingChatSession = client.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: ZIPPY_ONBOARDING_INSTRUCTION(settings) + context,
      temperature: 0.8,
    },
  });
};

// Start Refinement Chat (Phase 1 of Configurator)
export const startRefinementSession = (trip: TripOption, userProfile?: TravelProfile | null, settings?: AppSettings): void => {
    const client = getAIClient();
    
    let context = `
    [CURRENT TRIP FOCUS]
    Destination: ${trip.destination}
    Vibe from search: ${trip.mood}
    Est. Price Range: ${trip.estimated_price}
    `;

    if (userProfile) {
        context += `
        [USER DNA]
        Nickname: ${userProfile.dna?.nickname}
        Style: ${userProfile.dna?.dominantStyle}
        Prefers: ${userProfile.accommodation}, ${userProfile.pace} pace.
        `;
    }

    refinementChatSession = client.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
            systemInstruction: ZIPPY_REFINEMENT_INSTRUCTION(settings) + context,
            temperature: 0.7,
        }
    });
};

// Start Configurator Chat (Phase 2 - Selection/Draft Mode)
export const startConfiguratorSession = (draft: DraftTrip, settings?: AppSettings): void => {
  const client = getAIClient();
  
  // We strictly stringify the available options so the AI knows valid IDs
  const optionsContext = `
    [CURRENT DRAFT STATE - BUILDER PHASE]
    Destination: ${draft.baseTrip.destination}
    Travelers: ${draft.travelers}
    Currency: ${draft.currency}
    
    AVAILABLE FLIGHTS (Indices 0, 1, 2):
    ${JSON.stringify(draft.availableFlights.map((f, i) => ({ index: i, ...f.outbound })))}

    AVAILABLE HOTELS:
    ${JSON.stringify(draft.availableHotels)}

    AVAILABLE TRANSPORT:
    ${JSON.stringify(draft.availableTransports)}
  `;

  configuratorChatSession = client.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: ZIPPY_CONFIGURATOR_INSTRUCTION(settings) + optionsContext,
      temperature: 0.7, // Lower temp for more precise ID selection
    },
  });
};

// Send message to Gemini (Routing based on session type)
export const sendMessageToGemini = async (message: string, sessionType: 'main' | 'concierge' | 'configurator' | 'onboarding' | 'refinement' = 'main'): Promise<string> => {
  let session: Chat | null = null;
  
  if (sessionType === 'concierge') session = conciergeChatSession;
  else if (sessionType === 'configurator') session = configuratorChatSession;
  else if (sessionType === 'onboarding') session = onboardingChatSession;
  else if (sessionType === 'refinement') session = refinementChatSession;
  else session = mainChatSession;

  if (!session) {
    if (sessionType === 'main') {
        startChatSession();
        return sendMessageToGemini(message, 'main');
    } else {
        // Fallback or auto-restart could go here
        return "Thinking... (Session not active, please reload)";
    }
  }

  try {
    const response = await session.sendMessage({ message });
    // Correct use of response.text as a property.
    return response.text || "";
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    return "Ops! Ho avuto un piccolo intoppo tecnico. Riprova tra un attimo! 😅";
  }
};

// NEW: Generate Travel DNA based on survey answers
export const generateTravelDNA = async (answers: {question: string, answer: string}[], language: string = 'English'): Promise<{nickname: string, description: string, dominantStyle: string}> => {
  const client = getAIClient();
  const prompt = `
  Analyze these answers to create a "Travel DNA" profile.
  Language for output: ${language}
  
  ANSWERS:
  ${answers.map(a => `Q: ${a.question} A: ${a.answer}`).join('\n')}

  TASKS:
  1. Identify dominant travel style (e.g. Adventure, Relax, Culture, Foodie, Mix).
  2. Generate a fun, creative Nickname in ${language} (e.g. "The Wandering Panda", "Zen Master").
  3. Write a 2-3 sentence DNA description in ${language}, fun and fresh tone.

  Output JSON:
  {
    "nickname": "string",
    "description": "string",
    "dominantStyle": "string"
  }
  `;

  try {
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      
      // Correct use of response.text as a property.
      const text = response.text;
      if (!text) throw new Error("No text");
      return JSON.parse(text);
  } catch (e) {
      console.error(e);
      return { 
          nickname: "Mystery Traveler", 
          description: "A free spirit who defies definition. The world is your oyster!", 
          dominantStyle: "Eclectic" 
      };
  }
};
