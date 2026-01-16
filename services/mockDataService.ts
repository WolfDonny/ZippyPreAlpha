

import { TripOption, BookingDetails, Flight, Hotel, Pricing, Transport, ActivityProposal, DraftTrip, DetailedPreferences, TripRecommendation, RefinedTripRequest, DayPlan } from '../types';

const AIRLINES = ["Zippy Air", "SkyWings", "Global Jet", "Oceanic Airlines", "VibeFly", "Aurora Airways", "Nova Jet"];

// --- CURRENCY HELPER ---
export const CURRENCY_RATES: Record<string, number> = {
    'EUR': 1,
    'USD': 1.08,
    'GBP': 0.85,
    'JPY': 161.50
};

export const convertPrice = (priceInEUR: number, targetCurrency: string): number => {
    const rate = CURRENCY_RATES[targetCurrency] || 1;
    return Math.round(priceInEUR * rate);
};

export const formatPrice = (price: number, currency: string): string => {
    const converted = convertPrice(price, currency);
    // Format clearly
    return `${currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '¥'}${converted.toLocaleString()}`;
};

// --- MASSIVE UNSPLASH IMAGE DATABASE ---
// Mapping keywords/cities to high-quality, stable Unsplash IDs
const DESTINATION_IMAGES: Record<string, string> = {
    // EUROPE
    "paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    "france": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    "rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
    "roma": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
    "italy": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80",
    "italia": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80",
    "venice": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80",
    "venezia": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80",
    "florence": "https://images.unsplash.com/photo-1541363657777-66a9d5929317?auto=format&fit=crop&w=1200&q=80",
    "firenze": "https://images.unsplash.com/photo-1541363657777-66a9d5929317?auto=format&fit=crop&w=1200&q=80",
    "milan": "https://images.unsplash.com/photo-1610444565259-71c08022a76a?auto=format&fit=crop&w=1200&q=80",
    "milano": "https://images.unsplash.com/photo-1610444565259-71c08022a76a?auto=format&fit=crop&w=1200&q=80",
    "london": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
    "uk": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
    "madrid": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80",
    "barcelona": "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80",
    "spain": "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1200&q=80",
    "ibiza": "https://images.unsplash.com/photo-1560368140-5e3a890a8806?auto=format&fit=crop&w=1200&q=80",
    "berlin": "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1200&q=80",
    "germany": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80",
    "munich": "https://images.unsplash.com/photo-1595867865332-acd3386e3556?auto=format&fit=crop&w=1200&q=80",
    "amsterdam": "https://images.unsplash.com/photo-1512470876302-687da745ca84?auto=format&fit=crop&w=1200&q=80",
    "netherlands": "https://images.unsplash.com/photo-1512470876302-687da745ca84?auto=format&fit=crop&w=1200&q=80",
    "prague": "https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1200&q=80",
    "vienna": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=1200&q=80",
    "budapest": "https://images.unsplash.com/photo-1565426873118-a17ed65d7429?auto=format&fit=crop&w=1200&q=80",
    "lisbon": "https://images.unsplash.com/photo-1555881400-74d7acaacd81?auto=format&fit=crop&w=1200&q=80",
    "portugal": "https://images.unsplash.com/photo-1555881400-74d7acaacd81?auto=format&fit=crop&w=1200&q=80",
    "dublin": "https://images.unsplash.com/photo-1549918864-48ac978761a4?auto=format&fit=crop&w=1200&q=80",
    "ireland": "https://images.unsplash.com/photo-1549918864-48ac978761a4?auto=format&fit=crop&w=1200&q=80",
    "edinburgh": "https://images.unsplash.com/photo-1533560642735-a7c0678fa429?auto=format&fit=crop&w=1200&q=80",
    "scotland": "https://images.unsplash.com/photo-1533560642735-a7c0678fa429?auto=format&fit=crop&w=1200&q=80",
    "stockholm": "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=1200&q=80",
    "sweden": "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=1200&q=80",
    "copenhagen": "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=1200&q=80",
    "denmark": "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=1200&q=80",
    "oslo": "https://images.unsplash.com/photo-1587588354456-ae376af71a25?auto=format&fit=crop&w=1200&q=80",
    "norway": "https://images.unsplash.com/photo-1587588354456-ae376af71a25?auto=format&fit=crop&w=1200&q=80",
    "iceland": "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=1200&q=80",
    "reykjavik": "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=1200&q=80",
    "switzerland": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
    "zurich": "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=1200&q=80",
    "greece": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
    "santorini": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
    "mykonos": "https://images.unsplash.com/photo-1601581875039-e899893d520c?auto=format&fit=crop&w=1200&q=80",
    "athens": "https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=1200&q=80",
    "croatia": "https://images.unsplash.com/photo-1555990538-17a6ed708d88?auto=format&fit=crop&w=1200&q=80",
    "dubrovnik": "https://images.unsplash.com/photo-1555990538-17a6ed708d88?auto=format&fit=crop&w=1200&q=80",

    // AMERICAS
    "new york": "https://images.unsplash.com/photo-1496442226666-8d4a0e9493fe?auto=format&fit=crop&w=1200&q=80",
    "nyc": "https://images.unsplash.com/photo-1496442226666-8d4a0e9493fe?auto=format&fit=crop&w=1200&q=80",
    "usa": "https://images.unsplash.com/photo-1496442226666-8d4a0e9493fe?auto=format&fit=crop&w=1200&q=80",
    "los angeles": "https://images.unsplash.com/photo-1580655653885-65763b8436da?auto=format&fit=crop&w=1200&q=80",
    "california": "https://images.unsplash.com/photo-1580655653885-65763b8436da?auto=format&fit=crop&w=1200&q=80",
    "san francisco": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80",
    "las vegas": "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?auto=format&fit=crop&w=1200&q=80",
    "miami": "https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=1200&q=80",
    "florida": "https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=1200&q=80",
    "chicago": "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1200&q=80",
    "toronto": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80",
    "canada": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80",
    "vancouver": "https://images.unsplash.com/photo-1560264280-88b68371db39?auto=format&fit=crop&w=1200&q=80",
    "mexico": "https://images.unsplash.com/photo-1585464231875-d9cae9f0d82b?auto=format&fit=crop&w=1200&q=80",
    "cancun": "https://images.unsplash.com/photo-1552074291-ad4dfd8b11c0?auto=format&fit=crop&w=1200&q=80",
    "tulum": "https://images.unsplash.com/photo-1506190503969-983296c69f2e?auto=format&fit=crop&w=1200&q=80",
    "brazil": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
    "rio": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
    "argentina": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=1200&q=80",
    "buenos aires": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=1200&q=80",
    "peru": "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80",
    "machu picchu": "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80",
    "colombia": "https://images.unsplash.com/photo-1533630654593-b222d5d44449?auto=format&fit=crop&w=1200&q=80",
    
    // ASIA & OCEANIA
    "tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
    "japan": "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1200&q=80",
    "kyoto": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    "osaka": "https://images.unsplash.com/photo-1590559375987-97529d003d8d?auto=format&fit=crop&w=1200&q=80",
    "seoul": "https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1200&q=80",
    "korea": "https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1200&q=80",
    "beijing": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=80",
    "shanghai": "https://images.unsplash.com/photo-1548957175-84f0f9af659e?auto=format&fit=crop&w=1200&q=80",
    "china": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=80",
    "hong kong": "https://images.unsplash.com/photo-1506318137071-a8bcbf67cc77?auto=format&fit=crop&w=1200&q=80",
    "singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80",
    "bangkok": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80",
    "thailand": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80",
    "phuket": "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1200&q=80",
    "bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    "indonesia": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    "vietnam": "https://images.unsplash.com/photo-1528127220108-612460f99340?auto=format&fit=crop&w=1200&q=80",
    "hanoi": "https://images.unsplash.com/photo-1555921090-b1cd30b6c968?auto=format&fit=crop&w=1200&q=80",
    "india": "https://images.unsplash.com/photo-1532664189809-021334269b70?auto=format&fit=crop&w=1200&q=80",
    "maldives": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
    "australia": "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=1200&q=80",
    "sydney": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80",
    "melbourne": "https://images.unsplash.com/photo-1514395462725-fb4566210144?auto=format&fit=crop&w=1200&q=80",
    "new zealand": "https://images.unsplash.com/photo-1469521669194-babb45599def?auto=format&fit=crop&w=1200&q=80",

    // AFRICA & MIDDLE EAST
    "dubai": "https://images.unsplash.com/photo-1512453979798-5ea904ac66de?auto=format&fit=crop&w=1200&q=80",
    "uae": "https://images.unsplash.com/photo-1512453979798-5ea904ac66de?auto=format&fit=crop&w=1200&q=80",
    "morocco": "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1200&q=80",
    "marrakech": "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1200&q=80",
    "egypt": "https://images.unsplash.com/photo-1539650116455-251c93c58763?auto=format&fit=crop&w=1200&q=80",
    "cairo": "https://images.unsplash.com/photo-1539650116455-251c93c58763?auto=format&fit=crop&w=1200&q=80",
    "south africa": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=80",
    "cape town": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=80",
    "tanzania": "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    "zanzibar": "https://images.unsplash.com/photo-1596423405335-97813df97652?auto=format&fit=crop&w=1200&q=80",
    "istanbul": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
    "turkey": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80"
};


