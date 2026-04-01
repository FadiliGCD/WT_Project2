const mongoose = require("mongoose");

const mealPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    weekStart: { type: Date, required: true },
    meals: [
      {
        day: {
          type: String,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          required: true,
        },
        mealType: {
          type: String,
          enum: ["breakfast", "lunch", "dinner", "snack"],
          required: true,
        },
        recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("MealPlan", mealPlanSchema);
