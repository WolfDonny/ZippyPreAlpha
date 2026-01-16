import React, { useState } from 'react';
import { TravelProfile } from '../types';
import { generateTravelDNA } from '../services/geminiService';

interface OnboardingFlowProps {
  onComplete: (profile: TravelProfile) => void;
  onCancel: () => void;
  initialData?: TravelProfile | null;
  language?: string;
}

// UI Translations
const UI_TEXT: Record<string, { close: string, analyzing: string, calculating: string, footer: string, header: string }> = {
    'English': {
        header: 'Travel DNA 🧬',
        close: 'Close',
        analyzing: 'DNA Analysis in progress...',
        calculating: 'Zippy is calculating your spirit animal!',
        footer: "Answer instinctively! Don't overthink it. 😉"
    },
    'Italiano': {
        header: 'Travel DNA 🧬',
        close: 'Chiudi',
        analyzing: 'Analisi DNA in corso...',
        calculating: 'Zippy sta calcolando il tuo spirito guida!',
        footer: "Rispondi d'istinto! Non pensarci troppo. 😉"
    },
    'Español': {
        header: 'ADN Viajero 🧬',
        close: 'Cerrar',
        analyzing: 'Análisis de ADN en curso...',
        calculating: '¡Zippy está calculando tu espíritu animal!',
        footer: "¡Responde instintivamente! No lo pienses mucho. 😉"
    },
    'Français': {
        header: 'ADN Voyage 🧬',
        close: 'Fermer',
        analyzing: 'Analyse ADN en cours...',
        calculating: 'Zippy calcule votre animal spirituel !',
        footer: "Répondez instinctivement ! Ne réfléchissez pas trop. 😉"
    },
    'Deutsch': {
        header: 'Reise-DNA 🧬',
        close: 'Schließen',
        analyzing: 'DNA-Analyse läuft...',
        calculating: 'Zippy berechnet dein Krafttier!',
        footer: "Antworte instinktiv! Nicht zu viel nachdenken. 😉"
    }
};

interface Question {
    id: string;
    question: string;
    options: string[];
    categoryMapping: string[];
}