export const getDestinationImage = (destination: string): string => {
  const lowerDest = destination.toLowerCase();
  
  // 1. Direct match
  if (DESTINATION_IMAGES[lowerDest]) return DESTINATION_IMAGES[lowerDest];
  
  // 2. Partial match
  const keys = Object.keys(DESTINATION_IMAGES);
  for (const key of keys) {
      if (lowerDest.includes(key) || key.includes(lowerDest)) {
          return DESTINATION_IMAGES[key];
      }
  }

  // 3. Fallback to generic travel image
  return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80";
};


// --- HELPER LOGIC ---

export const generateSmartDraft = (baseTrip: TripOption, preferences?: DetailedPreferences, refinedRequest?: RefinedTripRequest): DraftTrip => {
    // 1. Determine Preferences and Granular Budgets
    // Default values if no refinedRequest
    let travelers = 2;
    let flightBudget = 'Comfort';
    let hotelBudget = 'Comfort';
    let transportBudget = 'Comfort';

    // NEW: Calculate target days based on request
    let targetDays = 5;

    if (refinedRequest) {
        travelers = refinedRequest.travelers || 2;
        flightBudget = refinedRequest.flightBudget || 'Comfort';
        hotelBudget = refinedRequest.hotelBudget || 'Comfort';
        transportBudget = refinedRequest.transportBudget || 'Comfort';

        // Check dates first
        if (refinedRequest.startDate && refinedRequest.endDate && refinedRequest.startDate.includes('-') && refinedRequest.endDate.includes('-')) {
             const s = new Date(refinedRequest.startDate);
             const e = new Date(refinedRequest.endDate);
             const diffTime = Math.abs(e.getTime() - s.getTime());
             const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
             targetDays = daysDiff > 0 ? daysDiff + 1 : 5; // Inclusive
        } else if (refinedRequest.duration) {
             if (refinedRequest.duration.includes('Weekend')) targetDays = 3;
             else if (refinedRequest.duration.includes('4-5')) targetDays = 5;
             else if (refinedRequest.duration.includes('Week')) targetDays = 7;
             else if (refinedRequest.duration.includes('10+')) targetDays = 12;
        }
    } 

    const isFlightLuxury = flightBudget === 'Luxury';
    const isFlightBudget = flightBudget === 'Economy';
    
    const isHotelLuxury = hotelBudget === 'Luxury';
    const isHotelBudget = hotelBudget === 'Economy';
    
    const isTransportLuxury = transportBudget === 'Luxury';
    
    // 2. Generate Hotels based on Hotel Budget
    const hotels: Hotel[] = [
        {
            id: 'h1',
            name: isHotelLuxury ? `The Grand ${baseTrip.destination} Palace` : (isHotelBudget ? `City Budget Inn` : `City Central ${baseTrip.destination}`),
            stars: isHotelLuxury ? 5 : (isHotelBudget ? 2 : 4),
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
            roomType: isHotelLuxury ? "Executive Suite" : (isHotelBudget ? "Twin Room" : "Standard Double"),
            price: isHotelLuxury ? 450 : (isHotelBudget ? 60 : 150),
            location: "City Center"
        },
        {
            id: 'h2',
            name: isHotelBudget ? "Backpacker's Haven" : "Boutique Loft",
            stars: isHotelBudget ? 2 : 4,
            image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
            roomType: isHotelBudget ? "Bunk Bed" : "Design Room",
            price: isHotelBudget ? 45 : 180,
            location: "Arts District"
        }
    ];

    // 3. Generate Flights based on Flight Budget
    const flights = [
        {
            outbound: { id: 'f1_out', airline: AIRLINES[0], flightNumber: 'ZP101', departureTime: '08:00', arrivalTime: '12:00', duration: '4h', from: 'HOME', to: baseTrip.destination.substring(0,3).toUpperCase(), price: isFlightBudget ? 200 : 400, class: 'Economy', baggage: 'Carry-on', stops: 'Direct' },
            return: { id: 'f1_ret', airline: AIRLINES[0], flightNumber: 'ZP102', departureTime: '14:00', arrivalTime: '18:00', duration: '4h', from: baseTrip.destination.substring(0,3).toUpperCase(), to: 'HOME', price: 0, class: 'Economy', baggage: 'Carry-on', stops: 'Direct' }
        },
        {
            outbound: { id: 'f2_out', airline: AIRLINES[1], flightNumber: 'SW555', departureTime: '18:00', arrivalTime: '22:00', duration: '4h', from: 'HOME', to: baseTrip.destination.substring(0,3).toUpperCase(), price: isFlightLuxury ? 800 : 600, class: isFlightLuxury ? 'Business' : 'Economy', baggage: 'Checked 23kg', stops: 'Direct' },
            return: { id: 'f2_ret', airline: AIRLINES[1], flightNumber: 'SW556', departureTime: '09:00', arrivalTime: '13:00', duration: '4h', from: baseTrip.destination.substring(0,3).toUpperCase(), to: 'HOME', price: 0, class: isFlightLuxury ? 'Business' : 'Economy', baggage: 'Checked 23kg', stops: 'Direct' }
        }
    ] as { outbound: Flight, return: Flight }[];

    // Select default flight index: if Luxury, pick index 1, else index 0
    const defaultFlightIndex = isFlightLuxury ? 1 : 0;

    // 4. Generate Transport based on Transport Budget
    const transports: Transport[] = [
        { id: 't1', type: isTransportLuxury ? 'Private Limousine' : 'Airport Transfer', description: 'Driver meets you at arrival', price: isTransportLuxury ? 150 : 80, icon: '🚘' },
        { id: 't2', type: 'Express Train', description: 'Fastest way to city center', price: 25, icon: '🚆' },
        { id: 't4', type: 'City Taxi / Uber', description: 'Single ride', price: 35, icon: '🚖' },
        { id: 't5', type: 'Scooter Rental', description: 'Daily rental', price: 40, icon: '🛵' }
    ];
    
    // Add SUV option if budget allows or if explicitly requested in prompts (mocked logic here)
    const canAffordCar = refinedRequest?.transportBudget === 'Comfort' || refinedRequest?.transportBudget === 'Luxury';
    if (canAffordCar) {
         transports.push({ id: 't3', type: 'Car Rental (SUV)', description: 'Full trip rental', price: 600, icon: '🚙' });
    }

    // 5. Generate Activities (Expanded List)
    const activities: ActivityProposal[] = [
        { title: `Best of ${baseTrip.destination} Tour`, description: "Guided walking tour", price: 50, currency: "€", duration: "3h" },
        { title: "Local Food Tasting", description: "5 stops, all inclusive", price: 90, currency: "€", duration: "4h" },
        { title: "Sunset Viewpoint Access", description: "Panoramic views with drinks", price: 30, currency: "€", duration: "2h" },
        { title: "Museum Skip-the-line", description: "Audio guide included", price: 45, currency: "€", duration: "3h" }
    ];

    // 6. Adjust Day Plan Length
    const currentDays = baseTrip.day_by_day || [];
    let newDays = [...currentDays];
    
    if (newDays.length < targetDays) {
        // Add days
        for (let i = newDays.length + 1; i <= targetDays; i++) {
            newDays.push({
                day: i,
                title: `Day ${i} Exploration`,
                description: `Discover more hidden gems in ${baseTrip.destination} based on your interests.`
            });
        }
    } else if (newDays.length > targetDays) {
        // Slice
        newDays = newDays.slice(0, targetDays);
    }
    
    const modifiedTrip = { ...baseTrip, day_by_day: newDays };

    // NEW: Initialize activity map with intelligent distribution
    const activityDayMap: Record<number, number> = {};
    if (activities.length > 0) {
        // Distribute initial activities across the first few days, avoiding day 0 (arrival) if possible unless short trip
        for (let i = 0; i < activities.length; i++) {
            if (targetDays > 2) {
                const availableDayRange = Math.max(1, targetDays - 1); 
                const dayIndex = (i % availableDayRange) + 1; 
                activityDayMap[i] = Math.min(dayIndex, targetDays - 1);
            } else {
                activityDayMap[i] = i % targetDays;
            }
        }
    }

    // NEW: Initialize transport map
    // If user has 'Car Rental' available and high budget, default to that for ALL days.
    // Else, default to Airport Transfer for Day 0 only.
    const transportDayMap: Record<number, string> = {};
    const suvOption = transports.find(t => t.type.includes('Car Rental'));
    
    if (canAffordCar && suvOption) {
        // Assign SUV to all days
        for (let i = 0; i < targetDays; i++) {
            transportDayMap[i] = suvOption.id;
        }
    } else {
        // Just arrival transfer
        transportDayMap[0] = transports[0].id;
    }

    return {
        id: `draft_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        updatedAt: new Date().toISOString(),
        baseTrip: modifiedTrip,
        travelers: travelers,
        currency: "€",
        availableFlights: flights,
        availableHotels: hotels,
        availableTransports: transports,
        availableActivities: activities,
        selectedFlightIndex: defaultFlightIndex,
        selectedHotelId: hotels[0].id,
        selectedTransportId: transports[0].id, // Default ID fallback
        // SELECT ALL DEFAULT ACTIVITIES
        selectedActivityIndices: activities.map((_, i) => i), 
        activityDayMap: activityDayMap,
        transportDayMap: transportDayMap
    };
};

export const convertDraftToBooking = (draft: DraftTrip): BookingDetails => {
    const flight = draft.availableFlights[draft.selectedFlightIndex];
    const hotel = draft.availableHotels.find(h => h.id === draft.selectedHotelId)!;
    // Fallback: use selectedTransportId if transportDayMap[0] is missing, or just picking one for the "Main Booking"
    const mainTransportId = draft.transportDayMap[0] || draft.selectedTransportId;
    const transport = draft.availableTransports.find(t => t.id === mainTransportId) || draft.availableTransports[0];
    
    // Calculate Total
    let activityTotal = 0;
    const selectedActivities = draft.selectedActivityIndices.map(idx => {
        const act = draft.availableActivities[idx];
        activityTotal += act.price * draft.travelers;
        return {
            id: `act_${Date.now()}_${idx}`,
            title: act.title,
            description: act.description,
            price: act.price,
            currency: act.currency,
            duration: act.duration,
            bookedAt: new Date().toISOString()
        };
    });

    // Calculate Transport Total (Sum of all days unique transports? Or daily cost?)
    // Simplified: If Car Rental, price * 1 (weekly rate simulated). If Daily Taxi, sum up.
    // For MVP: We just take the price of the "Transport" object. If it is assigned to multiple days, we assume it's a daily rate unless it says "Rental".
    let transportTotal = 0;
    
    // Check if it's a rental (one-time fee logic for MVP)
    const isRental = transport.type.includes('Rental') && transport.type.includes('Car');
    if (isRental) {
        transportTotal = transport.price;
    } else {
        // Sum up unique days used? Or just day 0? 
        // Let's sum up all mapped days for accuracy
        Object.keys(draft.transportDayMap).forEach(dayIdx => {
            const tId = draft.transportDayMap[parseInt(dayIdx)];
            const t = draft.availableTransports.find(x => x.id === tId);
            if (t) transportTotal += t.price;
        });
        // If map is empty, fallback to transport.price
        if (transportTotal === 0) transportTotal = transport.price;
    }

    const base = (flight.outbound.price * draft.travelers) + hotel.price + transportTotal + activityTotal;
    const taxes = Math.floor(base * 0.12);
    const fees = 25;

    return {
        id: `bk_${Date.now()}`,
        trip: draft.baseTrip,
        outboundFlight: flight.outbound,
        returnFlight: flight.return,
        hotel: hotel,
        transport: transport,
        pricing: {
            base,
            taxes,
            fees,
            total: base + taxes + fees,
            currency: draft.currency
        },
        travelers: draft.travelers,
        dateBooked: new Date().toISOString(),
        bookedActivities: selectedActivities,
        destinationImage: draft.baseTrip.image || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
        recommendations: [
            { type: 'tip', title: "Pack Light", description: "Weather is warm, bring linen.", icon: "🎒" },
            { type: 'info', title: "Visa", description: "No visa required for 90 days.", icon: "🛂" },
            { type: 'reminder', title: "Check-in", description: "Online check-in opens 24h prior.", icon: "📲" }
        ]
    };
};

// --- NEW HELPERS FOR STRUCTURAL UPDATES ---
export const updateDraftStructure = (draft: DraftTrip, updates: { days?: number, travelers?: number }): DraftTrip => {
    let newDraft = { ...draft };

    if (updates.travelers !== undefined) {
        newDraft.travelers = updates.travelers;
    }

    if (updates.days !== undefined) {
        const currentCount = newDraft.baseTrip.day_by_day.length;
        const targetCount = updates.days;

        if (targetCount > currentCount) {
            const newDays = [...newDraft.baseTrip.day_by_day];
            for (let i = currentCount + 1; i <= targetCount; i++) {
                newDays.push({
                    day: i,
                    title: `Day ${i} - Extra Fun`,
                    description: `Enjoy an extended stay in ${newDraft.baseTrip.destination}. Relax or find a local adventure!`
                });
            }
            newDraft.baseTrip = { ...newDraft.baseTrip, day_by_day: newDays };
        } else if (targetCount < currentCount && targetCount > 0) {
            newDraft.baseTrip = { 
                ...newDraft.baseTrip, 
                day_by_day: newDraft.baseTrip.day_by_day.slice(0, targetCount) 
            };
        }
    }

    return newDraft;
};