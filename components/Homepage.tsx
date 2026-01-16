

import React from 'react';
import { TripOption } from '../types';

interface HomepageProps {
  onStartPlanning: () => void;
}

const MOCK_VIRAL_TRIPS: Partial<TripOption>[] = [
    {
        id: 'v1',
        destination: "Kyoto, Japan",
        title: "Neon & Zen: Cyberpunk Temples",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
        mood: "Unique"
    },
    {
        id: 'v2',
        destination: "Iceland",
        title: "Chasing Auroras & Hot Springs",
        image: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=800&q=80",
        mood: "Adventure"
    },
    {
        id: 'v3',
        destination: "Amalfi Coast",
        title: "La Dolce Vita Roadtrip",
        image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80",
        mood: "Relax"
    }
];

const COMMUNITY_POSTS = [
    { user: "Sarah J.", avatar: "👩‍🎨", text: "Zippy found me a secret jazz bar in Tokyo that wasn't on ANY map! 🎷", dest: "Tokyo" },
    { user: "Marco P.", avatar: "👨‍💻", text: "Planned my honeymoon in 5 minutes. Wife is happy, I'm a hero. Thanks Zippy! 💍", dest: "Maldives" },
    { user: "Elisa B.", avatar: "🏃‍♀️", text: "The trekking route in Peru was intense but perfect. Spot on recommendation!", dest: "Peru" }
];

const PARTNERS = ["RateHawk", "Duffel", "Viator", "TripAdvisor", "Stripe"];

