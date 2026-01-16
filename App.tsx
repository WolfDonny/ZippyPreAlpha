import React, { useState, useEffect } from 'react';
import { sendMessageToGemini, startChatSession } from './services/geminiService';
import { Message, TripResponse, TripOption, BookingDetails, ActivityProposal, Activity, TravelProfile, AppSettings, PaymentMethod, TravelDocument, DraftTrip } from './types';
import { INITIAL_GREETINGS } from './constants';
import ChatInterface from './components/ChatInterface';
import TripCard from './components/TripCard';
import TripConfigurator from './components/TripConfigurator';
import BookingDetailView from './components/BookingDetailView';
import OnboardingFlow from './components/OnboardingFlow';
import Homepage from './components/Homepage'; // NEW IMPORT
import { getDestinationImage, CURRENCY_RATES, convertPrice, formatPrice } from './services/mockDataService'; 

// Icons
const IconHome = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const IconChat = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
const IconHeart = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
const IconSuitcase = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const IconSettings = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconClock = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const IconChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const IconProgress = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;


type View = 'home' | 'chat' | 'favorites' | 'bookings' | 'account' | 'settings' | 'history' | 'inprogress';

// MOCK DATA FOR SETTINGS
const MOCK_CARDS: PaymentMethod[] = [
    { id: '1', type: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
    { id: '2', type: 'Mastercard', last4: '8899', expiry: '09/24', isDefault: false },
];
const MOCK_DOCS: TravelDocument[] = [
    { id: 'd1', name: 'Paris Hotel Voucher', date: '2023-10-12', type: 'Voucher' },
    { id: 'd2', name: 'Flight Receipt ZP101', date: '2023-10-10', type: 'Receipt' },
];

const App: React.FC = () => {
  // SET INITIAL VIEW TO HOME
  const [activeView, setActiveView] = useState<View>('home');
  // SIDEBAR CLOSED BY DEFAULT AS REQUESTED
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // App-Wide Settings State
  const [appSettings, setAppSettings] = useState<AppSettings>({
      language: 'English',
      currency: 'EUR',
      theme: 'light',
      aiTone: 'Fun & Energetic',
      notifications: { push: true, email: true, reminders: true }
  });

  // User Profile
  const [userProfile, setUserProfile] = useState<TravelProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(MOCK_CARDS);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tripData, setTripData] = useState<TripResponse | null>(null);
  
  // Data State
  const [savedTrips, setSavedTrips] = useState<TripOption[]>([]);
  const [bookedTrips, setBookedTrips] = useState<BookingDetails[]>([]);
  const [tripHistory, setTripHistory] = useState<TripOption[]>([]);
  
  // NEW: Trips in Progress (Drafts)
  const [draftTrips, setDraftTrips] = useState<DraftTrip[]>([]);

  // Modal / Detailed View State
  const [selectedTripForConfig, setSelectedTripForConfig] = useState<TripOption | null>(null);
  const [activeDraft, setActiveDraft] = useState<DraftTrip | null>(null); // For resuming drafts
  
  const [viewingBookingDetails, setViewingBookingDetails] = useState<BookingDetails | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Booking Confirmed!");

  // Theme Effect (Instant)
  useEffect(() => {
    if (appSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [appSettings.theme]);

  // Initial Boot
  useEffect(() => {
    startNewChat();
  }, []);

  const startNewChat = () => {
    startChatSession(userProfile, appSettings);
    setMessages([]);
    setTripData(null);
    setIsLoading(true);
    setTimeout(() => {
        const greeting = INITIAL_GREETINGS[appSettings.language] || INITIAL_GREETINGS['English'];
        setMessages([{ role: 'model', text: greeting }]);
        setIsLoading(false);
    }, 600);
  };

  const handleSaveSettings = () => {
    // This physically re-initializes the AI with the new tone/language/currency
    startChatSession(userProfile, appSettings);
    setSuccessMessage("Settings Applied! AI Updated.");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const parseResponse = (text: string): { cleanText: string, jsonData: TripResponse | null } => {
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonRegex);

    if (match && match[1]) {
      try {
        const jsonData = JSON.parse(match[1]);
        if (!jsonData.trip_options) jsonData.trip_options = [];
        jsonData.trip_options = jsonData.trip_options.map((t: TripOption) => ({
             ...t, 
             id: t.id || Math.random().toString(36).substring(2, 9),
             day_by_day: t.day_by_day || [],
             image: getDestinationImage(t.destination)
        }));
        const cleanText = text.replace(jsonRegex, '').trim();
        return { cleanText, jsonData };
      } catch (e) {
        console.error("Failed to parse JSON from response", e);
      }
    }
    return { cleanText: text, jsonData: null };
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(userMessage, 'main');
      const { cleanText, jsonData } = parseResponse(responseText);

      setMessages(prev => [...prev, { role: 'model', text: cleanText || "Here are your options! 👇" }]);

      if (jsonData) {
        setTripData(jsonData);
        setTripHistory(prev => [...jsonData.trip_options, ...prev]);
      }
    } catch (error) {
      console.error("Error in chat flow:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Oops, brain freeze! 🥶 Can you try saying that again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = (trip: TripOption) => {
    setSavedTrips(prev => {
      const exists = prev.find(t => t.id === trip.id);
      if (exists) {
        return prev.filter(t => t.id !== trip.id);
      } else {
        return [...prev, trip];
      }
    });
  };

  const handleBookingConfirmed = (finalBooking: BookingDetails) => {
    setBookedTrips(prev => [finalBooking, ...prev]);
    // REMOVE FROM DRAFTS IF IT WAS THERE
    setDraftTrips(prev => prev.filter(d => d.baseTrip.id !== finalBooking.trip.id));
    
    setSelectedTripForConfig(null);
    setActiveDraft(null);
    setSuccessMessage("Booking Confirmed!");
    setShowSuccess(true);
    setActiveView('bookings');
    setViewingBookingDetails(null);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  // --- NEW: HANDLE DRAFT UPDATE (AUTO-SAVE) ---
  const handleDraftUpdate = (updatedDraft: DraftTrip) => {
      setDraftTrips(prev => {
          const index = prev.findIndex(d => d.id === updatedDraft.id);
          if (index >= 0) {
              const newDrafts = [...prev];
              newDrafts[index] = { ...updatedDraft, updatedAt: new Date().toISOString() };
              return newDrafts;
          } else {
              return [{ ...updatedDraft, updatedAt: new Date().toISOString() }, ...prev];
          }
      });
  };

  // --- NEW: RESUME DRAFT ---
  const handleResumeDraft = (draft: DraftTrip) => {
      setActiveDraft(draft);
      setSelectedTripForConfig(draft.baseTrip);
      // We don't set activeView here because Configurator renders conditionally on top
      // But we need to make sure we aren't "in a view" that conflicts
      // Actually, standard behavior: Configurator overlays everything
  };

  const handleAddActivity = (bookingId: string, proposal: ActivityProposal) => {
    setBookedTrips(prev => prev.map(booking => {
        if (booking.id === bookingId) {
            const newActivity: Activity = {
                id: Math.random().toString(36).substring(2, 9),
                title: proposal.title,
                description: proposal.description,
                price: proposal.price,
                currency: proposal.currency,
                duration: proposal.duration,
                bookedAt: new Date().toISOString()
            };
            
            const newTotal = booking.pricing.total + proposal.price;
            const updatedBooking = {
                ...booking,
                bookedActivities: [...(booking.bookedActivities || []), newActivity],
                pricing: { ...booking.pricing, total: newTotal }
            };
            
            if (viewingBookingDetails && viewingBookingDetails.id === bookingId) {
                setViewingBookingDetails(updatedBooking);
            }

            return updatedBooking;
        }
        return booking;
    }));
  };

  const isFavorite = (tripId: string) => savedTrips.some(t => t.id === tripId);
  
  // --- NAVIGATE SIDEBAR SAFELY ---
  const handleSidebarClick = (view: View) => {
      setActiveView(view);
      setViewingBookingDetails(null);
      // If we are configuring, we want to hide the configurator but keep the state in draftTrips (handled by auto-save)
      // So we just clear the active selection
      if (selectedTripForConfig) {
          setSelectedTripForConfig(null);
          setActiveDraft(null);
      }
  };

  // --- Render Views ---

  const renderSidebar = () => (
    <div className={`fixed bottom-0 left-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 z-40 md:static md:h-screen md:flex-col md:border-r md:border-t-0 flex flex-row items-center shadow-lg md:shadow-none shrink-0 transition-all duration-300 ${isSidebarOpen ? 'md:w-64' : 'md:w-20'} w-full justify-around md:justify-start md:py-6`}>
       
       <div className={`hidden md:flex mb-8 items-center gap-3 px-4 ${!isSidebarOpen && 'justify-center'}`}>
         {/* NEW COOL LOGO */}
         <div className="w-10 h-10 bg-gradient-to-br from-zippy-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-zippy-500/30 transform -rotate-6 hover:rotate-0 transition-all duration-300 group cursor-pointer">
           <span className="font-display font-black italic text-2xl text-white tracking-tight">Z</span>
         </div>
         {isSidebarOpen && (
             <h1 className="font-display font-bold text-2xl text-gray-800 dark:text-white tracking-tight">Zippy</h1>
         )}
       </div>

       <div className="flex md:flex-col w-full px-2 md:px-4 gap-1 md:gap-2">
           {[
               { id: 'home', label: 'Home', icon: <IconHome /> },
               { id: 'chat', label: 'Chat Planner', icon: <IconChat /> },
               { id: 'favorites', label: 'Dream List', icon: <IconHeart /> },
               { id: 'history', label: 'History', icon: <IconClock /> },
               // NEW SECTION
               { id: 'inprogress', label: 'Trips in Progress', icon: <IconProgress /> },
               
               { id: 'bookings', label: 'My Trips', icon: <IconSuitcase /> },
               { type: 'divider' }, 
               { id: 'account', label: 'Account', icon: <IconUser /> },
               { id: 'settings', label: 'Settings', icon: <IconSettings /> },
           ].map((item, idx) => {
             if (item.type === 'divider') return <div key={idx} className="hidden md:block h-px bg-gray-100 dark:bg-slate-800 my-2 mx-4" />;
             
             return (
                <button 
                    key={item.id}
                    onClick={() => handleSidebarClick(item.id as View)} 
                    className={`p-3 rounded-xl transition-all flex items-center gap-3 w-full ${!isSidebarOpen ? 'justify-center' : ''} ${activeView === item.id && !viewingBookingDetails && !selectedTripForConfig ? 'bg-zippy-50 text-zippy-600 dark:bg-slate-800 dark:text-zippy-400' : 'text-gray-400 hover:bg-zippy-50 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-gray-300'}`}
                    title={item.label}
                >
                    <div className="shrink-0">{item.icon}</div>
                    {isSidebarOpen && <span className="font-bold text-sm hidden md:block">{item.label}</span>}
                    {/* Badge for In Progress */}
                    {isSidebarOpen && item.id === 'inprogress' && draftTrips.length > 0 && (
                        <span className="ml-auto bg-zippy-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{draftTrips.length}</span>
                    )}
                </button>
             );
           })}
       </div>

       <button 
         onClick={() => setIsSidebarOpen(!isSidebarOpen)}
         className="hidden md:flex mt-auto mb-4 mx-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 justify-center transition-colors"
       >
          {isSidebarOpen ? <IconChevronLeft /> : <IconChevronRight />}
       </button>
    </div>
  );

  // --- ACCOUNT VIEW ---
  const renderAccountView = () => (
    <div className="p-8 w-full max-w-2xl mx-auto h-screen overflow-y-auto pb-24 dark:text-gray-200">
        <h2 className="text-3xl font-display font-bold text-gray-800 dark:text-white mb-8">My Account 👤</h2>
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden mb-6 relative">
             {/* 10X FASTER BANNER */}
             <div className="bg-gradient-to-r from-zippy-500 to-purple-600 p-4 flex justify-between items-center text-white">
                 <div className="flex items-center gap-3">
                     <span className="text-2xl">🚀</span>
                     <div>
                         <p className="font-bold text-sm uppercase opacity-90">Pro Tip</p>
                         <p className="font-bold">Complete your Travel DNA for 10x faster results!</p>
                     </div>
                 </div>
                 <div className="hidden md:block text-2xl font-display font-bold opacity-50">10X</div>
             </div>

            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-2xl text-gray-600 dark:text-white font-bold">
                    {userProfile ? '🧬' : '?'}
                </div>
                <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">{userProfile ? 'Your Travel Profile' : 'Guest Traveler'}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{userProfile ? 'DNA Configured ✅' : 'Profile incomplete'}</p>
                </div>
            </div>

            {userProfile ? (
                <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-xl">
                            <span className="text-xs text-gray-400 block">Budget</span>
                            <span className="font-bold text-gray-800 dark:text-gray-200">{userProfile.budget}</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-xl">
                            <span className="text-xs text-gray-400 block">Pace</span>
                            <span className="font-bold text-gray-800 dark:text-gray-200">{userProfile.pace}</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-xl col-span-2">
                            <span className="text-xs text-gray-400 block">Interests</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {userProfile.interests.map(i => (
                                    <span key={i} className="bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 px-2 py-1 rounded-md text-xs font-medium text-gray-600 dark:text-gray-300">{i}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowOnboarding(true)}
                        className="w-full py-3 border border-zippy-200 text-zippy-600 dark:text-zippy-400 font-bold rounded-xl hover:bg-zippy-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Edit Profile ✏️
                    </button>
                </div>
            ) : (
                <div className="p-8 text-center">
                    <p className="text-gray-500 text-sm mb-6">Create your Travel DNA profile for better recommendations.</p>
                    <button 
                        onClick={() => setShowOnboarding(true)}
                        className="bg-zippy-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
                    >
                        Create Profile
                    </button>
                </div>
            )}
        </div>

        {/* Account Management */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
             <div className="p-6">
                 <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Security</h4>
                 <div className="space-y-4">
                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                         <input type="email" placeholder="you@example.com" className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm" />
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                         <input type="password" placeholder="••••••••" className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm" />
                     </div>
                     <div className="pt-4 flex justify-between items-center">
                         <button className="text-red-500 font-bold text-sm hover:underline">Delete Account</button>
                         <button className="bg-black dark:bg-white dark:text-black text-white px-4 py-2 rounded-lg font-bold text-sm">Save Changes</button>
                     </div>
                 </div>
             </div>
        </div>
    </div>
  );

  // --- SETTINGS VIEW ---
  const renderSettingsView = () => (
      <div className="p-8 w-full max-w-4xl mx-auto h-screen overflow-y-auto pb-48 dark:text-gray-200">
          <h2 className="text-3xl font-display font-bold text-gray-800 dark:text-white mb-8">App Settings ⚙️</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
              
              {/* General Settings */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2"><span className="text-xl">🌍</span> General</h3>
                  <div className="space-y-6">
                      <div>
                          <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">App Language</label>
                          <select 
                            value={appSettings.language}
                            onChange={(e) => setAppSettings(p => ({...p, language: e.target.value as any}))}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-zippy-400"
                          >
                              {['English', 'Italiano', 'Español', 'Français', 'Deutsch'].map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Currency (Updates Prices)</label>
                          <select 
                            value={appSettings.currency}
                            onChange={(e) => setAppSettings(p => ({...p, currency: e.target.value as any}))}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-zippy-400"
                          >
                              {['EUR', 'USD', 'GBP', 'JPY'].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Appearance</label>
                          <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-xl">
                              {['light', 'dark', 'system'].map(theme => (
                                  <button
                                    key={theme}
                                    onClick={() => setAppSettings(p => ({...p, theme: theme as any}))}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${appSettings.theme === theme ? 'bg-white dark:bg-slate-700 shadow-sm text-black dark:text-white' : 'text-gray-500'}`}
                                  >
                                      {theme}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>

              {/* Zippy AI Settings */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2"><span className="text-xl">🤖</span> Zippy Intelligence</h3>
                  <div className="space-y-6">
                      <div>
                          <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Assistant Tone</label>
                          <div className="space-y-3">
                              {['Fun & Energetic', 'Professional & Formal', 'Concise & Direct'].map(tone => (
                                  <label key={tone} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${appSettings.aiTone === tone ? 'border-zippy-500 bg-zippy-50 dark:bg-slate-700' : 'border-gray-100 dark:border-slate-600'}`}>
                                      <input 
                                        type="radio" 
                                        name="tone" 
                                        checked={appSettings.aiTone === tone}
                                        onChange={() => setAppSettings(p => ({...p, aiTone: tone as any}))}
                                        className="w-5 h-5 text-zippy-600"
                                      />
                                      <span className="font-medium text-gray-700 dark:text-gray-200">{tone}</span>
                                  </label>
                              ))}
                          </div>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-slate-900 rounded-xl text-xs text-blue-700 dark:text-blue-300">
                          Select a tone and click "Apply Changes" below to update Zippy's personality.
                      </div>
                  </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2"><span className="text-xl">💳</span> Wallet</h3>
                  <div className="space-y-3 mb-4">
                      {paymentMethods.map(card => (
                          <div key={card.id} className="flex justify-between items-center p-3 border border-gray-100 dark:border-slate-600 rounded-xl">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-500">{card.type}</div>
                                  <div className="text-sm">
                                      <p className="font-bold dark:text-gray-200">•••• {card.last4}</p>
                                      <p className="text-xs text-gray-400">Expires {card.expiry}</p>
                                  </div>
                              </div>
                              <button onClick={() => setPaymentMethods(p => p.filter(c => c.id !== card.id))} className="text-red-400 hover:text-red-600 text-sm">Remove</button>
                          </div>
                      ))}
                  </div>
                  <button className="w-full py-3 border border-dashed border-gray-300 dark:border-slate-600 rounded-xl text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">+ Add New Card</button>
              </div>

              {/* Documents */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2"><span className="text-xl">📂</span> Documents</h3>
                  <div className="space-y-3">
                      {MOCK_DOCS.map(doc => (
                          <div key={doc.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-900 rounded-xl">
                              <div className="flex items-center gap-3">
                                  <span className="text-xl">📄</span>
                                  <div>
                                      <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{doc.name}</p>
                                      <p className="text-xs text-gray-400">{doc.date} • {doc.type}</p>
                                  </div>
                              </div>
                              <button className="text-zippy-600 font-bold text-xs bg-zippy-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg hover:bg-zippy-100">Download ⬇</button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
          
          {/* Action Bar */}
          <div className="mt-8 flex justify-end pb-8">
              <button 
                onClick={handleSaveSettings}
                className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-8 py-4 rounded-xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                  <span>💾</span> Save & Apply Changes
              </button>
          </div>
      </div>
  );

  const renderChatView = () => (
    <div className={`w-full transition-all duration-700 ease-in-out h-full flex flex-col ${tripData ? 'md:grid md:grid-cols-12 gap-6 p-4 md:p-8' : ''}`}>
        <div className={`transition-all duration-500 flex flex-col ${tripData ? 'md:col-span-4 h-[400px] md:h-[calc(100vh-4rem)]' : 'w-full h-full'}`}>
            <ChatInterface 
                messages={messages} 
                input={input} 
                setInput={setInput} 
                onSend={handleSend}
                isLoading={isLoading}
                onRestart={startNewChat}
                variant={tripData ? 'card' : 'full'} // Full width/height when no results, Card style when results exist
            />
        </div>

        {tripData && (
            <div className="md:col-span-8 flex flex-col h-full overflow-y-auto pb-24 md:pb-0 fade-in scrollbar-hide">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-white">
                        Top Picks for You 🎯
                    </h2>
                </div>
                
                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                    {tripData.trip_options.map((option, index) => (
                        <div key={option.id} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                            <TripCard 
                                option={option} 
                                index={index} 
                                onSelect={handleSelectTrip}
                                isFavorite={isFavorite(option.id)}
                                onToggleFavorite={() => handleToggleFavorite(option)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );

  const handleSelectTrip = (trip: TripOption) => {
    setSelectedTripForConfig(trip);
    setActiveDraft(null); // Fresh start
  };

  // --- GENERIC GRID VIEW FOR HISTORY & FAVORITES ---
  const renderTripGridView = (title: string, trips: TripOption[], emptyMsg: string) => (
    <div className="p-8 w-full h-screen overflow-y-auto pb-24 dark:text-white">
        <h2 className="text-3xl font-display font-bold text-gray-800 dark:text-white mb-6">{title}</h2>
        {trips.length === 0 ? (
             <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-300 dark:border-slate-600">
             <p className="text-gray-400 text-lg">{emptyMsg}</p>
             <button onClick={() => setActiveView('chat')} className="mt-4 text-zippy-600 font-bold hover:underline">Start planning</button>
         </div>
        ) : (
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                {trips.map((option, index) => (
                    <div key={option.id} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <TripCard 
                            option={option} 
                            index={index} 
                            onSelect={handleSelectTrip}
                            isFavorite={isFavorite(option.id)}
                            onToggleFavorite={() => handleToggleFavorite(option)}
                        />
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  // --- NEW: DRAFTS VIEW ---
  const renderDraftsView = () => (
      <div className="p-8 w-full h-screen overflow-y-auto pb-24 dark:text-white">
          <h2 className="text-3xl font-display font-bold text-gray-800 dark:text-white mb-6">Trips in Progress ✏️</h2>
          {draftTrips.length === 0 ? (
               <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-300 dark:border-slate-600">
               <p className="text-gray-400 text-lg">No incomplete trips. Great job!</p>
               <button onClick={() => setActiveView('chat')} className="mt-4 text-zippy-600 font-bold hover:underline">Start a new one</button>
           </div>
          ) : (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                  {draftTrips.map((draft, index) => (
                      <div key={draft.id} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                          <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-gray-100 relative group">
                            {/* Draft Card Content */}
                             <div className="h-36 relative flex flex-col justify-end overflow-hidden">
                                <img 
                                    src={draft.baseTrip.image || getDestinationImage(draft.baseTrip.destination)} 
                                    alt={draft.baseTrip.destination} 
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80"; // Fallback landscape
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                <div className="relative z-10 p-6">
                                    <h3 className="text-3xl font-display font-bold text-white drop-shadow-md leading-none">{draft.baseTrip.destination}</h3>
                                    <p className="text-white/60 text-xs font-bold uppercase tracking-wider mt-1">In Progress</p>
                                </div>
                             </div>
                             <div className="p-6 flex-1 flex flex-col gap-4">
                                 <div className="flex justify-between items-center text-sm text-gray-600">
                                     <span>Last updated:</span>
                                     <span className="font-bold">{new Date(draft.updatedAt).toLocaleDateString()}</span>
                                 </div>
                                 <div className="flex flex-wrap gap-2">
                                     <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{draft.travelers} Travelers</span>
                                     <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{draft.selectedActivityIndices.length} Activities</span>
                                 </div>
                                 <button 
                                    onClick={() => handleResumeDraft(draft)}
                                    className="w-full py-3 rounded-xl font-bold text-white shadow-lg bg-zippy-500 hover:bg-zippy-600 mt-auto"
                                 >
                                    Resume Planning ✏️
                                 </button>
                             </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
  );

  const renderBookingsView = () => (
    <div className="p-8 w-full max-w-4xl mx-auto h-screen overflow-y-auto pb-24 dark:text-white">
        <h2 className="text-3xl font-display font-bold text-gray-800 dark:text-white mb-6">My Trips ✈️</h2>
        {bookedTrips.length === 0 ? (
             <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-300 dark:border-slate-600">
             <p className="text-gray-400 text-lg">You haven't booked anything yet.</p>
             <button onClick={() => setActiveView('chat')} className="mt-4 text-zippy-600 font-bold hover:underline">Plan your first adventure!</button>
         </div>
        ) : (
            <div className="space-y-4">
                {bookedTrips.map((booking) => (
                    <div 
                        key={booking.id} 
                        onClick={() => setViewingBookingDetails(booking)}
                        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row gap-6 items-center cursor-pointer hover:shadow-md hover:border-zippy-200 transition-all group"
                    >
                        <div className="w-full md:w-32 h-32 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 relative">
                             <img 
                                src={booking.destinationImage} 
                                alt="Dest" 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                onError={(e) => {
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80"; // Fallback landscape
                                }} 
                             />
                             <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-zippy-600 transition-colors">{booking.trip.destination}</h3>
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Confirmed</span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{booking.hotel.name}</p>
                            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
                                <span className="flex items-center gap-1">🛫 {booking.outboundFlight.departureTime}</span>
                                <span className="flex items-center gap-1">🛬 {booking.returnFlight.arrivalTime}</span>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <p className="text-xs text-gray-400 uppercase font-bold">Total Paid</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{booking.pricing.currency}{booking.pricing.total}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row font-sans text-slate-800 dark:text-gray-200 overflow-hidden relative transition-colors duration-300">
      
      {renderSidebar()}

      <main className="flex-1 relative h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-purple-100/50 dark:from-purple-900/20 to-transparent pointer-events-none z-0"></div>
          
          <div className="relative z-10 h-full">
                {selectedTripForConfig ? (
                    <TripConfigurator 
                        baseTrip={selectedTripForConfig}
                        initialDraft={activeDraft} // Pass existing draft if resuming
                        onClose={() => handleSidebarClick('inprogress')} // Closing just minimizes to drafts
                        onConfirm={handleBookingConfirmed}
                        onDraftUpdate={handleDraftUpdate} // Auto-save handler
                        userProfile={userProfile}
                    />
                ) : (
                    <>
                        {/* RENDER HOMEPAGE IF ACTIVE VIEW IS HOME */}
                        {activeView === 'home' && <Homepage onStartPlanning={() => setActiveView('chat')} />}
                        
                        {activeView === 'chat' && renderChatView()}
                        {activeView === 'favorites' && renderTripGridView("Dream List 💖", savedTrips, "Your heart list is empty.")} 
                        {activeView === 'history' && renderTripGridView("History 📜", tripHistory, "No search history yet.")} 
                        {activeView === 'inprogress' && renderDraftsView()} {/* New View */}
                        
                        {activeView === 'bookings' && renderBookingsView()}
                        {activeView === 'account' && renderAccountView()}
                        {activeView === 'settings' && renderSettingsView()}
                    </>
                )}
          </div>
      </main>

      {showOnboarding && (
          <OnboardingFlow 
            initialData={userProfile}
            language={appSettings.language} // Pass current language setting
            onComplete={(profile) => {
                setUserProfile(profile);
                setShowOnboarding(false);
                startChatSession(profile, appSettings);
            }}
            onCancel={() => setShowOnboarding(false)}
          />
      )}

      {viewingBookingDetails && (
          <BookingDetailView 
              booking={viewingBookingDetails} 
              onBack={() => setViewingBookingDetails(null)} 
              onAddActivity={handleAddActivity}
          />
      )}

      {showSuccess && (
        <div className="fixed top-10 right-10 z-[100] bg-white dark:bg-slate-800 border border-green-100 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-in-right">
           <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">🎉</div>
           <div>
               <h4 className="font-bold text-gray-800 dark:text-white">{successMessage}</h4>
               <p className="text-xs text-gray-500">Updates saved.</p>
           </div>
        </div>
      )}

    </div>
  );
};

export default App;