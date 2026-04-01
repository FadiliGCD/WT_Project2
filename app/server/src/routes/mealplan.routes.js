const express = require("express");
const rateLimit = require("express-rate-limit");
const MealPlan = require("../models/MealPlan");
const Recipe = require("../models/Recipe");
const auth = require("../middleware/auth");

const router = express.Router();

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

// All meal plan routes require authentication and rate limiting
router.use(limiter);
router.use(auth);

// GET /api/mealplan – list all meal plans for the logged-in user
router.get("/", async (req, res) => {
  try {
    const mealPlans = await MealPlan.find({ userId: req.user.userId })
      .populate("meals.recipe", "title description")
      .sort({ weekStart: -1 });
    res.json({ mealPlans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/mealplan – create a new meal plan
router.post("/", async (req, res) => {
  try {
    const weekStart = req.body.weekStart;

    if (!weekStart) return res.status(400).json({ message: "Week start date is required" });

    const sanitizedMeals = Array.isArray(req.body.meals)
      ? req.body.meals.map((m) => ({
          day: typeof m.day === "string" ? m.day : "",
          mealType: typeof m.mealType === "string" ? m.mealType : "",
          recipe: typeof m.recipe === "string" ? m.recipe : String(m.recipe),
        }))
      : [];

    if (sanitizedMeals.length > 0) {
      const recipeIds = sanitizedMeals.map((m) => m.recipe);
      const found = await Recipe.countDocuments({ _id: { $in: recipeIds }, userId: req.user.userId });
      if (found !== recipeIds.length)
        return res.status(400).json({ message: "One or more recipe IDs are invalid" });
    }

    const mealPlan = await MealPlan.create({
      userId: req.user.userId,
      weekStart,
      meals: sanitizedMeals,
    });

    res.status(201).json({ mealPlan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/mealplan/:id – get a single meal plan
router.get("/:id", async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOne({ _id: req.params.id, userId: req.user.userId }).populate(
      "meals.recipe",
      "title description"
    );
    if (!mealPlan) return res.status(404).json({ message: "Meal plan not found" });
    res.json({ mealPlan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/mealplan/:id – update a meal plan
router.put("/:id", async (req, res) => {
  try {
    const parsedWeekStart = req.body.weekStart ? new Date(req.body.weekStart) : undefined;
    const weekStart = parsedWeekStart && !isNaN(parsedWeekStart) ? parsedWeekStart : undefined;
    const sanitizedMeals = Array.isArray(req.body.meals)
      ? req.body.meals.map((m) => ({
          day: typeof m.day === "string" ? m.day : "",
          mealType: typeof m.mealType === "string" ? m.mealType : "",
          recipe: typeof m.recipe === "string" ? m.recipe : String(m.recipe),
        }))
      : undefined;

    if (sanitizedMeals && sanitizedMeals.length > 0) {
      const recipeIds = sanitizedMeals.map((m) => m.recipe);
      const found = await Recipe.countDocuments({ _id: { $in: recipeIds }, userId: req.user.userId });
      if (found !== recipeIds.length)
        return res.status(400).json({ message: "One or more recipe IDs are invalid" });
    }

    const mealPlan = await MealPlan.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { weekStart, meals: sanitizedMeals },
      { new: true, runValidators: true }
    );

    if (!mealPlan) return res.status(404).json({ message: "Meal plan not found" });
    res.json({ mealPlan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/mealplan/:id – delete a meal plan
router.delete("/:id", async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!mealPlan) return res.status(404).json({ message: "Meal plan not found" });
    res.json({ message: "Meal plan deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