const QUESTIONS_DB: Record<string, Question[]> = {
    'Italiano': [
        {
            id: 'q1',
            question: "Quando pensi al prossimo viaggio, cosa ti fa brillare gli occhi?",
            options: [
            'Una spiaggia bianca e un mojito',
            'Un trekking vista WOW',
            'Perdermi tra vicoli e musei',
            'Mercati locali e odori che non dimentichi',
            'Un posto strano che nessuno conosce'
            ],
            categoryMapping: ['Relax', 'Adventure', 'Culture', 'Food', 'Unique']
        },
        {
            id: 'q2',
            question: "Il tuo spirito guida in viaggio è…",
            options: [
            'Il bradipo (rilassato e pacifico)',
            'La capra di montagna (scalo ovunque)',
            'Il gufo (osservo, imparo, scopro)',
            'Il panda affamato (cibo = felicità)',
            'Il camaleonte (mi adatto e cerco l’insolito)'
            ],
            categoryMapping: ['Relax', 'Adventure', 'Culture', 'Food', 'Unique']
        },
        {
            id: 'q3',
            question: "La tua frase tipo quando ti propongono una meta è:",
            options: [
            '“Basta che posso stendermi al sole!”',
            '“Ci sono sentieri o cose avventurose?”',
            '“Ha una storia interessante?”',
            '“Che si mangia lì?”',
            '“È fuori dai soliti giri?”'
            ],
            categoryMapping: ['Relax', 'Adventure', 'Culture', 'Food', 'Unique']
        },
        {
            id: 'q4',
            question: "Come ti piace viaggiare?",
            options: [
            'Pianifico tutto',
            'Parto e poi vediamo',
            'On the road',
            'Comodo e coccolato',
            'Zaino in spalla'
            ],
            categoryMapping: ['Culture', 'Unique', 'Adventure', 'Relax', 'Adventure']
        },
        {
            id: 'q5',
            question: "L’attività che non può mancare:",
            options: [
            'Mare-relax',
            'Trekking / sport',
            'Musei / visite / cultura',
            'Street food / ristoranti',
            'Esperienze strane o locali autentiche'
            ],
            categoryMapping: ['Relax', 'Adventure', 'Culture', 'Food', 'Unique']
        },
        {
            id: 'q6',
            question: "La tua valigia ideale è…",
            options: [
            'Leggerissima: costume, ciabatte, finito',
            'Zaino tecnico da montagna',
            'Trolley ordinatissimo',
            'Mezzo vuoto: devo lasciar spazio al cibo da riportare',
            'Qualsiasi cosa, basta che ci siano scarpe comode e adattabili'
            ],
            categoryMapping: ['Relax', 'Adventure', 'Culture', 'Food', 'Unique']
        },
        {
            id: 'q7',
            question: "La tua serata tipo in viaggio è…",
            options: [
            'Tramonto, relax, magari un cocktail',
            'A dormire presto per l’escursione del giorno dopo',
            'Una passeggiata culturale serale',
            'Esplorazione culinaria fino a trovare “quel posto perfetto”',
            'Vagare senza meta finché non trovo qualcosa di strano e bellissimo'
            ],
            categoryMapping: ['Relax', 'Adventure', 'Culture', 'Food', 'Unique']
        }
    ],
    'English': [
        {
            id: 'q1',
            question: "When you think about your next trip, what makes your eyes sparkle?",
            options: [
            'A white beach and a mojito',
            'A hiking trail with WOW views',
            'Getting lost in alleys and museums',
            'Local markets and unforgettable scents',
            'A strange place nobody knows'
            ],
            categoryMapping: ['Relax', 'Adventure', 'Culture', 'Food', 'Unique']
        },
        {
            id: 'q2',
            question: "Your travel spirit animal is...",
            options: [
            'The Sloth (relaxed and peaceful)',
            'The Mountain Goat (I climb everything)',
            'The Owl (I observe, learn, discover)',
            'The Hungry Panda (food = happiness)',
            'The Chameleon (I adapt and seek the unusual)'
            ],
            categoryMapping: ['Relax', 'Adventure', 'Culture', 'Food', 'Unique']
        },
        {
            id: 'q3',
            question: "Your catchphrase when someone suggests a destination:",
            options: [
            '"As long as I can lie in the sun!"',
            '"Are there trails or adventurous things?"',
            '"Does it have interesting history?"',
            '"What do we eat there?"',
            '"Is it off the beaten path?"'
            ],
            categoryMapping: ['Relax', 'Adventure', 'Culture', 'Food', 'Unique']
        },
        {
            id: 'q4',
            question: "How do you like to travel?",
            options: [
            'I plan everything',
            'I go and see what happens',
            'On the road',
            'Comfortable and pampered',
            'Backpack style'
            ],
            categoryMapping: ['Culture', 'Unique', 'Adventure', 'Relax', 'Adventure']
        },
        {
            id: 'q5',
            question: "The activity that cannot be missed:",
            options: [
            'Sea & Relax',
            'Trekking / Sport',
            'Museums / Culture',
            'Street food / Restaurants',
            'Strange or authentic local experiences'
            ],
            categoryMapping: ['Relax', 'Adventure', 'Culture', 'Food', 'Unique']
        },
        {
            id: 'q6',
            question: "Your ideal suitcase is...",
            options: [
            'Super light: swimsuit, flip-flops, done',
            'Technical mountain backpack',
            'Perfectly organized trolley',
            'Half empty: need space for food souvenirs',
            'Anything, as long as there are comfy shoes'
            ],
            categoryMapping: ['Relax', 'Adventure', 'Culture', 'Food', 'Unique']
        },
        {
            id: 'q7',
            question: "Your typical night out while traveling...",
            options: [
            'Sunset, relax, maybe a cocktail',
            'Early to bed for tomorrow\'s hike',
            'An evening cultural walk',
            'Culinary exploration finding "that perfect spot"',
            'Wandering aimlessly finding something weird and beautiful'
            ],
            categoryMapping: ['Relax', 'Adventure', 'Culture', 'Food', 'Unique']
        }
    ]
};

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onCancel, initialData, language = 'English' }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<{question: string, answer: string, category: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Select questions based on language, default to English
  const questions = QUESTIONS_DB[language] || QUESTIONS_DB['English'];
  const text = UI_TEXT[language] || UI_TEXT['English'];

  const handleSelect = (option: string, category: string) => {
    const currentQ = questions[step];
    const newAnswers = [...answers, { question: currentQ.question, answer: option, category }];
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 250);
    } else {
      finishFlow(newAnswers);
    }
  };

  const finishFlow = async (finalAnswers: {question: string, answer: string, category: string}[]) => {
    setIsGenerating(true);

    // 1. Calculate Standard Profile Fields Heuristically
    const categoryCounts: Record<string, number> = {};
    finalAnswers.forEach(a => {
        categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    });

    const dominantCategory = Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b);

    // Basic mapping to required TravelProfile types
    let mappedInterests = ['Hidden Gems'];
    let mappedPace: 'Relaxed' | 'Balanced' | 'Fast-Paced' = 'Balanced';
    let mappedAccommodation: 'Standard Hotel' | 'Boutique/Charm' | 'Resort/Luxury' | 'Apartment' = 'Boutique/Charm';
    
    if (dominantCategory === 'Relax') {
        mappedInterests = ['Beaches', 'Wellness', 'Slow Travel'];
        mappedPace = 'Relaxed';
        mappedAccommodation = 'Resort/Luxury';
    } else if (dominantCategory === 'Adventure') {
        mappedInterests = ['Nature', 'Hiking', 'Adventure'];
        mappedPace = 'Fast-Paced';
        mappedAccommodation = 'Apartment';
    } else if (dominantCategory === 'Culture') {
        mappedInterests = ['History', 'Art', 'Architecture'];
        mappedPace = 'Balanced';
        mappedAccommodation = 'Standard Hotel';
    } else if (dominantCategory === 'Food') {
        mappedInterests = ['Food & Wine', 'Cooking Classes', 'Markets'];
        mappedPace = 'Balanced';
        mappedAccommodation = 'Boutique/Charm';
    } else if (dominantCategory === 'Unique') {
        mappedInterests = ['Hidden Gems', 'Local Life', 'Off-path'];
        mappedPace = 'Balanced';
        mappedAccommodation = 'Apartment';
    }

    // 2. Generate DNA with AI (Pass language to service)
    const dna = await generateTravelDNA(finalAnswers.map(a => ({ question: a.question, answer: a.answer })), language);

    const profile: TravelProfile = {
        budget: 'Medium', // Defaulting since strictly explicit budget wasn't asked
        interests: mappedInterests,
        pace: mappedPace,
        accommodation: mappedAccommodation,
        climate: 'Any',
        duration: '4-7 Days',
        priority: dominantCategory === 'Relax' ? 'Comfort' : 'Unique Experiences',
        dna: {
            nickname: dna.nickname,
            description: dna.description,
            dominantStyle: dna.dominantStyle
        }
    };

    setIsGenerating(false);
    onComplete(profile);
  };

  const progress = ((step + 1) / questions.length) * 100;
  const currentQ = questions[step];

  if (isGenerating) {
      return (
          <div className="fixed inset-0 z-[70] bg-white flex flex-col items-center justify-center animate-fade-in text-center p-8">
              <div className="w-24 h-24 bg-zippy-100 rounded-full flex items-center justify-center text-4xl mb-6 animate-bounce-soft">
                  🧬
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">{text.analyzing}</h2>
              <p className="text-gray-500">{text.calculating}</p>
              <div className="mt-8 flex gap-2">
                  <div className="w-3 h-3 bg-zippy-400 rounded-full typing-dot"></div>
                  <div className="w-3 h-3 bg-zippy-500 rounded-full typing-dot"></div>
                  <div className="w-3 h-3 bg-zippy-600 rounded-full typing-dot"></div>
              </div>
          </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[70] bg-white flex flex-col animate-fade-in font-sans">
      {/* Header */}
      <div className="px-6 py-6 flex justify-between items-center border-b border-gray-100 bg-white sticky top-0 z-10">
        <button onClick={onCancel} className="text-gray-400 font-bold text-sm hover:text-gray-600">{text.close}</button>
        <span className="font-display font-bold text-gray-800 text-lg">{text.header}</span>
        <span className="text-zippy-500 font-mono font-bold text-sm">{step + 1}/{questions.length}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-gray-100">
        <div 
          className="h-full bg-gradient-to-r from-zippy-400 to-zippy-600 transition-all duration-500 ease-out rounded-r-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="flex-1 overflow-y-auto bg-slate-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-800 mb-8 text-center animate-scale-up leading-tight">
            {currentQ.question}
            </h2>

            <div className="grid gap-3">
            {currentQ.options.map((opt, idx) => {
                const category = currentQ.categoryMapping[idx];
                return (
                <button
                    key={idx}
                    onClick={() => handleSelect(opt, category)}
                    className="group bg-white p-5 rounded-2xl shadow-sm border-2 border-transparent hover:border-zippy-400 hover:shadow-lg transition-all duration-200 text-left flex items-center justify-between active:scale-95"
                >
                    <span className="font-medium text-gray-700 group-hover:text-gray-900 text-lg">{opt}</span>
                    <span className="opacity-0 group-hover:opacity-100 text-zippy-500 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-200">➜</span>
                </button>
                );
            })}
            </div>
        </div>
      </div>
      
      {/* Footer Hint */}
      <div className="p-4 text-center text-xs text-gray-400 bg-white border-t border-gray-100">
          {text.footer}
      </div>
    </div>
  );
};

export default OnboardingFlow;