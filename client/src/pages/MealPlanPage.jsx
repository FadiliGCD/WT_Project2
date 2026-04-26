/**
 * ASSIGNMENT 3 — VIEW 6: Weekly meal planner (Assignment 1 functionality 5).
 * Intended backend:
 *   GET  `${process.env.REACT_APP_API_URL}/api/meal-plan?week=`
 *   POST `${process.env.REACT_APP_API_URL}/api/meal-plan` (weekStart, dayIndex, mealSlot, recipeId)
 * Grid edits only update React state (no HTTP).
 */

import { useAppData } from '../context/AppDataContext'

export function MealPlanPage() {
  const {
    recipes,
    mealPlan,
    setMealSlot,
    clearMealSlot,
    MEAL_SLOTS,
    DAY_LABELS,
    currentUser,
  } = useAppData()

  if (!currentUser) {
    return (
      <section className="page">
        <div className="card">
          <h1>Meal plan</h1>
          <p>Log in to assign recipes to your week.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page meal-plan-page">
      <header className="page-header">
        <h1>Meal plan</h1>
        <p className="hint">
          Mock week grid. Intended API: /api/meal-plan (GET/POST/DELETE)
        </p>
      </header>
      <div className="table-scroll">
        <table className="meal-grid">
          <thead>
            <tr>
              <th scope="col" />
              {DAY_LABELS.map((d) => (
                <th key={d} scope="col">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEAL_SLOTS.map((slot) => (
              <tr key={slot}>
                <th scope="row">{slot}</th>
                {DAY_LABELS.map((_, dayIndex) => {
                  const key = `${dayIndex}-${slot}`
                  const recipeId = mealPlan[key]
                  const recipe = recipes.find((r) => r._id === recipeId)
                  return (
                    <td key={key}>
                      {recipe ? (
                        <div className="cell-filled">
                          <span>{recipe.title}</span>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => clearMealSlot(dayIndex, slot)}
                          >
                            Clear
                          </button>
                        </div>
                      ) : (
                        <select
                          aria-label={`Choose recipe ${slot} day ${dayIndex}`}
                          defaultValue=""
                          onChange={(e) => {
                            const v = e.target.value
                            if (v) setMealSlot(dayIndex, slot, v)
                          }}
                        >
                          <option value="">—</option>
                          {recipes.map((r) => (
                            <option key={r._id} value={r._id}>
                              {r.title}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
