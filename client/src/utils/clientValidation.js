/**
 * clientValidation.js
 * Client-side form validation for Assignment 3 rubric (mirrors server rules conceptually).
 */

/**
 * Validates login fields.
 * @param {{ username: string, password: string }} values
 * @returns {string[]} error messages for display
 */
export function validateLogin(values) {
  const errors = []
  if (!values.username?.trim()) errors.push('Username is required.')
  if (!values.password) errors.push('Password is required.')
  return errors
}

/**
 * Validates registration fields.
 * @param {{ username: string, email: string, password: string, confirmPassword: string }} values
 * @returns {string[]}
 */
export function validateRegister(values) {
  const errors = []
  const u = values.username?.trim() || ''
  if (u.length < 3) errors.push('Username must be at least 3 characters.')
  if (!/^[a-zA-Z0-9_]+$/.test(u)) {
    errors.push('Username may only contain letters, numbers, and underscores.')
  }
  const email = values.email?.trim() || ''
  if (!email) errors.push('Email is required.')
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address.')
  }
  const p = values.password || ''
  if (p.length < 8) errors.push('Password must be at least 8 characters.')
  if (p !== values.confirmPassword) errors.push('Passwords do not match.')
  return errors
}

/**
 * Validates recipe form (create / update).
 * @param {*} values
 * @returns {string[]}
 */
export function validateRecipeForm(values) {
  const errors = []
  if (!values.title?.trim()) errors.push('Title is required.')
  if (!values.ingredients?.trim()) errors.push('Ingredients are required.')
  if (!values.instructions?.trim()) errors.push('Instructions are required.')
  const prep = Number(values.prepTimeMinutes)
  const cook = Number(values.cookTimeMinutes)
  const servings = Number(values.servings)
  if (Number.isNaN(prep) || prep < 0) errors.push('Prep time must be zero or a positive number.')
  if (Number.isNaN(cook) || cook < 0) errors.push('Cook time must be zero or a positive number.')
  if (Number.isNaN(servings) || servings < 1) {
    errors.push('Servings must be at least 1.')
  }
  return errors
}
