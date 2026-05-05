/**
 * api.js
 * JSON REST API for the same domain logic (Assignment 2: GET/POST/PUT/PATCH/DELETE + hosted API).
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Favourite = require('../models/Favourite');
const MealPlanEntry = require('../models/MealPlanEntry');
const { requireAuth } = require('../middleware/requireAuth');
const {
  validateRegister,
  validateLogin,
  validateRecipe,
  validateMealPlanEntry,
  validateMealPlanClear,
  asTrimmedString,
} = require('../utils/validation');
const { startOfWeekMonday, toInputDateString } = require('../utils/week');

const apiRouter = express.Router();

// ----- Auth (session cookie still used after login via same browser) -----

/** Current session user for React bootstrap (no auth required). */
apiRouter.get('/auth/me', (req, res) => {
  if (!req.session.userId) {
    return res.json({ user: null });
  }
  return res.json({
    user: { id: req.session.userId, username: req.session.username },
  });
});

apiRouter.post('/auth/register', async (req, res) => {
  const errors = validateRegister({
    ...req.body,
    confirmPassword: req.body.confirmPassword ?? req.body.password,
  });
  if (errors.length) return res.status(400).json({ errors });

  const username = asTrimmedString(req.body.username);
  const email = asTrimmedString(req.body.email).toLowerCase();
  const password = asTrimmedString(req.body.password);

  try {
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.status(409).json({ errors: ['Username or email already taken.'] });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash });
    req.session.userId = user._id.toString();
    req.session.username = user.username;
    return res.status(201).json({ id: user._id, username: user.username, email: user.email });
  } catch (e) {
    return res.status(500).json({ errors: ['Registration failed.'] });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  const errors = validateLogin(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const username = asTrimmedString(req.body.username);
  const password = asTrimmedString(req.body.password);

  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ errors: ['Invalid username or password.'] });
    }
    req.session.userId = user._id.toString();
    req.session.username = user.username;
    return res.json({ id: user._id, username: user.username });
  } catch (e) {
    return res.status(500).json({ errors: ['Login failed.'] });
  }
});

apiRouter.post('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.status(204).end();
  });
});

// ----- Recipes CRUD -----

apiRouter.get('/recipes', async (req, res) => {
  const q = asTrimmedString(req.query.q);
  const category = asTrimmedString(req.query.category);
  const filter = {};
  if (category) filter.category = new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  if (q) {
    filter.$or = [
      { title: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      { ingredients: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
    ];
  }
  try {
    const recipes = await Recipe.find(filter).populate('author', 'username').sort({ updatedAt: -1 }).lean();
    res.json(recipes);
  } catch (e) {
    res.status(500).json({ error: 'Failed to list recipes.' });
  }
});

apiRouter.get('/recipes/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' });
  try {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'username').lean();
    if (!recipe) return res.status(404).json({ error: 'Not found' });
    res.json(recipe);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load recipe.' });
  }
});

apiRouter.post('/recipes', requireAuth, async (req, res) => {
  const { errors, data } = validateRecipe(req.body);
  if (errors.length) return res.status(400).json({ errors });
  try {
    const recipe = await Recipe.create({ ...data, author: req.session.userId });
    res.status(201).json(recipe);
  } catch (e) {
    res.status(500).json({ errors: ['Create failed.'] });
  }
});

apiRouter.put('/recipes/:id', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' });
  const { errors, data } = validateRecipe(req.body);
  if (errors.length) return res.status(400).json({ errors });
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Not found' });
    if (String(recipe.author) !== String(req.session.userId)) {
      return res.status(403).json({ error: 'You can only edit your own recipes.' });
    }
    Object.assign(recipe, data);
    await recipe.save();
    res.json(recipe);
  } catch (e) {
    res.status(500).json({ error: 'Update failed.' });
  }
});

