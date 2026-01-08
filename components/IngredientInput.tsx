
import React, { useState, KeyboardEvent } from 'react';
import { Ingredient } from '../types';

interface IngredientInputProps {
  ingredients: Ingredient[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

const IngredientInput: React.FC<IngredientInputProps> = ({ ingredients, onAdd, onRemove, onClear }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Aggiungi ingrediente (es. Uova, Farina...)"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
          />
        </div>
        <button
          onClick={handleAdd}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors duration-200 shadow-md flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Aggiungi
        </button>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[40px]">
        {ingredients.map((ing) => (
          <span
            key={ing.id}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full text-sm font-medium animate-in fade-in zoom-in duration-200"
          >
            {ing.name}
            <button
              onClick={() => onRemove(ing.id)}
              className="hover:text-orange-600 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </span>
        ))}
        {ingredients.length > 0 && (
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-red-500 text-sm font-medium transition-colors"
          >
            Svuota tutto
          </button>
        )}
      </div>
    </div>
  );
};

export default IngredientInput;
