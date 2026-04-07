// Create, browse, profile collection
const mongoose = require('mongoose');

// Owned by 1 user supporting CRUD with checks
const recipeSchema = new mongoose.Schema(
  {
    // Reference to User who created the recipe
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    instructions: { type: String, required: true, trim: true, maxlength: 20000 },
    category: { type: String, trim: true, maxlength: 80, default: 'General' },
    dietaryTags: { type: String, trim: true, maxlength: 200, default: '' },
    prepTimeMinutes: { type: Number, min: 0, max: 10080, default: 0 },
    cookTimeMinutes: { type: Number, min: 0, max: 10080, default: 0 },
    servings: { type: Number, min: 1, max: 500, default: 4 },
  },
  { timestamps: true }
);

recipeSchema.index({ title: 'text', ingredients: 'text', category: 1 });

module.exports = mongoose.model('Recipe', recipeSchema);
