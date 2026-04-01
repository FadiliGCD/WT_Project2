const express = require("express");
const rateLimit = require("express-rate-limit");
const Recipe = require("../models/Recipe");
const auth = require("../middleware/auth");

const router = express.Router();

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

// All recipe routes require authentication and rate limiting
router.use(limiter);
router.use(auth);

// GET /api/recipes – list all recipes for the logged-in user
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ recipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/recipes – create a new recipe
router.post("/", async (req, res) => {
  try {
    const { title, description, ingredients, instructions } = req.body;

    if (!title) return res.status(400).json({ message: "Title is required" });

    const recipe = await Recipe.create({
      title,
      description,
      ingredients: ingredients || [],
      instructions,
      userId: req.user.userId,
    });

    res.status(201).json({ recipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/recipes/:id – get a single recipe
router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json({ recipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/recipes/:id – update a recipe
router.put("/:id", async (req, res) => {
  try {
    const title = typeof req.body.title === "string" ? req.body.title : undefined;
    const description = typeof req.body.description === "string" ? req.body.description : undefined;
    const instructions = typeof req.body.instructions === "string" ? req.body.instructions : undefined;
    const ingredients = Array.isArray(req.body.ingredients)
      ? req.body.ingredients.filter((i) => typeof i === "string")
      : undefined;

    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { title, description, ingredients, instructions },
      { new: true, runValidators: true }
    );

    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json({ recipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/recipes/:id – delete a recipe
router.delete("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json({ message: "Recipe deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
