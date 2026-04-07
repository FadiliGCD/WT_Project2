// Linking a user to a saved recipe
const mongoose = require('mongoose');

// One row per user recipe pair which prevents duplicate saves
const favouriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
  },
  { timestamps: true }
);

favouriteSchema.index({ user: 1, recipe: 1 }, { unique: true });

module.exports = mongoose.model('Favourite', favouriteSchema);
