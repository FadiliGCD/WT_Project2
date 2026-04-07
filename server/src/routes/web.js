// HTML interface
const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Favourite = require('../models/Favourite');
const MealPlanEntry = require('../models/MealPlanEntry');
const { MEAL_SLOTS } = require('../models/MealPlanEntry');
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

const webRouter = express.Router();

function setFlash(req, type, messages) {
  req.session.flash = { type, messages };
}

// Home and navigation 

webRouter.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

// Registration

webRouter.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/recipes');
  res.render('register', { title: 'Register', errors: [], body: {} });
});

webRouter.post('/register', async (req, res) => {
  const errors = validateRegister(req.body);
  if (errors.length) {
    return res.status(400).render('register', { title: 'Register', errors, body: req.body });
  }

  const username = asTrimmedString(req.body.username);
  const email = asTrimmedString(req.body.email).toLowerCase();
  const password = asTrimmedString(req.body.password);

  try {
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(400).render('register', {
        title: 'Register',
        errors: ['Username or email is already registered.'],
        body: req.body,
      });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash });
    req.session.userId = user._id.toString();
    req.session.username = user.username;
    setFlash(req, 'success', ['Account created. You are now logged in.']);
    return res.redirect('/recipes');
  } catch (e) {
    return res.status(500).render('register', {
      title: 'Register',
      errors: ['Server error while registering. Please try again.'],
      body: req.body,
    });
  }
});

// Login and logout 

webRouter.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/recipes');
  res.render('login', { title: 'Login', errors: [], body: {} });
});

webRouter.post('/login', async (req, res) => {
  const errors = validateLogin(req.body);
  if (errors.length) {
    return res.status(400).render('login', { title: 'Login', errors, body: req.body });
  }

  const username = asTrimmedString(req.body.username);
  const password = asTrimmedString(req.body.password);

  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(400).render('login', {
        title: 'Login',
        errors: ['Invalid username or password.'],
        body: req.body,
      });
    }
    req.session.userId = user._id.toString();
    req.session.username = user.username;

    // COOKIE: Remembers last visited section for returning users 
    const lastSection = req.cookies.lastSection || 'recipes';
    setFlash(req, 'success', ['Logged in successfully.']);
    return res.redirect(`/${lastSection === 'meal-plan' ? 'meal-plan' : lastSection === 'favourites' ? 'favourites' : 'recipes'}`);
  } catch (e) {
    return res.status(500).render('login', {
      title: 'Login',
      errors: ['Server error during login.'],
      body: req.body,
    });
  }
});

webRouter.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.redirect('/');
  });
});

// Recipes CRUD and search

webRouter.get('/recipes', async (req, res) => {
  const q = asTrimmedString(req.query.q);
  const category = asTrimmedString(req.query.category);

  // COOKIE: Keeps last browsed filters
  res.cookie('lastSearchQuery', q || '', { maxAge: 1000 * 60 * 60 * 24 * 30, sameSite: 'lax' });
  res.cookie('lastSearchCategory', category || '', { maxAge: 1000 * 60 * 60 * 24 * 30, sameSite: 'lax' });
  res.cookie('lastSection', 'recipes', { maxAge: 1000 * 60 * 60 * 24 * 90, sameSite: 'lax' });

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
    res.render('recipes/index', { title: 'Recipes', recipes, q, category });
  } catch (e) {
    res.status(500).send('Failed to load recipes.');
  }
});

webRouter.get('/recipes/new', requireAuth, (req, res) => {
  res.render('recipes/form', { title: 'Add recipe', errors: [], recipe: null, formAction: '/recipes', method: 'post' });
});

webRouter.post('/recipes', requireAuth, async (req, res) => {
  const { errors, data } = validateRecipe(req.body);
  if (errors.length) {
    return res.status(400).render('recipes/form', {
      title: 'Add recipe',
      errors,
      recipe: req.body,
      formAction: '/recipes',
      method: 'post',
    });
  }
  try {
    await Recipe.create({ ...data, author: req.session.userId });
    setFlash(req, 'success', ['Recipe created.']);
    res.redirect('/recipes');
  } catch (e) {
    res.status(500).render('recipes/form', {
      title: 'Add recipe',
      errors: ['Could not save recipe.'],
      recipe: req.body,
      formAction: '/recipes',
      method: 'post',
    });
  }
});

