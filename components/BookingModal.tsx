
import React, { useState } from 'react';
import { BookingDetails } from '../types';

interface BookingModalProps {
  details: BookingDetails;
  onClose: () => void;
  onPaymentComplete: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ details, onClose, onPaymentComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { trip, outboundFlight, returnFlight, hotel, pricing } = details;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate API processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentComplete();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-5xl h-auto max-h-[90vh] rounded-[2rem] shadow-2xl relative z-10 flex flex-col md:flex-row overflow-hidden animate-scale-up">
        
        {/* Left Side: Order Summary */}
        <div className="w-full md:w-2/5 bg-slate-50 p-6 md:p-10 flex flex-col border-b md:border-b-0 md:border-r border-gray-100 overflow-y-auto">
            <h2 className="text-xl md:text-2xl font-display font-bold text-gray-800 mb-6">Order Summary</h2>
            
            <div className="space-y-6">
                {/* Trip Info */}
                <div className="flex gap-4 items-start">
                     <div className="w-24 h-20 rounded-xl bg-gray-200 overflow-hidden shrink-0 shadow-sm">
                         <img src={details.destinationImage || trip.image} className="w-full h-full object-cover" alt="Dest" />
                     </div>
                     <div>
                         <h3 className="font-bold text-gray-800 text-lg leading-tight">{trip.destination}</h3>
                         <p className="text-xs text-gray-500 line-clamp-1 mt-1">{trip.title}</p>
                         <div className="mt-2 text-xs font-bold text-zippy-600 bg-zippy-50 inline-block px-2 py-1 rounded border border-zippy-100">
                             {details.travelers} Travelers • {trip.day_by_day.length} Days
                         </div>
                     </div>
                </div>

                <div className="w-full h-px bg-gray-200"></div>

                {/* Breakdown */}
                <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-2">✈️ Round Trip Flight</span>
                        <span className="font-medium text-green-600">Included</span>
                    </div>
                     <div className="flex justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-2">🏨 {hotel.name}</span>
                        <span className="font-medium text-green-600">Included</span>
                    </div>
                    {details.transport && (
                        <div className="flex justify-between text-sm text-gray-600">
                            <span className="flex items-center gap-2">{details.transport.icon} {details.transport.type}</span>
                            <span className="font-medium text-green-600">Included</span>
                        </div>
                    )}
                    
                    <div className="w-full h-px bg-gray-200 border-dashed"></div>

                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Package Base</span>
                        <span>{pricing.currency}{pricing.base}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Taxes & Fees</span>
                        <span>{pricing.currency}{pricing.taxes}</span>
                    </div>
                    {details.bookedActivities && details.bookedActivities.length > 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Extras ({details.bookedActivities.length})</span>
                            <span>Included</span>
                        </div>
                    )}
                </div>

                <div className="w-full h-px bg-gray-200"></div>

                <div className="flex justify-between items-end">
                    <span className="font-bold text-gray-800 pb-1">Total Due</span>
                    <span className="text-4xl font-display font-bold text-gray-900">{pricing.currency}{pricing.total}</span>
                </div>
                
                <div className="mt-auto pt-8 flex items-center justify-center gap-4 opacity-50 grayscale">
                    <span className="font-bold text-lg font-display">VISA</span>
                    <span className="font-bold text-lg font-display">Mastercard</span>
                    <span className="font-bold text-lg font-display">Stripe</span>
                </div>
            </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="flex-1 flex flex-col min-h-0 bg-white relative">
             <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col justify-center">
                 <div className="mb-8">
                    <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">Payment Details 💳</h2>
                    <p className="text-gray-500 text-sm">Complete your purchase securely.</p>
                 </div>
                 
                 <form onSubmit={handlePay} className="space-y-6">
                     <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cardholder Name</label>
                         <input type="text" placeholder="e.g. Sofia Rossi" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-zippy-500 outline-none font-medium transition-all text-gray-800 placeholder-gray-400" required />
                     </div>

                     <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Card Number</label>
                         <div className="relative">
                            <input type="text" placeholder="0000 0000 0000 0000" className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-zippy-500 outline-none font-medium transition-all text-gray-800 placeholder-gray-400" required />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                         </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                         <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expiry Date</label>
                             <input type="text" placeholder="MM/YY" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-zippy-500 outline-none font-medium transition-all text-gray-800 placeholder-gray-400" required />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CVC</label>
                             <input type="text" placeholder="123" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-zippy-500 outline-none font-medium transition-all text-gray-800 placeholder-gray-400" required />
                         </div>
                     </div>
                     
                     <div className="pt-6">
                        <button 
                            type="submit"
                            disabled={isProcessing}
                            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-gray-200 hover:bg-black hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Processing...
                                </div>
                            ) : (
                                <>Pay {pricing.currency}{pricing.total}</>
                            )}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                            🔒 SSL Encrypted & Secure
                        </p>
                     </div>
                 </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