const Homepage: React.FC<HomepageProps> = ({ onStartPlanning }) => {
  return (
    <div className="w-full h-full overflow-y-auto bg-white scrollbar-hide">
        
        {/* HERO SECTION */}
        <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=80" alt="Travel Background" className="w-full h-full object-cover" />
                {/* DARK Gradient Overlay: Black at top (for text contrast) fading to White at bottom (to blend with content) */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-white"></div>
            </div>

            <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-10">
                <div className="inline-block px-5 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-bold mb-6 animate-fade-in shadow-lg">
                    The Future of Traveling is Here
                </div>
                <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 drop-shadow-lg animate-scale-up leading-tight">
                    Your Dream Trip,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-zippy-300 to-purple-300 drop-shadow-none">Designed by AI.</span>
                </h1>
                <p className="text-lg md:text-xl text-white/90 font-medium mb-10 max-w-2xl mx-auto animate-fade-in-up leading-relaxed drop-shadow-md">
                    Stop searching, start traveling. Zippy builds personalized itineraries, finds hidden gems, and books everything in seconds.
                </p>
                <button 
                    onClick={onStartPlanning}
                    className="bg-zippy-500 hover:bg-zippy-600 text-white text-lg px-10 py-5 rounded-2xl font-bold shadow-2xl shadow-zippy-900/50 hover:scale-105 active:scale-95 transition-all animate-bounce-soft border-2 border-transparent hover:border-white/20"
                >
                    Start Planning Now ✨
                </button>
            </div>
        </section>

        {/* HOW IT WORKS / BENEFITS */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-800 mb-4">Why Travelers Love Zippy</h2>
                <p className="text-gray-500">We do the hard work, you take the vacation.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { icon: "🧠", title: "Smart Prediction", desc: "We read your mind (almost). Zippy learns your style to suggest spots you'll actually love." },
                    { icon: "⚡", title: "Instant Booking", desc: "Flights, hotels, and activities booked in one tap. No more 50 open tabs." },
                    { icon: "🛡️", title: "Trusted & Safe", desc: "We partner with global leaders to ensure your booking is secure and guaranteed." },
                    { icon: "🧞‍♂️", title: "Personal AI Agent", desc: "After booking, unlock a dedicated AI concierge that knows your trip inside out. Support 24/7." }
                ].map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-2 group">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-sm mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* VIRAL TRIPS (Inspirational) */}
        <section className="py-20 bg-gray-900 text-white overflow-hidden">
            <div className="px-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <span className="text-zippy-400 font-bold uppercase tracking-wider text-sm">Trending Now</span>
                        <h2 className="text-3xl md:text-4xl font-display font-bold mt-2">Viral Trips 🔥</h2>
                    </div>
                    <button onClick={onStartPlanning} className="hidden md:block text-white border-b border-zippy-400 pb-1 hover:text-zippy-400 transition-colors">See all trends</button>
                </div>

                <div className="flex overflow-x-auto gap-6 pb-8 snap-x scrollbar-hide">
                    {MOCK_VIRAL_TRIPS.map((trip) => (
                        <div key={trip.id} onClick={onStartPlanning} className="snap-center shrink-0 w-[300px] md:w-[350px] bg-gray-800 rounded-3xl overflow-hidden cursor-pointer group relative">
                            <div className="h-[400px] relative">
                                <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-6">
                                    <span className="bg-zippy-500 text-white text-xs font-bold px-2 py-1 rounded-md mb-2 inline-block shadow-lg">#{trip.mood}</span>
                                    <h3 className="text-2xl font-bold font-display mb-1">{trip.destination}</h3>
                                    <p className="text-gray-300 text-sm mb-2">{trip.title}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* CTA Card */}
                    <div onClick={onStartPlanning} className="snap-center shrink-0 w-[300px] md:w-[350px] bg-gray-800 rounded-3xl flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-700 hover:border-zippy-500 transition-colors">
                        <div className="text-center">
                            <div className="text-4xl mb-4">✨</div>
                            <h3 className="text-xl font-bold">Create Yours</h3>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* COMMUNITY & SOCIAL PROOF */}
        <section className="py-20 px-6 max-w-7xl mx-auto bg-white">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-800 mb-6">
                        Join the <span className="text-zippy-600">Funniest</span> Travel Community.
                    </h2>
                    <p className="text-lg text-gray-500 mb-8">
                        Over 50,000 travelers are sharing their itineraries, hidden spots, and hilarious travel fails. Be part of the movement.
                    </p>
                    <div className="flex -space-x-4 mb-8">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-lg overflow-hidden">
                                <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                            </div>
                        ))}
                        <div className="w-12 h-12 rounded-full border-4 border-white bg-zippy-100 flex items-center justify-center text-xs font-bold text-zippy-700">
                            +50k
                        </div>
                    </div>
                    <button onClick={onStartPlanning} className="text-zippy-600 font-bold text-lg hover:underline">Read Success Stories →</button>
                </div>

                <div className="space-y-4">
                    {COMMUNITY_POSTS.map((post, idx) => (
                        <div key={idx} className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start transform transition-transform hover:scale-105 ${idx % 2 === 0 ? 'md:translate-x-4' : ''}`}>
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl shrink-0">
                                {post.avatar}
                            </div>
                            <div>
                                <p className="text-gray-800 text-sm font-medium italic">"{post.text}"</p>
                                <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-wide">— {post.user} visited {post.dest}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* TRUSTED PARTNERS */}
        <section className="py-12 bg-slate-50 border-t border-slate-200">
            <div className="px-6 max-w-7xl mx-auto text-center">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Trusted by Global Leaders</p>
                <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {PARTNERS.map((partner, idx) => (
                        <span key={idx} className="text-3xl md:text-5xl font-display font-bold text-slate-400 hover:text-slate-800 cursor-default">
                            {partner}
                        </span>
                    ))}
                </div>
            </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24 px-6 bg-gradient-to-br from-zippy-600 to-purple-700 text-center">
             <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-8">Ready for your next adventure?</h2>
             <button 
                onClick={onStartPlanning}
                className="bg-white text-zippy-600 px-12 py-4 rounded-full font-bold text-xl shadow-2xl hover:bg-gray-100 transition-colors"
             >
                Launch Chat Planner 💬
             </button>
             <p className="text-white/60 mt-6 text-sm">Let's plan your dream trip in a few minutes</p>
        </section>
    </div>
  );
};

export default Homepage;