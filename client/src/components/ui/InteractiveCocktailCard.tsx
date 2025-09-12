// client/src/components/ui/InteractiveCocktailCard.tsx
import React, { useState } from 'react';

interface CocktailData {
  name: string;
  shortDesc: string;
  price: string;
  image: string;
  ingredients: string[];
  description: string;
}

interface InteractiveCocktailCardProps {
  cocktail: CocktailData;
}

export const InteractiveCocktailCard: React.FC<InteractiveCocktailCardProps> = ({ cocktail }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <div 
      className="relative h-80 w-64 perspective-1000 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front */}
        <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden">
          <div className="relative h-full bg-gradient-to-br from-green-800 to-green-900">
            <div className="absolute inset-0 bg-black/20" />
            <img 
              src={cocktail.image} 
              alt={cocktail.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6 text-white">
              <h3 className="text-xl font-bold mb-2">{cocktail.name}</h3>
              <p className="text-green-100 text-sm">{cocktail.shortDesc}</p>
              <div className="mt-4 text-2xl font-bold">{cocktail.price}</div>
            </div>
            <div className="absolute bottom-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">↻</span>
            </div>
          </div>
        </div>
        
        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl overflow-hidden">
          <div className="h-full bg-gradient-to-br from-stone-900 to-black p-6 text-white">
            <h3 className="text-xl font-bold mb-4 text-green-400">{cocktail.name}</h3>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="text-green-300 font-semibold">Ingredients:</span>
                <ul className="mt-2 space-y-1">
                  {cocktail.ingredients.map((ingredient, i) => (
                    <li key={i} className="text-gray-300 flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-xs text-gray-400 italic">
                {cocktail.description}
              </div>
            </div>
            <button className="absolute bottom-4 left-4 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-full text-sm transition-colors">
              Order Now
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};