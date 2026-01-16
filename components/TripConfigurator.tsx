
import React, { useState, useMemo, useEffect } from 'react';
import { DraftTrip, BookingDetails, Message, ConfiguratorAction, Hotel, Flight, Transport, ActivityProposal, TripOption, RefinedTripRequest, TravelProfile, DayPlan } from '../types';
import { convertDraftToBooking, generateSmartDraft, updateDraftStructure } from '../services/mockDataService';
import ChatInterface from './ChatInterface';
import { startConfiguratorSession, sendMessageToGemini } from '../services/geminiService';
import BookingModal from './BookingModal';

interface TripConfiguratorProps {
  baseTrip: TripOption;
  initialDraft?: DraftTrip | null; // For resuming functionality
  onClose: () => void;
  onConfirm: (booking: BookingDetails) => void;
  onDraftUpdate: (draft: DraftTrip) => void; // For auto-saving
  userProfile?: TravelProfile | null;
}

type Phase = 'refinement' | 'building' | 'builder' | 'checkout';
// Updated ModalType to include context (which day triggered it)
type ModalType = { type: 'flight' | 'hotel' | 'transport' | 'activity', dayIndex?: number } | null;

// --- WIZARD CONSTANTS ---
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TRAVELER_TYPES = [
    { id: 'Solo', label: 'Solo Trip', icon: '👤', desc: 'Just me, myself & I' },
    { id: 'Partner', label: 'Partner', icon: '💑', desc: 'Romantic getaway' },
    { id: 'Friends', label: 'Friends', icon: '👯‍♀️', desc: 'Group fun' },
    { id: 'Family', label: 'Family', icon: '👨‍👩‍👧', desc: 'All together' }
];

