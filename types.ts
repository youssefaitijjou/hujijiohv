
export interface Ingredient {
  item: string;
  amount: string;
  unit?: string;
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Intermediate' | 'Advanced';
  nutrition: NutritionData;
  imageUrl?: string;
}

export type View = 'home' | 'generate' | 'recipe' | 'saved';
