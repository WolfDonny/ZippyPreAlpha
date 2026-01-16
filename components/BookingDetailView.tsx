
import React, { useState, useEffect } from 'react';
import { BookingDetails, Message, ActivityProposal } from '../types';
import ChatInterface from './ChatInterface';
import { sendMessageToGemini, startConciergeSession } from '../services/geminiService';

interface BookingDetailViewProps {
  booking: BookingDetails;
  onBack: () => void;
  onAddActivity: (bookingId: string, activity: ActivityProposal) => void;
}

const BookingDetailView: React.FC<BookingDetailViewProps> = ({ booking, onBack, onAddActivity }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Concierge on mount ONLY when the booking ID changes.
  useEffect(() => {
    startConciergeSession(booking);
    setMessages([{
      role: 'model',
      text: `Yesss! I'm Zippy, your personal travel agent for this incredible adventure to ${booking.trip.destination}! 🌟\n\nFrom this moment on, I'm at your complete service: whether you need a secret restaurant recommendation, packing tips, or just want to chat about your itinerary... ask me anything! Let's make this trip legendary! 🚀✨`
    }]);
  }, [booking.id]); 

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(userMsg, 'concierge');
      
      const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
      const match = responseText.match(jsonRegex);
      
      let finalMessage: Message = { role: 'model', text: responseText };

      if (match && match[1]) {
        try {
           const data = JSON.parse(match[1]);
           if (data.activity_proposal) {
             const cleanText = responseText.replace(jsonRegex, '').trim();
             finalMessage = {
                role: 'model',
                text: cleanText || "I found something perfect for you:",
                activityProposal: data.activity_proposal
             };
           }
        } catch (e) {
          console.error("Failed to parse activity JSON", e);
        }
      }

      setMessages(prev => [...prev, finalMessage]);

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I lost connection with the lobby! Try again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookActivity = (activity: ActivityProposal) => {
      onAddActivity(booking.id, activity);
      setMessages(prev => [...prev, { role: 'model', text: `Boom! 💥 "${activity.title}" is booked! Added to your extras.` }]);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-slide-in-right">
      
      {/* Header */}
      <div className="h-16 border-b border-gray-100 flex items-center px-6 justify-between shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium group">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="hidden md:inline">Back to My Trips</span>
        </button>
        <h2 className="font-display font-bold text-lg text-gray-800">
            Zippy AI Dashboard
        </h2>
        <div className="w-8 h-8 bg-zippy-100 rounded-full flex items-center justify-center text-zippy-600 font-bold text-xs">
            {booking.trip.destination.substring(0,2).toUpperCase()}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Column: Trip Logistics & Recap */}
        <div className="w-full md:w-[400px] bg-slate-50 border-r border-gray-100 flex flex-col overflow-y-auto shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            <div className="p-6 pb-24 md:pb-6">
                <div className="relative h-48 rounded-2xl overflow-hidden mb-6 shadow-md group cursor-default">
                    <img src={booking.destinationImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Dest" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <div>
                            <h1 className="text-white font-display font-bold text-2xl drop-shadow-md">{booking.trip.destination}</h1>
                            <p className="text-white/90 text-sm font-medium">Confirmed</p>
                        </div>
                    </div>
                </div>

                {/* Section: Zippy's Trip Intel (Recommendations) */}
                <div className="mb-6">
                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 px-1 flex items-center gap-1">Zippy's Trip Intel 🧠</h3>
                     <div className="grid grid-cols-1 gap-3">
                         {booking.recommendations && booking.recommendations.map((rec, idx) => (
                             <div key={idx} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex gap-3 hover:border-zippy-200 transition-all">
                                 <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-xl shrink-0">
                                     {rec.icon}
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-gray-800 text-sm">{rec.title}</h4>
                                     <p className="text-xs text-gray-500 leading-snug">{rec.description}</p>
                                 </div>
                             </div>
                         ))}
                     </div>
                </div>

                {/* Section: Hotel */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 px-1">Accommodation</h3>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                        <div className="h-36 w-full relative overflow-hidden">
                            <img 
                                src={booking.hotel.image} 
                                alt={booking.hotel.name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            />
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
                                <span className="text-yellow-500 text-xs font-bold tracking-wide">{"★".repeat(booking.hotel.stars)}</span>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-bold text-gray-800 leading-tight text-base">{booking.hotel.name}</p>
                                    <p className="text-xs text-gray-500 mt-1 font-medium bg-gray-50 inline-block px-2 py-0.5 rounded">{booking.hotel.roomType}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Flights */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 px-1">Flight Itinerary</h3>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        
                        {/* Outbound */}
                        <div className="p-4 border-b border-gray-100 relative group">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-100">Outbound</span>
                                <div className="text-right">
                                    <span className="text-xs text-gray-800 font-bold block">{booking.outboundFlight.airline}</span>
                                    <span className="text-[10px] text-gray-400 font-mono">{booking.outboundFlight.flightNumber}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xl font-display font-bold text-gray-800">{booking.outboundFlight.departureTime}</span>
                                <div className="flex-1 mx-4 h-px bg-gray-200 relative flex justify-center">
                                    <span className="absolute -top-1.5 text-gray-300 transform rotate-90">✈</span>
                                </div>
                                <span className="text-xl font-display font-bold text-gray-800">{booking.outboundFlight.arrivalTime}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 font-medium px-1">
                                <span>{booking.outboundFlight.from}</span>
                                <span className="text-gray-400 text-[10px]">{booking.outboundFlight.duration}</span>
                                <span>{booking.outboundFlight.to}</span>
                            </div>
                        </div>

                        {/* Return */}
                        <div className="p-4 relative group">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-purple-100">Return</span>
                                <div className="text-right">
                                    <span className="text-xs text-gray-800 font-bold block">{booking.returnFlight.airline}</span>
                                    <span className="text-[10px] text-gray-400 font-mono">{booking.returnFlight.flightNumber}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xl font-display font-bold text-gray-800">{booking.returnFlight.departureTime}</span>
                                <div className="flex-1 mx-4 h-px bg-gray-200 relative flex justify-center">
                                    <span className="absolute -top-1.5 text-gray-300 transform -rotate-90">✈</span>
                                </div>
                                <span className="text-xl font-display font-bold text-gray-800">{booking.returnFlight.arrivalTime}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 font-medium px-1">
                                <span>{booking.returnFlight.from}</span>
                                <span className="text-gray-400 text-[10px]">{booking.returnFlight.duration}</span>
                                <span>{booking.returnFlight.to}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Transport */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 px-1">Transport</h3>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-xl">
                            {booking.transport.icon}
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 text-sm">{booking.transport.type}</p>
                            <p className="text-xs text-gray-500">{booking.transport.description}</p>
                        </div>
                    </div>
                </div>

                {/* Section: Added Activities */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex justify-between items-center px-1">
                        <span>Your Extras</span>
                        <span className="bg-zippy-100 text-zippy-700 px-2 py-0.5 rounded-full text-[10px] min-w-[20px] text-center">{booking.bookedActivities?.length || 0}</span>
                    </h3>
                    
                    {(!booking.bookedActivities || booking.bookedActivities.length === 0) ? (
                        <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                            <p className="text-gray-400 text-sm font-medium">No extras booked yet.</p>
                            <p className="text-xs text-zippy-500 mt-2 font-bold">Ask Zippy for ideas! 👉</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {booking.bookedActivities.map(act => (
                                <div key={act.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center group hover:border-zippy-300 transition-colors">
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">{act.title}</p>
                                        <p className="text-xs text-gray-500">{act.duration}</p>
                                    </div>
                                    <div className="text-right">
                                         <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Booked</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column: Concierge Chat */}
        <div className="flex-1 bg-white relative flex flex-col h-full z-0">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zippy-400 to-purple-500 z-10"></div>
            
            <ChatInterface 
                messages={messages} 
                input={input} 
                setInput={setInput} 
                onSend={handleSend} 
                isLoading={isLoading}
                customRender={(msg) => msg.activityProposal && (
                    <div className="mt-4 mb-2 bg-white p-5 rounded-2xl shadow-xl border border-gray-100 max-w-sm mx-auto animate-scale-up relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-zippy-500"></div>
                        <div className="flex justify-between items-start mb-3 pl-2">
                            <h4 className="font-display font-bold text-gray-900 text-lg leading-tight">{msg.activityProposal.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-5 pl-2 leading-relaxed">{msg.activityProposal.description}</p>
                        <div className="flex justify-between items-center pl-2">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                ⏱ {msg.activityProposal.duration}
                            </span>
                            <button 
                                onClick={() => handleBookActivity(msg.activityProposal!)}
                                className="bg-zippy-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-zippy-200 hover:bg-zippy-700 hover:scale-105 active:scale-95 transition-all"
                            >
                                Book It +
                            </button>
                        </div>
                    </div>
                )}
            />
        </div>
      </div>
    </div>
  );
};

export default BookingDetailView;
