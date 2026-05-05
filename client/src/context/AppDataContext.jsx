/**
 * AppDataContext.jsx
 * Assignment 4: live session + JSON API (Express /api) with credentials; meal plan + favourites synced.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../api/http'
import { normalizeRecipe } from '../utils/recipeShape'
import { startOfWeekMonday, toInputDateString } from '../utils/week'

const AppDataContext = createContext(null)

const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack']
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function mealPlanFromEntries(entries) {
  const next = {}
  for (const e of entries || []) {
    const rid = e.recipe?._id != null ? String(e.recipe._id) : null
    if (rid) next[`${e.dayIndex}-${e.mealSlot}`] = rid
  }
  return next
}

/**
 * @param {{ children: import('react').ReactNode }} props
 */
export function AppDataProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [recipes, setRecipes] = useState([])
  const [favouriteIds, setFavouriteIds] = useState(() => new Set())
  const [mealPlan, setMealPlan] = useState(() => ({}))
  const [mealPlanWeekStart, setMealPlanWeekStart] = useState(() =>
    toInputDateString(startOfWeekMonday(new Date()))
  )
  const [bootstrapped, setBootstrapped] = useState(false)
  const [bootstrapError, setBootstrapError] = useState(null)

  const refreshRecipes = useCallback(async () => {
    const list = await apiFetch('/api/recipes')
    setRecipes((list || []).map((r) => normalizeRecipe(r)))
  }, [])

  const mergeRecipe = useCallback((raw) => {
    const n = normalizeRecipe(raw)
    setRecipes((prev) => {
      if (prev.some((x) => x._id === n._id)) {
        return prev.map((x) => (x._id === n._id ? n : x))
      }
      return [...prev, n]
    })
  }, [])

  const loadMealPlanForWeek = useCallback(
    async (weekAnyDate) => {
      if (!currentUser) {
        setMealPlan({})
        return
      }
      const mp = await apiFetch(`/api/meal-plan?week=${encodeURIComponent(weekAnyDate)}`)
      setMealPlanWeekStart(mp.weekStart)
      setMealPlan(mealPlanFromEntries(mp.entries))
    },
    [currentUser]
  )

  const login = useCallback(
    async (username, password) => {
      await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      const me = await apiFetch('/api/auth/me')
      setCurrentUser(me.user)
      await refreshRecipes()
      if (me.user) {
        const favs = await apiFetch('/api/favourites')
        setFavouriteIds(new Set((favs || []).map((r) => String(r._id))))
        const mp = await apiFetch(`/api/meal-plan?week=${encodeURIComponent(mealPlanWeekStart)}`)
        setMealPlanWeekStart(mp.weekStart)
        setMealPlan(mealPlanFromEntries(mp.entries))
      }
    },
    [mealPlanWeekStart, refreshRecipes]
  )

  const register = useCallback(
    async (payload) => {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      const me = await apiFetch('/api/auth/me')
      setCurrentUser(me.user)
      await refreshRecipes()
      if (me.user) {
        const favs = await apiFetch('/api/favourites')
        setFavouriteIds(new Set((favs || []).map((r) => String(r._id))))
        const anchor = toInputDateString(startOfWeekMonday(new Date()))
        const mp = await apiFetch(`/api/meal-plan?week=${encodeURIComponent(anchor)}`)
        setMealPlanWeekStart(mp.weekStart)
        setMealPlan(mealPlanFromEntries(mp.entries))
      }
    },
    [refreshRecipes]
  )

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' })
    } catch {
      /* session may already be gone */
    }
    setCurrentUser(null)
    setFavouriteIds(new Set())
    setMealPlan({})
  }, [])

  const addRecipe = useCallback(
    async (recipe) => {
      const created = await apiFetch('/api/recipes', {
        method: 'POST',
        body: JSON.stringify(recipe),
      })
      await refreshRecipes()
      return String(created._id)
    },
    [refreshRecipes]
  )

  const toggleFavourite = useCallback(
    async (recipeId) => {
      if (!currentUser) return
      if (favouriteIds.has(recipeId)) {
        await apiFetch(`/api/favourites/${encodeURIComponent(recipeId)}`, { method: 'DELETE' })
      } else {
        await apiFetch('/api/favourites', {
          method: 'POST',
          body: JSON.stringify({ recipeId }),
        })
      }
      const favs = await apiFetch('/api/favourites')
      setFavouriteIds(new Set((favs || []).map((r) => String(r._id))))
    },
    [currentUser, favouriteIds]
  )

  const setMealSlot = useCallback(
    async (dayIndex, mealSlot, recipeId) => {
      await apiFetch('/api/meal-plan', {
        method: 'POST',
        body: JSON.stringify({
          weekStart: mealPlanWeekStart,
          dayIndex,
          mealSlot,
          recipeId,
        }),
      })
      const mp = await apiFetch(`/api/meal-plan?week=${encodeURIComponent(mealPlanWeekStart)}`)
      setMealPlan(mealPlanFromEntries(mp.entries))
    },
    [mealPlanWeekStart]
  )

  const clearMealSlot = useCallback(
    async (dayIndex, mealSlot) => {
      await apiFetch('/api/meal-plan', {
        method: 'DELETE',
        body: JSON.stringify({
          weekStart: mealPlanWeekStart,
          dayIndex,
          mealSlot,
        }),
      })
      const mp = await apiFetch(`/api/meal-plan?week=${encodeURIComponent(mealPlanWeekStart)}`)
      setMealPlan(mealPlanFromEntries(mp.entries))
    },
    [mealPlanWeekStart]
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const me = await apiFetch('/api/auth/me')
        if (cancelled) return
        setCurrentUser(me.user)
        const list = await apiFetch('/api/recipes')
        if (cancelled) return
        setRecipes((list || []).map((r) => normalizeRecipe(r)))
        if (me.user) {
          const favs = await apiFetch('/api/favourites')
          if (cancelled) return
          setFavouriteIds(new Set((favs || []).map((r) => String(r._id))))
          const anchor = toInputDateString(startOfWeekMonday(new Date()))
          const mp = await apiFetch(`/api/meal-plan?week=${encodeURIComponent(anchor)}`)
          if (cancelled) return
          setMealPlanWeekStart(mp.weekStart)
          setMealPlan(mealPlanFromEntries(mp.entries))
        }
      } catch (e) {
        if (!cancelled) {
          setBootstrapError(e.message || 'Could not load data from the server.')
        }
      } finally {
        if (!cancelled) setBootstrapped(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({
      currentUser,
      recipes,
      favouriteIds,
      mealPlan,
      mealPlanWeekStart,
      setMealPlanWeekAnchor: loadMealPlanForWeek,
      login,
      register,
      logout,
      addRecipe,
      toggleFavourite,
      setMealSlot,
      clearMealSlot,
      mergeRecipe,
      refreshRecipes,
      MEAL_SLOTS,
      DAY_LABELS,
      bootstrapped,
      bootstrapError,
    }),
    [
      currentUser,
      recipes,
      favouriteIds,
      mealPlan,
      mealPlanWeekStart,
      loadMealPlanForWeek,
      login,
      register,
      logout,
      addRecipe,
      toggleFavourite,
      setMealSlot,
      clearMealSlot,
      mergeRecipe,
      refreshRecipes,
      bootstrapped,
      bootstrapError,
    ]
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}