webRouter.get('/recipes/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).send('Not found');
  try {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'username').lean();
    if (!recipe) return res.status(404).send('Not found');

    let isFavourite = false;
    if (req.session.userId) {
      const fav = await Favourite.findOne({ user: req.session.userId, recipe: recipe._id });
      isFavourite = !!fav;
    }
    res.cookie('lastRecipeId', String(recipe._id), { maxAge: 1000 * 60 * 60 * 24 * 30, sameSite: 'lax' });
    res.render('recipes/show', { title: recipe.title, recipe, isFavourite });
  } catch (e) {
    res.status(500).send('Failed to load recipe.');
  }
});

webRouter.get('/recipes/:id/edit', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).send('Not found');
  try {
    const recipe = await Recipe.findById(req.params.id).lean();
    if (!recipe) return res.status(404).send('Not found');
    if (String(recipe.author) !== String(req.session.userId)) {
      return res.status(403).send('You can only edit your own recipes.');
    }
    res.render('recipes/form', {
      title: 'Edit recipe',
      errors: [],
      recipe,
      formAction: `/recipes/${recipe._id}?_method=PUT`,
      method: 'post',
    });
  } catch (e) {
    res.status(500).send('Failed to load recipe.');
  }
});

webRouter.put('/recipes/:id', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).send('Not found');
  const { errors, data } = validateRecipe(req.body);
  if (errors.length) {
    return res.status(400).render('recipes/form', {
      title: 'Edit recipe',
      errors,
      recipe: { ...req.body, _id: req.params.id },
      formAction: `/recipes/${req.params.id}?_method=PUT`,
      method: 'post',
    });
  }
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).send('Not found');
    if (String(recipe.author) !== String(req.session.userId)) {
      return res.status(403).send('You can only edit your own recipes.');
    }
    Object.assign(recipe, data);
    await recipe.save();
    setFlash(req, 'success', ['Recipe updated.']);
    res.redirect(`/recipes/${recipe._id}`);
  } catch (e) {
    res.status(500).send('Could not update recipe.');
  }
});

webRouter.delete('/recipes/:id', requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).send('Not found');
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).send('Not found');
    if (String(recipe.author) !== String(req.session.userId)) {
      return res.status(403).send('You can only delete your own recipes.');
    }
    await Favourite.deleteMany({ recipe: recipe._id });
    await MealPlanEntry.deleteMany({ recipe: recipe._id });
    await recipe.deleteOne();
    setFlash(req, 'success', ['Recipe deleted.']);
    res.redirect('/recipes');
  } catch (e) {
    res.status(500).send('Could not delete recipe.');
  }
});

// Favourites

webRouter.get('/favourites', requireAuth, async (req, res) => {
  res.cookie('lastSection', 'favourites', { maxAge: 1000 * 60 * 60 * 24 * 90, sameSite: 'lax' });
  try {
    const list = await Favourite.find({ user: req.session.userId })
      .populate({ path: 'recipe', populate: { path: 'author', select: 'username' } })
      .sort({ createdAt: -1 })
      .lean();
    const recipes = list.map((f) => f.recipe).filter(Boolean);
    res.render('favourites/index', { title: 'Favourites', recipes });
  } catch (e) {
    res.status(500).send('Failed to load favourites.');
  }
});

webRouter.post('/favourites', requireAuth, async (req, res) => {
  const recipeId = asTrimmedString(req.body.recipeId);
  if (!mongoose.isValidObjectId(recipeId)) {
    setFlash(req, 'error', ['Invalid recipe.']);
    return res.redirect('/recipes');
  }
  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      setFlash(req, 'error', ['Recipe not found.']);
      return res.redirect('/recipes');
    }
    await Favourite.updateOne(
      { user: req.session.userId, recipe: recipeId },
      { $setOnInsert: { user: req.session.userId, recipe: recipeId } },
      { upsert: true }
    );
    setFlash(req, 'success', ['Saved to favourites.']);
    res.redirect(`/recipes/${recipeId}`);
  } catch (e) {
    setFlash(req, 'error', ['Could not save favourite.']);
    res.redirect(`/recipes/${recipeId}`);
  }
});

webRouter.delete('/favourites/:recipeId', requireAuth, async (req, res) => {
  const recipeId = req.params.recipeId;
  if (!mongoose.isValidObjectId(recipeId)) return res.redirect('/favourites');
  await Favourite.deleteOne({ user: req.session.userId, recipe: recipeId });
  setFlash(req, 'success', ['Removed from favourites.']);
  res.redirect('/favourites');
});

