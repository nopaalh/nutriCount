// Illustrative values per 100 g. Replace with verified food composition data from the API.
import type { Food, NutrientKey } from "../types/food.types";

export const foods: Food[] = [
  { id: 'rice', name: 'White rice, cooked', category: 'Grains & cereals', emoji: '🍚', energy: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4 },
  { id: 'chicken', name: 'Chicken breast, cooked', category: 'Meat & poultry', emoji: '🍗', energy: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  { id: 'egg', name: 'Egg, boiled', category: 'Eggs & dairy', emoji: '🥚', energy: 155, protein: 12.6, carbs: 1.1, fat: 10.6, fiber: 0 },
  { id: 'broccoli', name: 'Broccoli, cooked', category: 'Vegetables', emoji: '🥦', energy: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 3.3 },
  { id: 'banana', name: 'Banana', category: 'Fruits', emoji: '🍌', energy: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 },
  { id: 'tempeh', name: 'Tempeh', category: 'Plant proteins', emoji: '🫘', energy: 193, protein: 20.3, carbs: 7.6, fat: 10.8, fiber: 0 },
  { id: 'spinach', name: 'Spinach, cooked', category: 'Vegetables', emoji: '🥬', energy: 23, protein: 3, carbs: 3.8, fat: 0.3, fiber: 2.4 },
  { id: 'avocado', name: 'Avocado', category: 'Fruits', emoji: '🥑', energy: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7 },
];
export const nutrientRows: [NutrientKey, string, string][] = [
  ['energy', 'Energy', 'kcal'], ['water', 'Water', 'g'], ['protein', 'Protein', 'g'],
  ['fat', 'Total fat', 'g'], ['carbs', 'Carbohydrate', 'g'], ['fiber', 'Fiber', 'g'], ['ash', 'Ash', 'g'],
  ['calcium', 'Calcium', 'mg'], ['phosphorus', 'Phosphorus', 'mg'], ['iron', 'Iron', 'mg'],
  ['sodium', 'Sodium', 'mg'], ['potassium', 'Potassium', 'mg'], ['copper', 'Copper', 'mg'], ['zinc', 'Zinc', 'mg'],
  ['retinol', 'Retinol', 'µg'], ['betaCarotene', 'Beta carotene', 'µg'], ['totalCarotene', 'Total carotene', 'µg'],
  ['thiamin', 'Thiamin', 'mg'], ['riboflavin', 'Riboflavin', 'mg'], ['niacin', 'Niacin', 'mg'], ['vitaminC', 'Vitamin C', 'mg'],
];