/** PATCH partial update: merge only provided fields after full validation on merged object. */
apiRouter.patch('/recipes/:id', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' });
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Not found' });
    if (String(recipe.author) !== String(req.session.userId)) {
      return res.status(403).json({ error: 'You can only edit your own recipes.' });
    }
    const merged = {
      title: req.body.title !== undefined ? req.body.title : recipe.title,
      ingredients: req.body.ingredients !== undefined ? req.body.ingredients : recipe.ingredients,
      instructions: req.body.instructions !== undefined ? req.body.instructions : recipe.instructions,
      category: req.body.category !== undefined ? req.body.category : recipe.category,
      dietaryTags: req.body.dietaryTags !== undefined ? req.body.dietaryTags : recipe.dietaryTags,
      prepTimeMinutes: req.body.prepTimeMinutes !== undefined ? req.body.prepTimeMinutes : recipe.prepTimeMinutes,
      cookTimeMinutes: req.body.cookTimeMinutes !== undefined ? req.body.cookTimeMinutes : recipe.cookTimeMinutes,
      servings: req.body.servings !== undefined ? req.body.servings : recipe.servings,
    };
    const { errors, data } = validateRecipe(merged);
    if (errors.length) return res.status(400).json({ errors });
    Object.assign(recipe, data);
    await recipe.save();
    res.json(recipe);
  } catch (e) {
    res.status(500).json({ error: 'Patch failed.' });
  }
});

apiRouter.delete('/recipes/:id', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' });
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Not found' });
    if (String(recipe.author) !== String(req.session.userId)) {
      return res.status(403).json({ error: 'You can only delete your own recipes.' });
    }
    await Favourite.deleteMany({ recipe: recipe._id });
    await MealPlanEntry.deleteMany({ recipe: recipe._id });
    await recipe.deleteOne();
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: 'Delete failed.' });
  }
});

// ----- Favourites -----

apiRouter.get('/favourites', requireAuth, async (req, res) => {
  try {
    const list = await Favourite.find({ user: req.session.userId })
      .populate({ path: 'recipe', populate: { path: 'author', select: 'username' } })
      .sort({ createdAt: -1 })
      .lean();
    res.json(list.map((f) => f.recipe).filter(Boolean));
  } catch (e) {
    res.status(500).json({ error: 'Failed to list favourites.' });
  }
});

apiRouter.post('/favourites', requireAuth, async (req, res) => {
  const recipeId = asTrimmedString(req.body.recipeId);
  if (!mongoose.isValidObjectId(recipeId)) return res.status(400).json({ errors: ['Invalid recipe id.'] });
  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ errors: ['Recipe not found.'] });
    await Favourite.updateOne(
      { user: req.session.userId, recipe: recipeId },
      { $setOnInsert: { user: req.session.userId, recipe: recipeId } },
      { upsert: true }
    );
    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(500).json({ errors: ['Could not favourite.'] });
  }
});

apiRouter.delete('/favourites/:recipeId', requireAuth, async (req, res) => {
  const recipeId = req.params.recipeId;
  if (!mongoose.isValidObjectId(recipeId)) return res.status(400).json({ error: 'Invalid id' });
  await Favourite.deleteOne({ user: req.session.userId, recipe: recipeId });
  res.status(204).end();
});

// ----- Meal plan -----

apiRouter.get('/meal-plan', requireAuth, async (req, res) => {
  let anchor = req.query.week ? new Date(String(req.query.week)) : new Date();
  if (Number.isNaN(anchor.getTime())) anchor = new Date();
  const weekStart = startOfWeekMonday(anchor);
  try {
    const entries = await MealPlanEntry.find({ user: req.session.userId, weekStart })
      .populate('recipe')
      .lean();
    res.json({ weekStart: toInputDateString(weekStart), entries });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load meal plan.' });
  }
});

apiRouter.post('/meal-plan', requireAuth, async (req, res) => {
  const { errors, data } = validateMealPlanEntry(req.body);
  if (errors.length) return res.status(400).json({ errors });
  const weekStart = startOfWeekMonday(data.weekStart);
  try {
    const recipe = await Recipe.findById(data.recipeId);
    if (!recipe) return res.status(404).json({ errors: ['Recipe not found.'] });
    const doc = await MealPlanEntry.findOneAndUpdate(
      {
        user: req.session.userId,
        weekStart,
        dayIndex: data.dayIndex,
        mealSlot: data.mealSlot,
      },
      { user: req.session.userId, weekStart, dayIndex: data.dayIndex, mealSlot: data.mealSlot, recipe: data.recipeId },
      { upsert: true, new: true }
    ).populate('recipe');
    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ errors: ['Save failed.'] });
  }
});

apiRouter.delete('/meal-plan', requireAuth, async (req, res) => {
  const cleared = validateMealPlanClear(req.body);
  if (cleared.errors.length) return res.status(400).json({ errors: cleared.errors });
  const weekStart = startOfWeekMonday(cleared.weekStart);
  await MealPlanEntry.deleteOne({
    user: req.session.userId,
    weekStart,
    dayIndex: cleared.dayIndex,
    mealSlot: cleared.mealSlot,
  });
  res.status(204).end();
});

module.exports = { apiRouter };