// Meal planner

webRouter.get('/meal-plan', requireAuth, async (req, res) => {
  res.cookie('lastSection', 'meal-plan', { maxAge: 1000 * 60 * 60 * 24 * 90, sameSite: 'lax' });

  let anchor = req.query.week ? new Date(String(req.query.week)) : new Date();
  if (Number.isNaN(anchor.getTime())) anchor = new Date();
  const weekStart = startOfWeekMonday(anchor);

  // COOKIE: Remembers last viewed planner week 
  res.cookie('lastMealPlanWeek', toInputDateString(weekStart), {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  try {
    const entries = await MealPlanEntry.find({ user: req.session.userId, weekStart })
      .populate('recipe')
      .lean();

    /** @type {Record<string, import('mongoose').Types.ObjectId>} */
    const grid = {};
    for (const e of entries) {
      grid[`${e.dayIndex}-${e.mealSlot}`] = e;
    }

    const myRecipes = await Recipe.find({ author: req.session.userId }).sort({ title: 1 }).lean();
    const saved = await Favourite.find({ user: req.session.userId }).populate('recipe').lean();
    const pickList = [
      ...myRecipes,
      ...saved.map((s) => s.recipe).filter(Boolean),
    ];
    const unique = [];
    const seen = new Set();
    for (const r of pickList) {
      const id = String(r._id);
      if (!seen.has(id)) {
        seen.add(id);
        unique.push(r);
      }
    }

    res.render('meal-plan/index', {
      title: 'Meal plan',
      weekStart,
      weekStartInput: toInputDateString(weekStart),
      dayLabels,
      mealSlots: MEAL_SLOTS,
      grid,
      recipeChoices: unique.sort((a, b) => a.title.localeCompare(b.title)),
    });
  } catch (e) {
    res.status(500).send('Failed to load meal plan.');
  }
});

webRouter.post('/meal-plan', requireAuth, async (req, res) => {
  const { errors, data } = validateMealPlanEntry(req.body);
  if (errors.length) {
    setFlash(req, 'error', errors);
    const ws = asTrimmedString(req.body.weekStart);
    return res.redirect(ws ? `/meal-plan?week=${encodeURIComponent(ws)}` : '/meal-plan');
  }

  const weekStart = startOfWeekMonday(data.weekStart);

  try {
    const recipe = await Recipe.findById(data.recipeId);
    if (!recipe) {
      setFlash(req, 'error', ['Recipe not found.']);
      return res.redirect(`/meal-plan?week=${encodeURIComponent(toInputDateString(weekStart))}`);
    }

    await MealPlanEntry.findOneAndUpdate(
      {
        user: req.session.userId,
        weekStart,
        dayIndex: data.dayIndex,
        mealSlot: data.mealSlot,
      },
      { user: req.session.userId, weekStart, dayIndex: data.dayIndex, mealSlot: data.mealSlot, recipe: data.recipeId },
      { upsert: true, new: true }
    );
    setFlash(req, 'success', ['Meal slot updated.']);
    res.redirect(`/meal-plan?week=${encodeURIComponent(toInputDateString(weekStart))}`);
  } catch (e) {
    setFlash(req, 'error', ['Could not save meal plan entry.']);
    res.redirect('/meal-plan');
  }
});

webRouter.delete('/meal-plan', requireAuth, async (req, res) => {
  const cleared = validateMealPlanClear(req.body);
  if (cleared.errors.length) {
    setFlash(req, 'error', cleared.errors);
    return res.redirect('/meal-plan');
  }
  const weekStart = startOfWeekMonday(cleared.weekStart);
  await MealPlanEntry.deleteOne({
    user: req.session.userId,
    weekStart,
    dayIndex: cleared.dayIndex,
    mealSlot: cleared.mealSlot,
  });
  setFlash(req, 'success', ['Cleared meal slot.']);
  res.redirect(`/meal-plan?week=${encodeURIComponent(toInputDateString(weekStart))}`);
});

// Profile" View own recipes

webRouter.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).lean();
    const myRecipes = await Recipe.find({ author: req.session.userId }).sort({ updatedAt: -1 }).lean();
    const favCount = await Favourite.countDocuments({ user: req.session.userId });
    res.render('profile', { title: 'Profile', user, myRecipes, favCount });
  } catch (e) {
    res.status(500).send('Failed to load profile.');
  }
});

module.exports = { webRouter };
