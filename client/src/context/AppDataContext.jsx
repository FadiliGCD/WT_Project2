/**
 * AppDataContext.jsx
 * Holds mock application state (user session, recipes, favourites, meal-plan draft).
 * Assignment 3: state updates are client-only — no fetch() to Assignment 2 API.
 *
 * Future wiring examples (do not enable in A3 without lecturer approval):
 * - POST `${process.env.REACT_APP_API_URL}/api/auth/login` with credentials
 * - GET  `${process.env.REACT_APP_API_URL}/api/recipes`
 */

import { createContext, useContext, useMemo, useState } from 'react'
import { initialRecipes } from '../mocks/initialRecipes'

const AppDataContext = createContext(null)

const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack']
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/**
 * @param {{ children: import('react').ReactNode }} props
 */
export function AppDataProvider({ children }) {
  /** Mock logged-in user (null = guest). Maps to server session after real auth. */
  const [currentUser, setCurrentUser] = useState(null)
  /** In-memory recipe list — maps to MongoDB `recipes` collection via API. */
  const [recipes, setRecipes] = useState(() => [...initialRecipes])
  /** Set of recipe ids favourited by the mock user. Maps to POST/DELETE /api/favourites. */
  const [favouriteIds, setFavouriteIds] = useState(() => new Set(['mock-1']))
  /**
   * Meal plan grid: key `${dayIndex}-${mealSlot}` -> recipeId or null.
   * Maps to GET/POST /api/meal-plan on the server.
   */
  const [mealPlan, setMealPlan] = useState(() => ({}))

  const login = (username) => setCurrentUser({ username })
  const logout = () => {
    setCurrentUser(null)
  }

  const addRecipe = (recipe) => {
    const id = `mock-${Date.now()}`
    setRecipes((prev) => [
      ...prev,
      {
        ...recipe,
        _id: id,
        authorUsername: currentUser?.username || 'guest',
      },
    ])
    return id
  }

  const toggleFavourite = (recipeId) => {
    setFavouriteIds((prev) => {
      const next = new Set(prev)
      if (next.has(recipeId)) next.delete(recipeId)
      else next.add(recipeId)
      return next
    })
  }

  const setMealSlot = (dayIndex, mealSlot, recipeId) => {
    const key = `${dayIndex}-${mealSlot}`
    setMealPlan((prev) => ({ ...prev, [key]: recipeId }))
  }

  const clearMealSlot = (dayIndex, mealSlot) => {
    const key = `${dayIndex}-${mealSlot}`
    setMealPlan((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const value = useMemo(
    () => ({
      currentUser,
      login,
      logout,
      recipes,
      addRecipe,
      favouriteIds,
      toggleFavourite,
      mealPlan,
      setMealSlot,
      clearMealSlot,
      MEAL_SLOTS,
      DAY_LABELS,
    }),
    [currentUser, recipes, favouriteIds, mealPlan]
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}
