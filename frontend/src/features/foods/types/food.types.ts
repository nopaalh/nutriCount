export type NutrientKey = 'energy' | 'water' | 'protein' | 'fat' | 'carbs' | 'fiber' | 'ash' | 'calcium' | 'phosphorus' | 'iron' | 'sodium' | 'potassium' | 'copper' | 'zinc' | 'retinol' | 'betaCarotene' | 'totalCarotene' | 'thiamin' | 'riboflavin' | 'niacin' | 'vitaminC';
export type Food = { id: string; name: string; category: string; emoji: string; energy: number; protein: number; carbs: number; fat: number; fiber: number } & Partial<Record<NutrientKey, number>>;
export type SelectedFood = Food & { weight: number | '' };
