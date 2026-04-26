/**
 * ASSIGNMENT 3 — VIEW 3: Browse & search recipes (Assignment 1 functionality 2).
 * Intended backend: GET `${process.env.REACT_APP_API_URL}/api/recipes?q=&category=`
 * Filtering is applied client-side to mock data for responsive UX without network calls.
 * "Layout change": toggling advanced filters panel (user interaction → different layout).
 */

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'

export function RecipesPage() {
  const { recipes, favouriteIds, toggleFavourite, currentUser } = useAppData()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('title')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const filtered = useMemo(() => {
    let list = recipes.filter((r) => {
      const q = query.trim().toLowerCase()
      const matchQ =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.ingredients.toLowerCase().includes(q)
      const matchCat =
        !category || r.category.toLowerCase() === category.toLowerCase()
      return matchQ && matchCat
    })
    list = [...list].sort((a, b) => {
      if (sort === 'time') return a.prepTimeMinutes + a.cookTimeMinutes - (b.prepTimeMinutes + b.cookTimeMinutes)
      return a.title.localeCompare(b.title)
    })
    return list
  }, [recipes, query, category, sort])

  return (
    <section className="page recipes-page">
      <header className="page-header">
        <h1>Recipes</h1>
        <p className="hint">
          Mock list — intended backend: GET /api/recipes (see REACT_APP_API_URL in .env.example).
        </p>
      </header>
      <div className={`filters-panel card ${showAdvanced ? 'filters-expanded' : ''}`}>
        <div className="filters-row">
          <label className="grow">
            Search
            <input
              type="search"
              placeholder="Title or ingredients"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setShowAdvanced((v) => !v)}
            aria-expanded={showAdvanced}
          >
            {showAdvanced ? 'Hide' : 'Show'} filters
          </button>
        </div>
        {showAdvanced && (
          <div className="filters-advanced stack-horizontal">
            <label>
              Category
              <input
                placeholder="e.g. Italian"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </label>
            <label>
              Sort by
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="title">Title</option>
                <option value="time">Total time</option>
              </select>
            </label>
          </div>
        )}
      </div>
      <ul className="recipe-grid">
        {filtered.map((r) => (
          <li key={r._id} className="recipe-card card">
            <h2>
              <Link to={`/recipes/${r._id}`}>{r.title}</Link>
            </h2>
            <p className="meta">
              {r.category} · {r.prepTimeMinutes + r.cookTimeMinutes} min · Serves {r.servings}
            </p>
            <div className="card-actions">
              <Link to={`/recipes/${r._id}`} className="btn btn-ghost btn-sm">
                View
              </Link>
              {currentUser && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => toggleFavourite(r._id)}
                >
                  {favouriteIds.has(r._id) ? '★ Saved' : '☆ Save'}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && <p className="empty-state">No recipes match your filters.</p>}
    </section>
  )
}
