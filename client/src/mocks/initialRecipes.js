/**
 * initialRecipes.js
 * Mock recipe data for Assignment 3 — no HTTP calls are made to the backend.
 * Intended mapping (Assignment 2 API): GET /api/recipes returns a similar JSON shape.
 */

export const initialRecipes = [
  {
    _id: 'mock-1',
    title: 'Vegetable stir-fry',
    category: 'Quick',
    dietaryTags: 'vegan',
    prepTimeMinutes: 10,
    cookTimeMinutes: 12,
    servings: 2,
    ingredients: '200g mixed vegetables\n2 tbsp soy sauce\n1 clove garlic',
    instructions: 'Fry vegetables, add sauce, serve with rice.',
    authorUsername: 'demo_chef',
  },
  {
    _id: 'mock-2',
    title: 'Tomato pasta',
    category: 'Italian',
    dietaryTags: 'vegetarian',
    prepTimeMinutes: 5,
    cookTimeMinutes: 20,
    servings: 4,
    ingredients: '400g pasta\n400g chopped tomatoes\n1 onion',
    instructions: 'Cook pasta. Simmer sauce. Combine.',
    authorUsername: 'demo_chef',
  },
  {
    _id: 'mock-3',
    title: 'Overnight oats',
    category: 'Breakfast',
    dietaryTags: '',
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    ingredients: '50g oats\n100ml milk\nBerries',
    instructions: 'Mix and refrigerate overnight.',
    authorUsername: 'you',
  },
]
