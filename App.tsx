
import React, { useState, useEffect, useCallback } from 'react';
import { ChefHat, Search, Sparkles, Heart, Clock, Utensils, BookOpen, ChevronLeft, Loader2, ArrowRight } from 'lucide-react';
import { Recipe, View } from './types';
import { generateRecipe, generateFoodImage } from './services/geminiService';
import NutritionChart from './components/NutritionChart';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('roset_saved');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('roset_saved', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setLoadingStep('Architecting the flavors...');
    try {
      const recipe = await generateRecipe(query);
      setLoadingStep('Capturing the vision...');
      const imageUrl = await generateFoodImage(recipe.title);
      
      const completeRecipe = { ...recipe, imageUrl: imageUrl || `https://picsum.photos/seed/${recipe.id}/1200/800` };
      setSelectedRecipe(completeRecipe);
      setView('recipe');
    } catch (error) {
      console.error(error);
      alert('The culinary stars did not align. Please try another concept.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const toggleSave = (recipe: Recipe) => {
    setSavedRecipes(prev => {
      const exists = prev.find(r => r.id === recipe.id);
      if (exists) return prev.filter(r => r.id !== recipe.id);
      return [...prev, recipe];
    });
  };

  const isSaved = (recipeId: string) => savedRecipes.some(r => r.id === recipeId);

  return (
    <div className="min-h-screen pb-24">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setView('home')}
          >
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200 group-hover:scale-105 transition-transform">
              <ChefHat size={24} />
            </div>
            <span className="text-2xl font-serif tracking-tight text-stone-900">Roset</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setView('home')}
              className={`text-sm font-medium transition-colors ${view === 'home' ? 'text-orange-600' : 'text-stone-500 hover:text-stone-900'}`}
            >
              Explore
            </button>
            <button 
              onClick={() => setView('saved')}
              className={`text-sm font-medium transition-colors ${view === 'saved' ? 'text-orange-600' : 'text-stone-500 hover:text-stone-900'}`}
            >
              Collection
            </button>
          </nav>

          <button 
            onClick={() => setView('generate')}
            className="bg-stone-900 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-stone-800 transition-all shadow-md active:scale-95"
          >
            <Sparkles size={16} />
            Magic Recipe
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-stone-100 border-t-orange-500 rounded-full animate-spin"></div>
              <ChefHat className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500" size={32} />
            </div>
            <h2 className="mt-8 text-2xl font-serif text-stone-900">{loadingStep}</h2>
            <p className="mt-2 text-stone-500 max-w-xs">Crafting every detail of your unique culinary experience.</p>
          </div>
        )}

        {/* Home View */}
        {view === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center py-12 md:py-20 max-w-3xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-serif text-stone-900 mb-6">Elevate your daily dining.</h1>
              <p className="text-lg text-stone-600 mb-10 leading-relaxed">
                Describe a feeling, a set of ingredients, or a cuisine. 
                Our AI Culinary Architect will design the perfect dish just for you.
              </p>
              
              <div className="relative max-w-2xl mx-auto">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-stone-400">
                  <Search size={20} />
                </div>
                <input 
                  type="text" 
                  placeholder="e.g., 'A light Mediterranean lunch with artichokes and lemon'"
                  className="w-full pl-12 pr-4 py-5 bg-white border border-stone-200 rounded-3xl shadow-xl shadow-stone-200/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-lg"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button 
                  onClick={() => handleGenerate()}
                  className="absolute right-3 top-3 bottom-3 bg-orange-500 text-white px-6 rounded-2xl hover:bg-orange-600 transition-colors flex items-center gap-2 font-medium"
                >
                  Generate
                </button>
              </div>
            </div>

            <section className="mt-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-serif text-stone-900">Featured Rosets</h2>
                <div className="flex gap-2">
                  {['Latest', 'Seasonal', 'Healthy'].map(filter => (
                    <button key={filter} className="px-4 py-2 rounded-full border border-stone-200 text-sm hover:bg-stone-50 transition-colors">
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { id: '1', title: 'Smoked Salmon Carpaccio', desc: 'Thin slices of premium salmon with caper berries and dill oil.', img: 'https://picsum.photos/seed/salmon/600/400', time: '15m' },
                  { id: '2', title: 'Truffle Mushroom Risotto', desc: 'Arborio rice slowly cooked with wild mushrooms and black truffle.', img: 'https://picsum.photos/seed/risotto/600/400', time: '45m' },
                  { id: '3', title: 'Honey Glazed Duck Breast', desc: 'Pan-seared duck with a sweet citrus glaze and microgreens.', img: 'https://picsum.photos/seed/duck/600/400', time: '35m' },
                ].map(item => (
                  <div key={item.id} className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="relative h-64 overflow-hidden">
                      <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-xl shadow-sm">
                        <Heart className="text-stone-300 hover:text-red-500 transition-colors" size={20} />
                      </div>
                      <div className="absolute bottom-4 left-4 bg-stone-900/80 backdrop-blur text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1">
                        <Clock size={12} /> {item.time}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-serif text-stone-900 mb-2">{item.title}</h3>
                      <p className="text-stone-500 text-sm line-clamp-2">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Generate View (Focused) */}
        {view === 'generate' && (
          <div className="max-w-2xl mx-auto py-12 animate-in slide-in-from-top-4 duration-500">
            <button 
              onClick={() => setView('home')}
              className="flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-8 transition-colors"
            >
              <ChevronLeft size={20} /> Back to explore
            </button>
            <h1 className="text-4xl font-serif text-stone-900 mb-2">What's on your mind?</h1>
            <p className="text-stone-500 mb-8">Tell Roset about ingredients, dietary needs, or even a mood.</p>
            
            <form onSubmit={handleGenerate} className="space-y-6">
              <textarea 
                rows={6}
                placeholder="Describe your perfect dish... (e.g., I have some ribeye steak, rosemary, and I want something bold but easy for a Friday night)"
                className="w-full p-6 bg-white border border-stone-200 rounded-3xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-lg resize-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-stone-100 flex items-center justify-between cursor-pointer hover:border-orange-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <Utensils className="text-orange-500" size={20} />
                    <span className="text-sm font-medium">Difficulty</span>
                  </div>
                  <span className="text-xs text-stone-400">All Levels</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-100 flex items-center justify-between cursor-pointer hover:border-orange-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <BookOpen className="text-orange-500" size={20} />
                    <span className="text-sm font-medium">Cuisine</span>
                  </div>
                  <span className="text-xs text-stone-400">Any</span>
                </div>
              </div>
              <button 
                type="submit"
                disabled={!query.trim()}
                className="w-full bg-stone-900 text-white py-5 rounded-3xl text-xl font-medium flex items-center justify-center gap-3 hover:bg-stone-800 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Sparkles size={24} />
                Generate My Roset
              </button>
            </form>
          </div>
        )}

        {/* Recipe Detail View */}
        {view === 'recipe' && selectedRecipe && (
          <div className="animate-in fade-in duration-500">
            <button 
              onClick={() => setView('home')}
              className="flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-8 transition-colors"
            >
              <ChevronLeft size={20} /> Back to discovery
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Column: Info & Ingredients */}
              <div className="lg:col-span-8 space-y-12">
                <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src={selectedRecipe.imageUrl} 
                    alt={selectedRecipe.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent"></div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">{selectedRecipe.title}</h1>
                    <div className="flex flex-wrap gap-4">
                      <div className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                        <Clock size={16} /> Prep: {selectedRecipe.prepTime}
                      </div>
                      <div className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                        <Utensils size={16} /> Cook: {selectedRecipe.cookTime}
                      </div>
                      <div className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                        <Heart size={16} /> {selectedRecipe.difficulty}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleSave(selectedRecipe)}
                    className={`absolute top-8 right-8 p-4 rounded-2xl shadow-lg transition-all active:scale-90 ${isSaved(selectedRecipe.id) ? 'bg-orange-500 text-white' : 'bg-white text-stone-900 hover:bg-stone-50'}`}
                  >
                    <Heart fill={isSaved(selectedRecipe.id) ? "white" : "none"} size={24} />
                  </button>
                </div>

                <div>
                  <h2 className="text-3xl font-serif text-stone-900 mb-6">About this creation</h2>
                  <p className="text-lg text-stone-600 leading-relaxed italic border-l-4 border-orange-500 pl-6">
                    {selectedRecipe.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-xl font-serif text-stone-900 mb-6 flex items-center gap-2">
                      <Utensils size={20} className="text-orange-500" />
                      Ingredients
                    </h3>
                    <ul className="space-y-4">
                      {selectedRecipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-center gap-4 group">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-200 group-hover:bg-orange-500 transition-colors"></div>
                          <span className="text-stone-700 font-medium w-24">{ing.amount} {ing.unit}</span>
                          <span className="text-stone-500">{ing.item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-stone-900 mb-6 flex items-center gap-2">
                      <Sparkles size={20} className="text-orange-500" />
                      Chef's Notes
                    </h3>
                    <div className="bg-stone-100 rounded-2xl p-6 text-sm text-stone-600 leading-relaxed">
                      This recipe was architected with balanced flavors in mind. For best results, ensure all ingredients are at room temperature before starting.
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-serif text-stone-900 mb-8">Preparation Steps</h3>
                  <div className="space-y-8">
                    {selectedRecipe.instructions.map((step, i) => (
                      <div key={i} className="flex gap-6 group">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 font-bold group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                          {i + 1}
                        </div>
                        <div className="pt-2">
                          <p className="text-lg text-stone-700 leading-relaxed">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Sidebar */}
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-xl shadow-stone-200/50 sticky top-24">
                  <h3 className="text-xl font-serif text-stone-900 mb-6">Nutrition Profile</h3>
                  <div className="mb-8">
                    <NutritionChart data={selectedRecipe.nutrition} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-stone-50 p-4 rounded-2xl text-center">
                      <span className="block text-2xl font-bold text-stone-900">{selectedRecipe.nutrition.calories}</span>
                      <span className="text-xs text-stone-500 uppercase tracking-widest">Calories</span>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-2xl text-center">
                      <span className="block text-2xl font-bold text-stone-900">{selectedRecipe.nutrition.protein}g</span>
                      <span className="text-xs text-stone-500 uppercase tracking-widest">Protein</span>
                    </div>
                  </div>

                  <button className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-100">
                    <ArrowRight size={20} /> Add to Meal Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Saved View */}
        {view === 'saved' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-serif text-stone-900 mb-8">Your Collection</h1>
            {savedRecipes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200">
                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="text-stone-300" size={32} />
                </div>
                <h3 className="text-xl font-serif text-stone-900 mb-2">No saved recipes yet</h3>
                <p className="text-stone-500 mb-8">Start exploring and save the ones that catch your eye.</p>
                <button 
                  onClick={() => setView('home')}
                  className="bg-orange-500 text-white px-8 py-3 rounded-full font-medium hover:bg-orange-600 transition-all"
                >
                  Explore Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {savedRecipes.map(recipe => (
                  <div 
                    key={recipe.id} 
                    className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300"
                    onClick={() => {
                      setSelectedRecipe(recipe);
                      setView('recipe');
                    }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-4 right-4 bg-orange-500 text-white p-2 rounded-xl shadow-sm">
                        <Heart fill="white" size={18} />
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-serif text-stone-900 mb-2 line-clamp-1">{recipe.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-stone-400 uppercase tracking-widest font-bold">
                        <span>{recipe.prepTime}</span>
                        <span>•</span>
                        <span>{recipe.difficulty}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action for Mobile */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 md:hidden z-40">
        <div className="bg-stone-900 text-white p-2 rounded-full flex items-center gap-1 shadow-2xl">
          <button 
            onClick={() => setView('home')}
            className={`p-3 rounded-full ${view === 'home' ? 'bg-orange-500' : ''}`}
          >
            <Search size={20} />
          </button>
          <button 
            onClick={() => setView('generate')}
            className={`p-3 rounded-full ${view === 'generate' ? 'bg-orange-500' : ''}`}
          >
            <Sparkles size={20} />
          </button>
          <button 
            onClick={() => setView('saved')}
            className={`p-3 rounded-full ${view === 'saved' ? 'bg-orange-500' : ''}`}
          >
            <Heart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
