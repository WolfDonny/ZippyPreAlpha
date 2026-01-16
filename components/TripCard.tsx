
import React from 'react';
import { TripOption } from '../types';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface TripCardProps {
  option: TripOption;
  index: number;
  onSelect: (option: TripOption) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const TripCard: React.FC<TripCardProps> = ({ option, index, onSelect, isFavorite, onToggleFavorite }) => {
  const chartData = [
    { subject: 'Adv.', A: option.metrics?.adventure || 50, fullMark: 100 },
    { subject: 'Chill', A: option.metrics?.relaxation || 50, fullMark: 100 },
    { subject: 'Cult.', A: option.metrics?.culture || 50, fullMark: 100 },
    { subject: 'Food', A: option.metrics?.food || 50, fullMark: 100 },
    { subject: 'Party', A: option.metrics?.nightlife || 50, fullMark: 100 },
  ];

  const gradients = [
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-purple-600',
    'from-cyan-400 to-blue-500'
  ];
  
  const accentColor = index === 0 ? '#ec4899' : index === 1 ? '#8b5cf6' : '#06b6d4';
  const bgGradient = gradients[index % gradients.length];

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-gray-100 relative group">
      
      {/* Hero Header */}
      <div className={`h-36 relative flex flex-col justify-end overflow-hidden`}>
        {option.image ? (
            <>
                <img src={option.image} alt={option.destination} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            </>
        ) : (
            <div className={`absolute inset-0 bg-gradient-to-r ${bgGradient}`}></div>
        )}

        <div className="relative z-10 p-6">
            <div className="absolute top-[-1.5rem] right-0 z-10">
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${isFavorite ? 'bg-white text-red-500 scale-110' : 'bg-white/20 text-white hover:bg-white hover:text-red-500'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
            </div>
            
            <h3 className="text-3xl font-display font-bold text-white drop-shadow-md leading-none">
            {option.destination}
            </h3>
            <p className="text-white/80 text-sm font-medium mt-1">{option.title}</p>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-4">
        <p className="text-gray-600 text-sm leading-relaxed">"{option.summary}"</p>

        {/* Mini Radar Chart */}
        <div className="h-40 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
              <PolarGrid stroke="#f3f4f6" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Vibe"
                dataKey="A"
                stroke={accentColor}
                strokeWidth={2}
                fill={accentColor}
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Why this fits */}
        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
             <span className="text-xs text-gray-400 font-bold uppercase block mb-1">The Vibe Check</span>
             <p className="text-xs text-gray-700 font-medium leading-snug">{option.why_it_fits}</p>
        </div>

        {/* Action Button - Price section removed as it's premature */}
        <button 
          onClick={() => onSelect(option)}
          className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transform transition active:scale-95 bg-gray-900 hover:bg-gray-800 mt-auto`}
        >
          Book This Trip ✈️
        </button>
      </div>
    </div>
  );
};

export default TripCard;