const TripConfigurator: React.FC<TripConfiguratorProps> = ({ baseTrip, initialDraft, onClose, onConfirm, onDraftUpdate, userProfile }) => {
  // Phase State: If initialDraft exists, skip refinement directly to builder
  const [phase, setPhase] = useState<Phase>(initialDraft ? 'builder' : 'refinement');
  
  // --- WIZARD STATE ---
  const [wizardStep, setWizardStep] = useState(0); 
  const [dateMode, setDateMode] = useState<'precise' | 'month'>('precise');

  const [wizardData, setWizardData] = useState<RefinedTripRequest>({
      destination: baseTrip.destination,
      isFlexibleDate: false, 
      travelers: userProfile?.travelers || 2,
      adults: userProfile?.travelers || 2,
      children: 0,
      childAges: [],
      hasPet: false,
      travelerType: 'Partner',
      flightBudget: 'Comfort',
      hotelBudget: 'Comfort',
      transportBudget: 'Comfort',
      activityBudget: 'Comfort',
      budgetLevel: userProfile?.budget === 'High' ? 'Luxury' : userProfile?.budget === 'Low' ? 'Budget' : 'Medium',
      selectedInterests: [],
      startDate: '',
      endDate: '',
      duration: '',
      flexibleMonths: [] // Init flexibleMonths
  });

  // Custom Interest Input State
  const [customInterestInput, setCustomInterestInput] = useState('');

  // Builder Data State (Step 3) - Init with draft if available
  const [draft, setDraft] = useState<DraftTrip | null>(initialDraft || null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  
  // UI State
  const [showChat, setShowChat] = useState(false); 

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Init Wizard logic only if NOT resuming
  useEffect(() => {
     if (!initialDraft && baseTrip.mood.toLowerCase().includes('honeymoon')) {
         setWizardData(prev => ({ 
             ...prev, 
             travelerType: 'Partner', 
             travelers: 2,
             adults: 2,
             children: 0
         }));
     }
  }, [baseTrip, userProfile, initialDraft]);

  // --- AUTO SAVE EFFECT ---
  useEffect(() => {
      if (draft && phase === 'builder') {
          const draftToSave: DraftTrip = {
              ...draft,
              id: draft.id || `draft_${draft.baseTrip.id}_${Date.now()}`,
              updatedAt: new Date().toISOString()
          };
          onDraftUpdate(draftToSave);
      }
  }, [draft, phase]);

  // --- LOGIC: DYNAMIC DESTINATION TAGS ---
  const destinationTags = useMemo(() => {
      const d = baseTrip.destination.toLowerCase();
      if (d.includes('maldive') || d.includes('bora') || d.includes('fiji') || d.includes('bahama') || d.includes('cancun') || d.includes('bali') || d.includes('hawaii') || d.includes('phuket')) {
          return ['Overwater Villas', 'Snorkeling', 'Romantic Dinners', 'Spa & Wellness', 'Water Sports', 'Sunset Cruise', 'Scuba Diving', 'Private Beach'];
      }
      if (d.includes('york') || d.includes('tokyo') || d.includes('london') || d.includes('paris') || d.includes('dubai') || d.includes('singapore') || d.includes('shanghai') || d.includes('los angeles') || d.includes('milan')) {
          return ['Skyline Views', 'Museums', 'Shopping Spree', 'Fine Dining', 'Nightlife', 'Theater/Shows', 'Architecture', 'Local Markets'];
      }
      if (d.includes('alp') || d.includes('aspen') || d.includes('switzerland') || d.includes('dolomites') || d.includes('reykjavik') || d.includes('iceland') || d.includes('patagonia') || d.includes('banff')) {
          return ['Skiing/Snowboarding', 'Apres-Ski', 'Mountain Views', 'Hiking Trails', 'Thermal Spas', 'Cozy Chalets', 'Northern Lights', 'Wildlife'];
      }
      if (d.includes('rome') || d.includes('athens') || d.includes('cairo') || d.includes('kyoto') || d.includes('petra') || d.includes('machu') || d.includes('istanbul') || d.includes('cusco')) {
          return ['Ancient Ruins', 'Temples', 'History Tours', 'Local Cuisine', 'Art Galleries', 'Walking Tours', 'Museums', 'Religious Sites'];
      }
      return ['Must-see Attractions', 'Hidden Gems', 'Great Food', 'Nightlife', 'Relaxation', 'Museums', 'Nature', 'Shopping'];
  }, [baseTrip.destination]);

  const addCustomInterest = () => {
      if (!customInterestInput.trim()) return;
      const val = customInterestInput.trim();
      if (!wizardData.selectedInterests.includes(val)) {
          setWizardData(prev => ({
              ...prev,
              selectedInterests: [...prev.selectedInterests, val]
          }));
      }
      setCustomInterestInput('');
  };

  const handleTravelerTypeChange = (typeId: 'Solo' | 'Partner' | 'Friends' | 'Family') => {
      let newData: Partial<RefinedTripRequest> = { travelerType: typeId };
      if (typeId === 'Solo') newData = { ...newData, travelers: 1, adults: 1, children: 0, childAges: [] };
      else if (typeId === 'Partner') newData = { ...newData, travelers: 2, adults: 2, children: 0, childAges: [] };
      else if (typeId === 'Family') {
          if (wizardData.travelerType !== 'Family') newData = { ...newData, travelers: 3, adults: 2, children: 1, childAges: [5] };
      } else if (typeId === 'Friends') {
          if (wizardData.travelers < 2) newData = { ...newData, travelers: 3, adults: 3, children: 0 };
          else newData = { ...newData, adults: wizardData.travelers, children: 0, childAges: [] };
      }
      setWizardData(prev => ({ ...prev, ...newData }));
  };

  const updateChildAge = (index: number, age: number) => {
      const newAges = [...wizardData.childAges];
      newAges[index] = age;
      setWizardData(prev => ({ ...prev, childAges: newAges }));
  };

  // --- LOGIC: CHAT HANDLER ---
  const handleChatSend = async () => {
      if (!chatInput.trim() || isChatLoading) return;
      const text = chatInput;
      setChatInput('');
      setMessages(prev => [...prev, { role: 'user', text }]);
      setIsChatLoading(true);
      try {
        const responseText = await sendMessageToGemini(text, 'configurator');
        
        // Relaxed Regex: Tries to find JSON even if fences are missing or malformed
        const jsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
        const match = responseText.match(jsonRegex);
        
        let replyText = responseText;
        let actionData: ConfiguratorAction | null = null;

        if (match && match[1]) {
            try {
                actionData = JSON.parse(match[1]);
            } catch (e) { console.error("JSON Parse Error (Fenced):", e); }
        } else {
            // Fallback: Try to find a raw JSON object block enclosed in braces
            const rawMatch = responseText.match(/({[\s\S]*"action"[\s\S]*})/);
            if (rawMatch && rawMatch[1]) {
                try {
                    actionData = JSON.parse(rawMatch[1]);
                } catch (e) { console.error("JSON Parse Error (Raw):", e); }
            }
        }

        if (actionData && (phase === 'builder' || phase === 'refinement')) {
            replyText = actionData.text_response || "Done!";
            handleBuilderAction(actionData);
            
            // Remove the JSON part from display if we parsed it successfully
            if (replyText === responseText) {
                 replyText = responseText.replace(jsonRegex, '').replace(/({[\s\S]*"action"[\s\S]*})/, '').trim();
                 if (!replyText) replyText = actionData.text_response;
            }
        }
        
        if (replyText) setMessages(prev => [...prev, { role: 'model', text: replyText }]);
      } catch (e) {
          console.error(e);
          setMessages(prev => [...prev, { role: 'model', text: "Hmm, technical glitch. Try again?" }]);
      } finally { setIsChatLoading(false); }
  };

  const handleBuilderAction = (actionData: ConfiguratorAction) => {
    console.log("Executing Action:", actionData);
    if (actionData.action === 'SWITCH_TAB' && actionData.tab) {
        if (actionData.tab === 'flights') setActiveModal({ type: 'flight' });
        else if (actionData.tab === 'stay') setActiveModal({ type: 'hotel' });
        else if (actionData.tab === 'transport') setActiveModal({ type: 'transport' });
        else if (actionData.tab === 'experiences') setActiveModal({ type: 'activity' });
    } 
    else if (actionData.action === 'SELECT_FLIGHT' && actionData.index !== undefined) {
        setDraft(prev => prev ? ({ ...prev, selectedFlightIndex: actionData.index! }) : null);
        setActiveModal(null);
    }
    else if (actionData.action === 'SELECT_HOTEL' && actionData.id) {
        setDraft(prev => prev ? ({ ...prev, selectedHotelId: actionData.id! }) : null);
        setActiveModal(null);
    }
    else if (actionData.action === 'SELECT_TRANSPORT' && actionData.id) {
        setDraft(prev => prev ? ({ ...prev, selectedTransportId: actionData.id! }) : null);
        setActiveModal(null);
    }
    else if (actionData.action === 'ADD_HOTEL' && actionData.data) {
        const newHotel = { ...actionData.data, id: `gen_h_${Date.now()}` } as Hotel;
        setDraft(prev => prev ? ({ ...prev, availableHotels: [newHotel, ...prev.availableHotels], selectedHotelId: newHotel.id }) : null);
        setActiveModal(null);
    }
    else if (actionData.action === 'ADD_FLIGHT' && actionData.data) {
            const newFlightPair = actionData.data as { outbound: Flight, return: Flight };
            newFlightPair.outbound.id = `gen_f_out_${Date.now()}`;
            newFlightPair.return.id = `gen_f_ret_${Date.now()}`;
            setDraft(prev => prev ? ({ ...prev, availableFlights: [newFlightPair, ...prev.availableFlights], selectedFlightIndex: 0 }) : null);
            setActiveModal(null);
    }
    else if (actionData.action === 'ADD_TRANSPORT' && actionData.data) {
        const newTransport = { ...actionData.data, id: `gen_t_${Date.now()}` } as Transport;
        const requestedDay = actionData.data.day !== undefined ? parseInt(actionData.data.day) - 1 : 0; // 1-based to 0-based

        setDraft(prev => {
            if (!prev) return null;
            const newTransports = [newTransport, ...prev.availableTransports];
            // Update Transport Map for the specific day
            const newMap = { ...prev.transportDayMap };
            
            // Intelligent logic: If AI added a Car Rental, maybe apply to all days?
            // For now, let's assume specific day unless AI implies otherwise.
            // But if it's "Car Rental", we might want to fill gaps.
            // Let's stick to simple day assignment for safety.
            if (requestedDay >= 0) newMap[requestedDay] = newTransport.id;

            return { ...prev, availableTransports: newTransports, transportDayMap: newMap };
        });
        setActiveModal(null);
    }
    else if (actionData.action === 'ADD_ACTIVITY' && actionData.data) {
        let newActivity = actionData.data as any; // Cast to any for robust check
        
        // 1. Validate Structure - Prevent Crash if AI sends partial data
        if (typeof newActivity !== 'object' || newActivity === null) {
             newActivity = { title: "New Activity", price: 50, currency: "€", duration: "2h" };
        }
        if (!newActivity.title) newActivity.title = "Custom Activity";
        if (!newActivity.price) newActivity.price = 50; // Default price
        if (!newActivity.currency) newActivity.currency = "€";
        if (!newActivity.description) newActivity.description = "Added via chat.";
        if (!newActivity.duration) newActivity.duration = "2h";

        // 2. Parse Day
        let requestedDay = 0;
        if (newActivity.day !== undefined) {
            // Handle if day is string "4" or number 4
            const p = parseInt(newActivity.day.toString(), 10);
            if (!isNaN(p)) requestedDay = p;
        }

        setDraft(prev => {
            if (!prev) return null;
            
            // Append new activity to available list
            const newActivities = [...prev.availableActivities, newActivity];
            const newIdx = newActivities.length - 1;
            
            // 3. Determine Day Index (0-based)
            let targetDayIndex = 0;
            const totalDays = prev.baseTrip.day_by_day.length;

            if (requestedDay > 0) {
                // If user said "Day 4", requestedDay is 4. Index is 3.
                // Clamp between 0 and totalDays-1
                targetDayIndex = Math.max(0, Math.min(requestedDay - 1, totalDays - 1));
            } else {
                // Heuristic: First non-arrival day, or append to end if full? 
                // Simple: Day 2 (index 1) if available, else Day 1 (index 0)
                targetDayIndex = totalDays > 1 ? 1 : 0;
            }

            const updatedMap = { ...prev.activityDayMap };
            updatedMap[newIdx] = targetDayIndex;

            return { 
                ...prev, 
                availableActivities: newActivities, 
                selectedActivityIndices: [...prev.selectedActivityIndices, newIdx], // Select it!
                activityDayMap: updatedMap
            };
        });
        setActiveModal(null);
    }
    else if (actionData.action === 'REMOVE_ACTIVITY') {
        setDraft(prev => {
             if (!prev) return null;
             const current = prev.selectedActivityIndices;
             if (current.length === 0) return prev;
             
             let newIndices = [...current];
             let removedIndex = -1;

             if (typeof actionData.index === 'number' && actionData.index < newIndices.length) {
                 removedIndex = newIndices[actionData.index]; // Get the actual ActivityID (index)
                 newIndices.splice(actionData.index, 1);
             } else {
                 removedIndex = newIndices.pop()!;
             }
             
             // Optional: Clean up map (not strictly necessary as we filter by selected indices)
             const updatedMap = { ...prev.activityDayMap };
             delete updatedMap[removedIndex];

             return { ...prev, selectedActivityIndices: newIndices, activityDayMap: updatedMap };
        });
    }
    else if (actionData.action === 'UPDATE_ITINERARY' && actionData.data) {
        const newItinerary = actionData.data as DayPlan[];
        setDraft(prev => prev ? ({ ...prev, baseTrip: { ...prev.baseTrip, day_by_day: newItinerary } }) : null);
    }
    else if (actionData.action === 'UPDATE_DRAFT_DETAILS' && actionData.data) {
        const updates = actionData.data;
        setDraft(prev => prev ? ({ ...prev, ...updates }) : null);
    }
    else if (actionData.action === 'UPDATE_TRIP_DETAILS' && actionData.data) {
         setDraft(prev => prev ? updateDraftStructure(prev, actionData.data) : null);
    }
  };

  const handleSelectFlight = (index: number) => { setDraft(prev => prev ? ({ ...prev, selectedFlightIndex: index }) : null); setActiveModal(null); };
  const handleSelectHotel = (id: string) => { setDraft(prev => prev ? ({ ...prev, selectedHotelId: id }) : null); setActiveModal(null); };
  
  // Updated Transport Selection for specific days
  const handleSelectTransport = (id: string) => { 
      setDraft(prev => {
          if (!prev) return null;
          const selectedT = prev.availableTransports.find(t => t.id === id);
          const isCarRental = selectedT?.type.toLowerCase().includes('rental') || selectedT?.type.toLowerCase().includes('suv') || selectedT?.type.toLowerCase().includes('car');
          
          let newMap = { ...prev.transportDayMap };
          const targetDay = activeModal?.dayIndex !== undefined ? activeModal.dayIndex : 0;

          if (isCarRental) {
              // Intelligent Logic: If selecting a Rental Car, apply to ALL days from this day onwards?
              // Or simply apply to all days because rentals are usually whole-trip.
              // Let's apply to ALL days to be smart.
              prev.baseTrip.day_by_day.forEach((_, idx) => {
                  newMap[idx] = id;
              });
          } else {
              // Daily Transport (Taxi, Scooter)
              newMap[targetDay] = id;
          }

          return { ...prev, selectedTransportId: id, transportDayMap: newMap };
      });
      setActiveModal(null); 
  };
  
  const handleToggleActivity = (index: number) => {
    setDraft(prev => {
        if (!prev) return null;
        const current = prev.selectedActivityIndices;
        const isAlreadySelected = current.includes(index);
        
        let newMap = { ...prev.activityDayMap };
        
        if (!isAlreadySelected) {
            // We are adding it. Check if we have a context day from the modal.
            if (activeModal?.dayIndex !== undefined) {
                newMap[index] = activeModal.dayIndex;
            } else {
                // Fallback: put on first available day or day 1
                newMap[index] = 0;
            }
        }

        return isAlreadySelected 
            ? { ...prev, selectedActivityIndices: current.filter(i => i !== index) } 
            : { ...prev, selectedActivityIndices: [...current, index], activityDayMap: newMap };
    });
  };

  const handleFinishWizard = () => {
      setPhase('building');
      setTimeout(() => {
          const smartDraft = generateSmartDraft(baseTrip, undefined, wizardData);
          setDraft(smartDraft);
          startConfiguratorSession(smartDraft);
          setMessages([{ role: 'model', text: `Here we go! I've built a custom trip to ${baseTrip.destination} for ${wizardData.travelers} people. 🛠️\n\nFeel free to tweak the plan using the buttons on the right, OR just ask me here in the chat to change flights, swap hotels, or add cool activities! I'm here to help. 😉` }]);
          setPhase('builder');
          if (window.innerWidth >= 1024) setShowChat(true);
      }, 2500);
  };

  const currentTotals = useMemo(() => {
    if (!draft) return { flight: 0, hotel: 0, transport: 0, activityTotal: 0, subtotal: 0, taxes: 0, total: 0 };
    const flight = draft.availableFlights[draft.selectedFlightIndex].outbound.price * draft.travelers;
    const hotel = draft.availableHotels.find(h => h.id === draft.selectedHotelId)!.price;
    
    // Calculate Transport Total based on unique days logic (simplified sum for MVP)
    // We sum the price of all transports assigned in the map
    let transport = 0;
    const usedTransportIds = Object.values(draft.transportDayMap || {});
    // Check if any is rental to avoid double counting (rental usually 1x price, daily is Nx)
    const hasRental = usedTransportIds.some(id => {
        const t = draft.availableTransports.find(tr => tr.id === id);
        return t?.type.toLowerCase().includes('rental');
    });

    if (hasRental) {
        // Find the rental price (once)
        const rentalId = usedTransportIds.find(id => {
             const t = draft.availableTransports.find(tr => tr.id === id);
             return t?.type.toLowerCase().includes('rental');
        });
        const rental = draft.availableTransports.find(t => t.id === rentalId);
        if (rental) transport = rental.price;
    } else {
        // Sum daily
        usedTransportIds.forEach(id => {
            const t = draft.availableTransports.find(tr => tr.id === id);
            if (t) transport += t.price;
        });
        // Fallback
        if (transport === 0 && draft.selectedTransportId) {
             const t = draft.availableTransports.find(tr => tr.id === draft.selectedTransportId);
             if (t) transport = t.price;
        }
    }

    let activityTotal = 0;
    draft.selectedActivityIndices.forEach(idx => { if (draft.availableActivities[idx]) activityTotal += draft.availableActivities[idx].price * draft.travelers; });
    const subtotal = flight + hotel + transport + activityTotal;
    return { flight, hotel, transport, activityTotal, subtotal, taxes: Math.floor(subtotal * 0.12), total: Math.floor(subtotal * 1.12) };
  }, [draft]);

  const renderSelectionModal = () => {
      if (!activeModal || !draft) return null;
      return (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
              <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] animate-slide-up" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl z-10">
                      <h3 className="font-display font-bold text-xl text-gray-800">
                          {activeModal.type === 'flight' ? 'Select New Flight ✈️' : activeModal.type === 'hotel' ? 'Choose Accommodation 🏨' : activeModal.type === 'transport' ? `Add Transfer/Car (Day ${(activeModal.dayIndex || 0) + 1}) 🚖` : `Add Experiences (Day ${(activeModal.dayIndex || 0) + 1}) 🎟️`}
                      </h3>
                      <button onClick={() => setActiveModal(null)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100">✕</button>
                  </div>
                  <div className="p-6 overflow-y-auto space-y-4 bg-slate-50">
                      {activeModal.type === 'flight' && draft.availableFlights.map((opt, idx) => (
                          <div key={idx} onClick={() => handleSelectFlight(idx)} className={`p-5 bg-white rounded-2xl border-2 cursor-pointer hover:border-zippy-400 transition-all ${draft.selectedFlightIndex === idx ? 'border-zippy-500 ring-2 ring-zippy-100 shadow-md' : 'border-gray-100'}`}>
                              {/* Flight Card UI */}
                              <div className="flex justify-between items-center mb-4">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">✈️</div>
                                      <div>
                                          <span className="font-bold text-gray-800 block">{opt.outbound.airline}</span>
                                          <span className="text-xs text-gray-400 font-mono">{opt.outbound.flightNumber}</span>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <span className="text-xl font-display font-bold text-zippy-600">{draft.currency}{opt.outbound.price}</span>
                                      <span className="text-[10px] text-gray-400 block uppercase font-bold">per person</span>
                                  </div>
                              </div>
                              {/* ... (Flight details) ... */}
                          </div>
                      ))}
                      {activeModal.type === 'hotel' && draft.availableHotels.map((h) => (
                          <div key={h.id} onClick={() => handleSelectHotel(h.id)} className={`flex gap-4 p-3 bg-white rounded-2xl border-2 cursor-pointer hover:border-zippy-400 transition-all ${draft.selectedHotelId === h.id ? 'border-zippy-500 ring-2 ring-zippy-100' : 'border-gray-100'}`}>
                              <img src={h.image} className="w-20 h-20 rounded-xl object-cover" />
                              <div className="flex-1">
                                  <div className="flex justify-between items-start"><h4 className="font-bold text-gray-800">{h.name}</h4><span className="font-bold text-zippy-600">{draft.currency}{h.price}</span></div>
                                  <p className="text-xs text-gray-500 mt-1">{h.location}</p>
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">{h.roomType}</span>
                              </div>
                          </div>
                      ))}
                      {activeModal.type === 'transport' && draft.availableTransports.map((t) => {
                          // Check if selected for THIS day
                          const currentDay = activeModal?.dayIndex || 0;
                          const isSelectedForDay = draft.transportDayMap[currentDay] === t.id;
                          return (
                            <div key={t.id} onClick={() => handleSelectTransport(t.id)} className={`flex items-center gap-4 p-4 bg-white rounded-2xl border-2 cursor-pointer hover:border-zippy-400 transition-all ${isSelectedForDay ? 'border-zippy-500 ring-2 ring-zippy-100' : 'border-gray-100'}`}>
                                <div className="text-2xl">{t.icon}</div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800">{t.type}</h4>
                                    <p className="text-xs text-gray-500">{t.description}</p>
                                    {t.type.includes('Rental') && <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">Applies to All Days</span>}
                                </div>
                                <span className="font-bold text-zippy-600">{draft.currency}{t.price}</span>
                            </div>
                          );
                      })}
                      {activeModal.type === 'activity' && draft.availableActivities.map((act, idx) => {
                          const isSelected = draft.selectedActivityIndices.includes(idx);
                          return (
                              <div key={idx} onClick={() => handleToggleActivity(idx)} className={`flex items-center gap-4 p-4 bg-white rounded-2xl border-2 cursor-pointer hover:border-zippy-400 transition-all ${isSelected ? 'border-zippy-500 bg-zippy-50' : 'border-gray-100'}`}>
                                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-zippy-500 border-zippy-500 text-white' : 'border-gray-300'}`}>✓</div>
                                  <div className="flex-1"><h4 className="font-bold text-gray-800">{act.title}</h4><p className="text-xs text-gray-500">{act.description}</p></div>
                                  <span className="font-bold text-zippy-600">+{draft.currency}{act.price}</span>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      );
  }

  // ... (Refinement Wizard code omitted for brevity as it remains same) ...
  const renderRefinementWizard = () => {
      const isDateValid = (dateMode === 'precise' && !wizardData.isFlexibleDate && !!wizardData.startDate && !!wizardData.endDate) || (dateMode === 'precise' && wizardData.isFlexibleDate && !!wizardData.duration) || (dateMode === 'month' && (wizardData.flexibleMonths?.length || 0) > 0 && !!wizardData.duration);
      const TOTAL_STEPS = 4;
      return (
        <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
            <div className="px-6 py-6 bg-white border-b border-gray-100 flex justify-between items-center z-20">
                <div className="flex items-center gap-3"><button onClick={() => wizardStep > 0 ? setWizardStep(s => s - 1) : onClose()} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"><svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button><div><h2 className="text-xl font-display font-bold text-gray-800 leading-none">Let's Plan This! 🚀</h2><p className="text-xs text-gray-500 mt-1">Step {wizardStep + 1} of {TOTAL_STEPS}</p></div></div>
                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-zippy-500 transition-all duration-500 ease-out" style={{ width: `${((wizardStep + 1) / TOTAL_STEPS) * 100}%` }}></div></div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col relative">
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] pointer-events-none"></div>
                <div className="max-w-xl w-full mx-auto relative z-10 my-auto">
                    {wizardStep === 0 && (
                        <div className="animate-fade-in space-y-8">
                            <div className="text-center"><h3 className="text-2xl md:text-3xl font-display font-bold text-gray-800 mb-2">When are you going? 📅</h3><p className="text-gray-500">Pick a range or keep it flexible.</p></div>
                            <div className="bg-gray-100 p-1.5 rounded-2xl flex relative"><button onClick={() => setDateMode('precise')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all relative z-10 ${dateMode === 'precise' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Specific Dates</button><button onClick={() => setDateMode('month')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all relative z-10 ${dateMode === 'month' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Flexible / Month</button></div>
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                {dateMode === 'precise' ? (
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Start Date</label><input type="date" value={wizardData.startDate && !MONTHS.includes(wizardData.startDate) ? wizardData.startDate : ''} onChange={(e) => setWizardData(p => ({ ...p, startDate: e.target.value, isFlexibleDate: false }))} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 focus:ring-2 focus:ring-zippy-500 outline-none" /></div>
                                        <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">End Date</label><input type="date" value={wizardData.endDate || ''} onChange={(e) => setWizardData(p => ({ ...p, endDate: e.target.value, isFlexibleDate: false }))} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 focus:ring-2 focus:ring-zippy-500 outline-none" /></div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                                        {MONTHS.map(m => { const isSelected = wizardData.flexibleMonths?.includes(m); return (<button key={m} onClick={() => setWizardData(p => { const current = p.flexibleMonths || []; const newMonths = current.includes(m) ? current.filter(x => x !== m) : [...current, m]; return { ...p, flexibleMonths: newMonths, startDate: '', endDate: '' }; })} className={`py-3 rounded-xl border transition-all font-bold text-sm focus:ring-2 focus:ring-zippy-200 ${isSelected ? 'bg-zippy-500 text-white border-zippy-500 shadow-md transform scale-105' : 'border-gray-100 hover:border-zippy-300 hover:bg-zippy-50 text-gray-600'}`}>{m}</button>); })}
                                    </div>
                                )}
                                <div className="border-t border-gray-100 pt-4 mt-2">
                                    {dateMode === 'precise' && (
                                        <label className="flex items-center gap-3 p-4 border rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors bg-white"><input type="checkbox" checked={wizardData.isFlexibleDate} onChange={(e) => { const isChecked = e.target.checked; setWizardData(p => ({ ...p, isFlexibleDate: isChecked, startDate: isChecked ? '' : p.startDate, endDate: isChecked ? '' : p.endDate, duration: isChecked ? '1 Week' : '' })); }} className="w-5 h-5 text-zippy-600 rounded focus:ring-zippy-500 border-gray-300" /><div><span className="font-bold text-gray-800 block">I don't know my dates yet</span><span className="text-xs text-gray-500">Zippy will suggest the best time!</span></div></label>
                                    )}
                                    {((dateMode === 'precise' && wizardData.isFlexibleDate) || dateMode === 'month') && (
                                        <div className={`animate-fade-in ${dateMode === 'precise' ? 'mt-4 pl-8' : 'mt-2'}`}><label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">How long roughly? ⏳</label><div className="grid grid-cols-2 gap-2">{['Weekend (3 Days)', 'Short (4-5 Days)', '1 Week', 'Long (10+ Days)'].map((opt) => (<button key={opt} onClick={() => setWizardData(p => ({...p, duration: opt}))} className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${wizardData.duration === opt ? 'bg-zippy-100 text-zippy-700 border-zippy-300' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>{opt}</button>))}</div></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {wizardStep === 1 && (
                        <div className="animate-slide-in-right space-y-8">
                            <div className="text-center"><h3 className="text-2xl md:text-3xl font-display font-bold text-gray-800 mb-2">Who's coming with you? 🎒</h3><p className="text-gray-500">Solo adventure or group fun?</p></div>
                            <div className="grid grid-cols-2 gap-4">{TRAVELER_TYPES.map(type => (<button key={type.id} onClick={() => handleTravelerTypeChange(type.id as any)} className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center ${wizardData.travelerType === type.id ? 'border-zippy-500 bg-zippy-50/50 shadow-md ring-1 ring-zippy-500' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'}`}><span className="text-3xl mb-1">{type.icon}</span><span className="font-bold text-gray-800 text-sm">{type.label}</span><span className="text-[10px] text-gray-400 font-medium">{type.desc}</span></button>))}</div>
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6">
                                {wizardData.travelerType === 'Family' ? (
                                    <><div className="flex justify-between items-center pb-4 border-b border-gray-50"><span className="font-bold text-gray-700">Adults</span><div className="flex items-center gap-4"><button onClick={() => setWizardData(p => ({...p, adults: Math.max(1, p.adults - 1), travelers: Math.max(1, p.adults - 1) + p.children}))} className="w-10 h-10 rounded-full bg-gray-100">-</button><span className="text-2xl font-display font-bold w-8 text-center">{wizardData.adults}</span><button onClick={() => setWizardData(p => ({...p, adults: p.adults + 1, travelers: (p.adults + 1) + p.children}))} className="w-10 h-10 rounded-full bg-zippy-100 text-zippy-700">+</button></div></div><div className="flex justify-between items-center"><span className="font-bold text-gray-700">Children (0-18)</span><div className="flex items-center gap-4"><button onClick={() => setWizardData(p => { const newChildren = Math.max(0, p.children - 1); return {...p, children: newChildren, travelers: p.adults + newChildren, childAges: p.childAges.slice(0, newChildren)}; })} className="w-10 h-10 rounded-full bg-gray-100">-</button><span className="text-2xl font-display font-bold w-8 text-center">{wizardData.children}</span><button onClick={() => setWizardData(p => ({...p, children: p.children + 1, travelers: p.adults + (p.children + 1), childAges: [...p.childAges, 5]}))} className="w-10 h-10 rounded-full bg-zippy-100 text-zippy-700">+</button></div></div>{wizardData.children > 0 && (<div className="pt-4 animate-fade-in"><p className="text-xs font-bold text-gray-400 uppercase mb-2">Child Ages</p><div className="flex flex-wrap gap-2">{wizardData.childAges.map((age, idx) => (<select key={idx} value={age} onChange={(e) => updateChildAge(idx, parseInt(e.target.value))} className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm font-bold">{[...Array(19)].map((_, i) => <option key={i} value={i}>{i} y/o</option>)}</select>))}</div></div>)}</>
                                ) : (
                                    <div className="flex justify-between items-center"><span className="font-bold text-gray-700">Total Travelers</span><div className="flex items-center gap-4">{wizardData.travelerType === 'Friends' ? (<><button onClick={() => setWizardData(p => ({...p, travelers: Math.max(1, p.travelers - 1), adults: Math.max(1, p.adults - 1)}))} className="w-10 h-10 rounded-full bg-gray-100">-</button><span className="text-2xl font-display font-bold w-8 text-center">{wizardData.travelers}</span><button onClick={() => setWizardData(p => ({...p, travelers: p.travelers + 1, adults: p.adults + 1}))} className="w-10 h-10 rounded-full bg-zippy-100 text-zippy-700">+</button></>) : (<span className="text-xl font-bold text-gray-500 px-4 py-2 bg-gray-50 rounded-xl">{wizardData.travelers} Traveler{wizardData.travelers > 1 ? 's' : ''}</span>)}</div></div>
                                )}
                                <div className="pt-4 border-t border-gray-100"><label className="flex items-center gap-3 cursor-pointer group"><div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${wizardData.hasPet ? 'bg-zippy-500 border-zippy-500 text-white' : 'border-gray-300 bg-white'}`}>{wizardData.hasPet && '✓'}<input type="checkbox" className="hidden" checked={wizardData.hasPet} onChange={(e) => setWizardData(p => ({...p, hasPet: e.target.checked}))} /></div><div><span className="font-bold text-gray-800 text-sm">Bringing a Pet? 🐾</span><p className="text-xs text-gray-400">We'll find pet-friendly spots.</p></div></label></div>
                            </div>
                        </div>
                    )}
                    {wizardStep === 2 && (
                        <div className="animate-slide-in-right space-y-8">
                            <div className="text-center"><h3 className="text-2xl md:text-3xl font-display font-bold text-gray-800 mb-2">Customize your Budget 💰</h3><p className="text-gray-500">Pick a style for each category.</p></div>
                            <div className="space-y-4">{['Flights', 'Accommodation', 'Transport', 'Experiences'].map((cat, i) => { const key = i === 0 ? 'flightBudget' : i === 1 ? 'hotelBudget' : i === 2 ? 'transportBudget' : 'activityBudget'; const emoji = i === 0 ? '✈️' : i === 1 ? '🏨' : i === 2 ? '🚖' : '🎟️'; return (<div key={cat} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"><h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><span className="text-xl">{emoji}</span> {cat}</h4><div className="flex bg-gray-50 p-1 rounded-xl">{['Economy', 'Comfort', 'Luxury'].map((level) => (<button key={level} onClick={() => setWizardData(p => ({ ...p, [key]: level as any }))} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${wizardData[key as keyof RefinedTripRequest] === level ? 'bg-white shadow text-gray-900' : 'text-gray-400'}`}>{level}</button>))}</div></div>); })}</div>
                        </div>
                    )}
                    {wizardStep === 3 && (
                         <div className="animate-slide-in-right space-y-8">
                            <div className="text-center"><h3 className="text-2xl md:text-3xl font-display font-bold text-gray-800 mb-2">What's the vibe? ✨</h3><p className="text-gray-500">Customize your experience in {baseTrip.destination}.</p></div>
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"><h4 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">Must Haves</h4><div className="flex flex-wrap gap-2 mb-4">{destinationTags.map(tag => { const isSelected = wizardData.selectedInterests.includes(tag); return (<button key={tag} onClick={() => setWizardData(p => ({...p, selectedInterests: isSelected ? p.selectedInterests.filter(i => i !== tag) : [...p.selectedInterests, tag]}))} className={`px-4 py-2 rounded-full text-sm font-bold border ${isSelected ? 'bg-zippy-500 border-zippy-500 text-white shadow-md' : 'bg-white text-gray-600'}`}>{tag}</button>); })}</div><div className="flex gap-2 mt-4 pt-4 border-t border-gray-100"><input type="text" value={customInterestInput} onChange={(e) => setCustomInterestInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCustomInterest()} placeholder="Add other interest..." className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-zippy-200 outline-none" /><button onClick={addCustomInterest} disabled={!customInterestInput.trim()} className="bg-gray-900 text-white px-4 py-2 rounded-xl font-bold text-sm">Add +</button></div></div>
                         </div>
                    )}
                </div>
            </div>
            <div className="p-4 md:p-6 bg-white border-t border-gray-100 z-20 flex justify-end"><button onClick={() => wizardStep < 3 ? setWizardStep(s => s + 1) : handleFinishWizard()} disabled={wizardStep === 0 && !isDateValid} className="bg-zippy-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-zippy-200 hover:bg-zippy-700 w-full md:w-auto flex items-center justify-center gap-2 disabled:opacity-50">{wizardStep === 3 ? 'Build My Trip ✨' : 'Next Step →'}</button></div>
        </div>
      );
  };

  const renderBuildingScreen = () => (
      <div className="flex flex-col items-center justify-center h-full bg-white relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-zippy-50 to-white"></div><div className="relative z-10 text-center p-8"><div className="w-24 h-24 bg-gradient-to-br from-zippy-500 to-blue-600 rounded-2xl mx-auto mb-8 shadow-2xl flex items-center justify-center transform -rotate-3 animate-bounce-soft"><span className="text-6xl font-display font-black italic text-white">Z</span></div><h2 className="text-3xl font-display font-bold text-gray-800 mb-2">Building your trip...</h2><p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">Zippy is matching flights, finding the perfect hotel, and curating activities.</p><div className="flex gap-2 justify-center"><div className="w-3 h-3 bg-zippy-400 rounded-full typing-dot"></div><div className="w-3 h-3 bg-zippy-500 rounded-full typing-dot"></div><div className="w-3 h-3 bg-zippy-600 rounded-full typing-dot"></div></div></div></div>
  );

  const renderBuilderPhase = () => {
    if (!draft) return null;
    const selectedFlight = draft.availableFlights[draft.selectedFlightIndex];
    const selectedHotel = draft.availableHotels.find(h => h.id === draft.selectedHotelId);
    
    return (
        <div className="flex flex-col md:flex-row h-full bg-slate-100 relative overflow-hidden">
             
             {/* CHAT (SINISTRA su Desktop) */}
             <div className={`fixed inset-0 z-50 lg:static lg:z-auto lg:w-96 lg:border-r lg:border-gray-200 lg:flex lg:flex-col transition-transform duration-300 bg-white shadow-2xl lg:shadow-none ${showChat ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:hidden'}`}>
                <div className="px-5 py-4 bg-white border-b border-gray-100 flex justify-between items-center"><h3 className="font-bold text-gray-800">Zippy AI</h3><button onClick={() => setShowChat(false)} className="p-2 text-gray-400 hover:text-gray-600">✕</button></div>
                <div className="flex-1 overflow-hidden bg-slate-50 relative h-full"><ChatInterface messages={messages} input={chatInput} setInput={setChatInput} onSend={handleChatSend} isLoading={isChatLoading} /></div>
             </div>

             {/* TIMELINE (CENTRO su Desktop) */}
             <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 scrollbar-hide">
                  <div className="max-w-4xl mx-auto space-y-8 pb-24">
                      <div className="relative border-l-2 border-dashed border-gray-300 ml-4 md:ml-6 space-y-12">
                            {draft.baseTrip.day_by_day.map((day, idx) => {
                                const isFirstDay = idx === 0;
                                const isLastDay = idx === draft.baseTrip.day_by_day.length - 1;
                                const isOvernight = draft.baseTrip.day_by_day.length > 1;

                                // Resolve Transport for this day
                                const dayTransportId = draft.transportDayMap[idx] || (isFirstDay ? draft.selectedTransportId : null);
                                const selectedTransport = dayTransportId ? draft.availableTransports.find(t => t.id === dayTransportId) : null;

                                return (
                                <div key={idx} className="relative pl-8 md:pl-10">
                                    <div className={`absolute -left-[9px] top-0 w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${isFirstDay || isLastDay ? 'bg-zippy-600' : 'bg-gray-300'}`}><div className="w-2 h-2 bg-white rounded-full"></div></div>
                                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-4"><h4 className="font-bold text-gray-800 text-xl font-display">{day.date || `Day ${day.day}`}</h4><span className="text-gray-500 text-sm font-medium uppercase tracking-wide">{day.title}</span></div>
                                    <div className="space-y-4">
                                        
                                        {/* REALISTIC ARRIVAL FLIGHT BLOCK */}
                                        {isFirstDay && (
                                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 relative overflow-hidden group hover:border-zippy-300 transition-all">
                                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl shadow-inner">🛫</div>
                                                        <div>
                                                            <h5 className="font-bold text-gray-800 text-base leading-tight">Arrival Flight • {selectedFlight.outbound.airline}</h5>
                                                            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">{selectedFlight.outbound.flightNumber} • {selectedFlight.outbound.class}</span>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => setActiveModal({ type: 'flight' })} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Change</button>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 items-center text-center py-4 bg-slate-50 rounded-xl mb-4 border border-gray-100">
                                                    <div>
                                                        <span className="text-xl font-display font-bold text-gray-900 block">{selectedFlight.outbound.departureTime}</span>
                                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{selectedFlight.outbound.from}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-tighter">Durata: {selectedFlight.outbound.duration}</span>
                                                        <div className="w-full h-px bg-gray-300 relative flex justify-center items-center">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                        </div>
                                                        <span className="text-[10px] text-blue-600 font-black mt-1 uppercase tracking-tighter">{selectedFlight.outbound.stops}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-xl font-display font-bold text-gray-900 block">{selectedFlight.outbound.arrivalTime}</span>
                                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{selectedFlight.outbound.to}</span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div className="flex gap-4 items-center">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                                            <span className="text-base opacity-70">💼</span>
                                                            {selectedFlight.outbound.baggage}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xl font-display font-bold text-zippy-600">{draft.currency}{selectedFlight.outbound.price}</span>
                                                        <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-tight">Per Persona</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* DAILY TRANSPORT SLOT */}
                                        {selectedTransport ? (
                                            <div className="bg-white rounded-xl border border-green-100 shadow-sm p-4 flex justify-between items-center relative overflow-hidden group hover:border-green-300 transition-all">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-xl">{selectedTransport.icon}</div>
                                                    <div>
                                                        <h5 className="font-bold text-gray-800 text-sm">{selectedTransport.type}</h5>
                                                        <p className="text-xs text-gray-500">{selectedTransport.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-green-600 text-sm">{draft.currency}{selectedTransport.price}</span>
                                                    <button onClick={() => setActiveModal({ type: 'transport', dayIndex: idx })} className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">Change</button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* PLACEHOLDER FOR NO TRANSPORT */
                                            !isLastDay && (
                                                <button onClick={() => setActiveModal({ type: 'transport', dayIndex: idx })} className="w-full py-2 bg-white border border-dashed border-gray-200 rounded-lg text-xs font-bold text-gray-400 hover:text-green-600 hover:border-green-300 transition-all flex items-center justify-center gap-1">
                                                    <span>🚖</span> Add Transport for Day {idx + 1}
                                                </button>
                                            )
                                        )}

                                        {isFirstDay && selectedHotel && isOvernight && (
                                            <div className="bg-white rounded-xl border border-purple-100 shadow-sm overflow-hidden flex flex-col md:flex-row relative group hover:border-purple-300 transition-all">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 z-10"></div>
                                                <div className="w-full md:w-32 h-32 md:h-auto overflow-hidden">
                                                    <img src={selectedHotel.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                </div>
                                                <div className="p-4 flex-1 flex flex-col justify-center">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h5 className="font-bold text-gray-800">🏨 Check-in: {selectedHotel.name}</h5>
                                                            <p className="text-xs text-gray-500">{selectedHotel.location} • {"★".repeat(selectedHotel.stars)}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="font-bold text-purple-600 block">{draft.currency}{selectedHotel.price}</span>
                                                            <button onClick={() => setActiveModal({ type: 'hotel' })} className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg mt-1">Change</button>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded font-medium text-gray-600">{selectedHotel.roomType}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* ACTIVITIES CORRECTLY MAPPED TO THIS DAY */}
                                        {(() => {
                                            const activitiesForDay = draft.selectedActivityIndices.filter(actIdx => { 
                                                // Default logic: map by activityDayMap or fallback
                                                if (draft.activityDayMap && draft.activityDayMap[actIdx] !== undefined) {
                                                    return draft.activityDayMap[actIdx] === idx;
                                                }
                                                if (!isOvernight) return true;
                                                const totalDays = draft.baseTrip.day_by_day.length;
                                                return (actIdx % totalDays) === idx;
                                            });
                                            return activitiesForDay.map(actIdx => {
                                                const act = draft.availableActivities[actIdx];
                                                if (!act) return null;
                                                return (<div key={actIdx} className="bg-white rounded-xl border border-orange-100 shadow-sm p-4 flex justify-between items-center relative overflow-hidden group hover:border-orange-300 transition-all"><div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-xl">🎟️</div><div><h5 className="font-bold text-gray-800 text-sm">{act.title}</h5><p className="text-xs text-gray-500">{act.duration}</p></div></div><div className="flex items-center gap-3"><span className="font-bold text-orange-600 text-sm">{draft.currency}{act.price}</span><button onClick={() => handleToggleActivity(actIdx)} className="text-xs font-bold text-red-500">Remove</button></div></div>);
                                            });
                                        })()}

                                        {/* DAY DESCRIPTION */}
                                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-inner italic text-gray-600 text-sm leading-relaxed">
                                            "{day.description}"
                                        </div>
                                        
                                        {!isLastDay && (
                                            <div className="flex gap-2">
                                                <button onClick={() => setActiveModal({ type: 'activity', dayIndex: idx })} className="flex-1 py-2 bg-white border border-dashed border-gray-300 rounded-lg text-xs font-bold text-gray-400 hover:text-zippy-600 hover:border-zippy-300 transition-all">Add Experience +</button>
                                            </div>
                                        )}

                                        {/* REALISTIC RETURN FLIGHT BLOCK */}
                                        {isLastDay && (
                                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 relative overflow-hidden group mt-6 hover:border-zippy-300 transition-all">
                                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500"></div>
                                                
                                                {isOvernight && selectedHotel && (
                                                    <div className="mb-4 pb-4 border-b border-gray-50">
                                                         <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Accommodation</span>
                                                         <h5 className="font-bold text-gray-800 text-xs">🏨 Check-out: {selectedHotel.name}</h5>
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl shadow-inner">🛬</div>
                                                        <div>
                                                            <h5 className="font-bold text-gray-800 text-base leading-tight">Return Flight • {selectedFlight.return.airline}</h5>
                                                            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">{selectedFlight.return.flightNumber} • {selectedFlight.return.class}</span>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => setActiveModal({ type: 'flight' })} className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors">Change</button>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 items-center text-center py-4 bg-slate-50 rounded-xl mb-4 border border-gray-100">
                                                    <div>
                                                        <span className="text-xl font-display font-bold text-gray-900 block">{selectedFlight.return.departureTime}</span>
                                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{selectedFlight.return.from}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-tighter">Durata: {selectedFlight.return.duration}</span>
                                                        <div className="w-full h-px bg-gray-300 relative flex justify-center items-center">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                                        </div>
                                                        <span className="text-[10px] text-purple-600 font-black mt-1 uppercase tracking-tighter">{selectedFlight.return.stops}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-xl font-display font-bold text-gray-900 block">{selectedFlight.return.arrivalTime}</span>
                                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{selectedFlight.return.to}</span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center text-xs text-gray-500">
                                                    <div className="flex items-center gap-1.5 font-medium">
                                                        <span className="text-base opacity-70">💼</span>
                                                        {selectedFlight.return.baggage}
                                                    </div>
                                                    <span className="font-bold text-purple-600">Incl. in package</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                );
                            })}
                      </div>
                  </div>
             </div>

             {/* SIDEBAR RIEPILOGO (DESTRA su Desktop) */}
             <div className="w-full md:w-80 bg-white border-l border-gray-200 shadow-xl z-20 flex flex-col h-full sticky top-0">
                  <div className="p-6 border-b border-gray-100">
                      <div className="relative rounded-2xl overflow-hidden mb-6 aspect-video"><img src={draft.baseTrip.image} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4"><h2 className="text-white font-display font-bold text-2xl">{draft.baseTrip.destination}</h2></div></div>
                      <div className="text-center mb-6"><div className="text-4xl font-bold text-zippy-600">{draft.currency}{Math.round(currentTotals.total / draft.travelers)}</div><div className="text-xs text-gray-400 font-medium uppercase">Price per person</div><div className="text-sm text-gray-500 mt-1">(Total: {draft.currency}{currentTotals.total})</div></div>
                      <button onClick={() => setPhase('checkout')} className="w-full py-4 bg-zippy-600 text-white font-bold rounded-xl shadow-lg hover:bg-zippy-700 transition-all active:scale-95">Confirm & Book</button>
                  </div>
                  <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                      <div className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-gray-600 text-sm">👥 Travelers</span><span className="font-bold text-gray-800">{draft.travelers}</span></div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-gray-600 text-sm">🌙 Nights</span><span className="font-bold text-gray-800">{Math.max(0, draft.baseTrip.day_by_day.length - 1)}</span></div>
                      <div className="flex justify-between items-center py-2"><span className="text-gray-600 text-sm">🎟️ Activities</span><span className="font-bold text-gray-800">{draft.selectedActivityIndices.length}</span></div>
                  </div>
             </div>

             {renderSelectionModal()}

             {/* CHAT CHIAMATA RAPIDA (MOBILE) */}
             {!showChat && <button onClick={() => setShowChat(true)} className="absolute bottom-6 left-6 z-30 w-14 h-14 bg-gray-900 text-white rounded-full shadow-2xl flex items-center justify-center animate-bounce-soft"><span className="font-display font-black italic text-lg">Z</span></button>}
        </div>
    );
  };

  return (
    <div className="w-full h-full bg-white flex flex-col absolute inset-0 z-30">
       {phase === 'refinement' && renderRefinementWizard()}
       {phase === 'building' && renderBuildingScreen()}
       {phase === 'builder' && renderBuilderPhase()}
       {phase === 'checkout' && draft && <BookingModal details={convertDraftToBooking(draft)} onClose={() => setPhase('builder')} onPaymentComplete={() => onConfirm(convertDraftToBooking(draft))} />}
    </div>
  );
};

export default TripConfigurator;
