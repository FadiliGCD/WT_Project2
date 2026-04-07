 // Server-side validation 
function asTrimmedString(v) {
  if (v === undefined || v === null) return '';
  return String(v).trim();
}

function asInt(v) {
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : NaN;
}

function validateRegister(body) {
  const errors = [];
  const username = asTrimmedString(body.username);
  const email = asTrimmedString(body.email);
  const password = asTrimmedString(body.password);
  const confirmPassword = asTrimmedString(body.confirmPassword);

  if (username.length < 3 || username.length > 40) {
    errors.push('Username must be between 3 and 40 characters.');
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username may only contain letters, numbers, and underscores.');
  }
  if (!email) {
    errors.push('Email is required.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Email format is not valid.');
  }
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters.');
  }
  if (password !== confirmPassword) {
    errors.push('Password and confirmation do not match.');
  }
  return errors;
}

function validateLogin(body) {
  const errors = [];
  const username = asTrimmedString(body.username);
  const password = asTrimmedString(body.password);
  if (!username) errors.push('Username is required.');
  if (!password) errors.push('Password is required.');
  return errors;
}

function validateRecipe(body) {
  const errors = [];
  const title = asTrimmedString(body.title);
  const ingredients = asTrimmedString(body.ingredients);
  const instructions = asTrimmedString(body.instructions);
  let category = asTrimmedString(body.category);
  let dietaryTags = asTrimmedString(body.dietaryTags);
  const prepTimeMinutes = asInt(body.prepTimeMinutes);
  const cookTimeMinutes = asInt(body.cookTimeMinutes);
  const servings = asInt(body.servings);

  if (!title) errors.push('Title is required.');
  else if (title.length > 200) errors.push('Title must be at most 200 characters.');
  if (!ingredients) errors.push('Ingredients are required.');
  if (!instructions) errors.push('Instructions are required.');

  if (!category) category = 'General';
  if (Number.isNaN(prepTimeMinutes) || prepTimeMinutes < 0 || prepTimeMinutes > 10080) {
    errors.push('Prep time must be a number between 0 and 10080 (minutes).');
  }
  if (Number.isNaN(cookTimeMinutes) || cookTimeMinutes < 0 || cookTimeMinutes > 10080) {
    errors.push('Cook time must be a number between 0 and 10080 (minutes).');
  }
  if (Number.isNaN(servings) || servings < 1 || servings > 500) {
    errors.push('Servings must be a number between 1 and 500.');
  }

  if (errors.length) return { errors, data: null };

  return {
    errors: [],
    data: {
      title,
      ingredients,
      instructions,
      category,
      dietaryTags,
      prepTimeMinutes,
      cookTimeMinutes,
      servings,
    },
  };
}

function validateMealPlanEntry(body) {
  const errors = [];
  const weekStartRaw = asTrimmedString(body.weekStart);
  const dayIndex = asInt(body.dayIndex);
  const mealSlot = asTrimmedString(body.mealSlot).toLowerCase();
  const recipeId = asTrimmedString(body.recipeId);

  const allowed = ['breakfast', 'lunch', 'dinner', 'snack'];
  if (!weekStartRaw) errors.push('Week start date is required.');
  const weekStart = weekStartRaw ? new Date(weekStartRaw) : new Date(NaN);
  if (Number.isNaN(weekStart.getTime())) errors.push('Week start must be a valid date.');
  if (Number.isNaN(dayIndex) || dayIndex < 0 || dayIndex > 6) {
    errors.push('Day must be between 0 (Monday) and 6 (Sunday).');
  }
  if (!allowed.includes(mealSlot)) {
    errors.push('Meal slot must be breakfast, lunch, dinner, or snack.');
  }
  if (!recipeId || !/^[a-f\d]{24}$/i.test(recipeId)) {
    errors.push('A valid recipe must be selected.');
  }

  if (errors.length) return { errors, data: null };
  return { errors: [], data: { weekStart, dayIndex, mealSlot, recipeId } };
}

function validateMealPlanClear(body) {
  const errors = [];
  const weekStartRaw = asTrimmedString(body.weekStart);
  const dayIndex = parseInt(String(body.dayIndex), 10);
  const mealSlot = asTrimmedString(body.mealSlot).toLowerCase();
  const allowed = ['breakfast', 'lunch', 'dinner', 'snack'];

  const weekStart = weekStartRaw ? new Date(weekStartRaw) : new Date(NaN);
  if (!weekStartRaw || Number.isNaN(weekStart.getTime())) {
    errors.push('Week start must be a valid date.');
  }
  if (!Number.isFinite(dayIndex) || dayIndex < 0 || dayIndex > 6) {
    errors.push('Day must be between 0 and 6.');
  }
  if (!allowed.includes(mealSlot)) {
    errors.push('Invalid meal slot.');
  }

  if (errors.length) {
    return { errors, weekStart: null, dayIndex: null, mealSlot: null };
  }
  return { errors: [], weekStart, dayIndex, mealSlot };
}

module.exports = {
  validateRegister,
  validateLogin,
  validateRecipe,
  validateMealPlanEntry,
  validateMealPlanClear,
  asTrimmedString,
};
