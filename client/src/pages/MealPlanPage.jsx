// Assignment 4: GET/POST/DELETE /api/meal-plan with week anchor (Monday from server).

import { useState } from 'react'
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
    mealPlanWeekStart,
    setMealPlanWeekAnchor,
  } = useAppData()
  const [planError, setPlanError] = useState('')

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
        <p className="hint">Week anchored to Monday <code>{mealPlanWeekStart}</code> (server normalises dates).</p>
        <label className="week-picker">
          Jump to week
          <input
            type="date"
            value={mealPlanWeekStart}
            onChange={async (e) => {
              const v = e.target.value
              if (!v) return
              setPlanError('')
              try {
                await setMealPlanWeekAnchor(v)
              } catch (err) {
                setPlanError(err.message || 'Could not load week')
              }
            }}
          />
        </label>
        {planError && (
          <p className="error-list" role="alert">
            {planError}
          </p>
        )}
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
                            onClick={async () => {
                              setPlanError('')
                              try {
                                await clearMealSlot(dayIndex, slot)
                              } catch (err) {
                                setPlanError(err.message || 'Could not clear slot')
                              }
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      ) : (
                        <select
                          aria-label={`Choose recipe ${slot} day ${dayIndex}`}
                          defaultValue=""
                          onChange={async (e) => {
                            const v = e.target.value
                            e.target.value = ''
                            if (!v) return
                            setPlanError('')
                            try {
                              await setMealSlot(dayIndex, slot, v)
                            } catch (err) {
                              setPlanError(err.message || 'Could not save slot')
                            }
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
