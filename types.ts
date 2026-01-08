
export interface Ingredient {
  id: string;
  name: string;
}

export interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  difficulty: 'Facile' | 'Medio' | 'Difficile';
  calories?: string;
  imageUrl: string;
  servings: number;
}

export interface GeminiRecipeResponse {
  recipes: Recipe[];
}
