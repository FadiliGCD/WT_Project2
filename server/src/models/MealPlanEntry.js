// One planned meal slot for a user 
const mongoose = require('mongoose');

// Allowed meal slots for validation 
const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'];

// Storing which recipe is assigned to which day/meal for a given week
const mealPlanEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    weekStart: { type: Date, required: true },
    dayIndex: { type: Number, required: true, min: 0, max: 6 },
    mealSlot: { type: String, required: true, enum: MEAL_SLOTS },
    recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
  },
  { timestamps: true }
);

mealPlanEntrySchema.index({ user: 1, weekStart: 1, dayIndex: 1, mealSlot: 1 }, { unique: true });

module.exports = mongoose.model('MealPlanEntry', mealPlanEntrySchema);
module.exports.MEAL_SLOTS = MEAL_SLOTS;
