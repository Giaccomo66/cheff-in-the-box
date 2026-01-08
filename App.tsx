
import React, { useState, useCallback } from 'react';
import { Ingredient, Recipe } from './types';
import { getRecipesFromIngredients, identifyIngredientsFromImage } from './services/geminiService';
import IngredientInput from './components/IngredientInput';
import RecipeCard from './components/RecipeCard';
import RecipeModal from './components/RecipeModal';
import CameraModal from './components/CameraModal';

const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [servings, setServings] = useState<number>(2);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const addIngredient = (name: string) => {
    if (ingredients.some(i => i.name.toLowerCase() === name.toLowerCase())) return;
    const newIngredient: Ingredient = {
      id: Math.random().toString(36).substr(2, 9),
      name,
    };
    setIngredients(prev => [...prev, newIngredient]);
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(i => i.id !== id));
  };

  const clearIngredients = () => {
    setIngredients([]);
  };

  const handleCapture = async (base64: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const detected = await identifyIngredientsFromImage(base64, 'image/jpeg');
      detected.forEach(name => addIngredient(name));
    } catch (err) {
      setError("Errore durante l'analisi dell'immagine. Riprova.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateRecipes = async () => {
    if (ingredients.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const ingredientNames = ingredients.map(i => i.name);
      const suggestedRecipes = await getRecipesFromIngredients(ingredientNames, servings);
      setRecipes(suggestedRecipes);
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError("Ops! Qualcosa è andato storto nella generazione delle ricette. Riprova.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateServings = (val: number) => {
    const newVal = Math.max(1, Math.min(12, servings + val));
    setServings(newVal);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-200">
      {/* Hero Section */}
      <header className="relative bg-white overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-20 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider mb-6 animate-bounce">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Alimentato da AI Vision
            </div>
            <h1 className="text-5xl sm:text-7xl font-black text-gray-900 mb-6 tracking-tight">
              Chef<span className="text-orange-600">InBox</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Hai ingredienti in frigo? Scatta una foto o scrivili qui sotto. Lo Chef adatterà le dosi per te!
            </p>
            
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2 mb-6 justify-center">
                <button
                  onClick={() => setShowCamera(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-orange-600 text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-all shadow-md group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Scatta Foto
                </button>
              </div>

              <IngredientInput 
                ingredients={ingredients} 
                onAdd={addIngredient} 
                onRemove={removeIngredient}
                onClear={clearIngredients}
              />

              {/* Selettore Persone */}
              <div className="mt-8 flex flex-col items-center gap-3">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Cucina per:</label>
                <div className="flex items-center bg-white border-2 border-gray-100 rounded-2xl p-2 shadow-sm">
                  <button 
                    onClick={() => updateServings(-1)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <div className="px-8 flex items-center gap-2">
                    <span className="text-2xl font-black text-gray-900">{servings}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <button 
                    onClick={() => updateServings(1)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {isAnalyzing && (
                <div className="mt-4 flex items-center justify-center gap-2 text-orange-600 font-medium animate-pulse">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sto analizzando la foto...
                </div>
              )}
              
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleGenerateRecipes}
                  disabled={ingredients.length === 0 || isLoading || isAnalyzing}
                  className={`
                    px-10 py-4 rounded-2xl text-lg font-black transition-all duration-300 shadow-xl
                    ${ingredients.length === 0 || isLoading || isAnalyzing
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-orange-600 hover:bg-orange-700 text-white hover:-translate-y-1 active:scale-95'}
                  `}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-3">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sto adattando le ricette...
                    </span>
                  ) : 'Suggeriscimi Ricette'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Results Section */}
      <main id="results" className="max-w-6xl mx-auto px-4 py-16">
        {error && (
          <div className="mb-12 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-center">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100">
                <div className="h-2/3 bg-gray-100 rounded-t-2xl"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-50 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Le tue Ricette</h2>
                <p className="text-gray-500">Abbiamo trovato {recipes.length} piatti personalizzati per {servings} persone</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recipes.map((recipe, idx) => (
                <RecipeCard 
                  key={idx} 
                  recipe={recipe} 
                  onClick={() => setSelectedRecipe(recipe)} 
                />
              ))}
            </div>
          </div>
        ) : !isLoading && ingredients.length > 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="text-4xl mb-4">🍳</div>
            <h3 className="text-xl font-bold text-gray-900">Pronto per iniziare</h3>
            <p className="text-gray-500">Scegli per quante persone e clicca su "Suggeriscimi Ricette".</p>
          </div>
        )}
      </main>

      {/* Modals */}
      <RecipeModal 
        recipe={selectedRecipe} 
        onClose={() => setSelectedRecipe(null)} 
      />
      
      {showCamera && (
        <CameraModal 
          onCapture={handleCapture} 
          onClose={() => setShowCamera(false)} 
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm font-medium">
            © 2024 ChefInBox. Made with ✨ and AI Vision.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
