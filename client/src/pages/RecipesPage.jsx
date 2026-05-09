// Assignment 4: list from GET /api/recipes; filters applied client-side on loaded data.

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import { ConfirmDialog } from '../components/ConfirmDialog'

export function RecipesPage() {
  const { recipes, favouriteIds, toggleFavourite, currentUser, deleteRecipe } = useAppData()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('title')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const filtered = useMemo(() => {
    let list = recipes.filter((r) => {
      const q = query.trim().toLowerCase()
      const ing = r.ingredients ? String(r.ingredients).toLowerCase() : ''
      const matchQ = !q || r.title.toLowerCase().includes(q) || ing.includes(q)
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
        <p className="hint">Search and filter the list below. Results update as you type.</p>
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
        {filtered.map((r) => {
          const isOwner = Boolean(currentUser && r.authorId && currentUser.id === r.authorId)
          return (
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
                {isOwner && (
                  <>
                    <Link to={`/recipes/${r._id}/edit`} className="btn btn-primary btn-sm">
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setDeleteError('')
                        setPendingDelete({ id: r._id, title: r.title })
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
                {currentUser && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={async () => {
                      try {
                        await toggleFavourite(r._id)
                      } catch (e) {
                        window.alert(e.message || 'Could not update favourites')
                      }
                    }}
                  >
                    {favouriteIds.has(r._id) ? '★ Saved' : '☆ Save'}
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      {filtered.length === 0 && <p className="empty-state">No recipes match your filters.</p>}
      {deleteError && (
        <p className="error-list" role="alert" style={{ marginTop: '1rem' }}>
          {deleteError}
        </p>
      )}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete recipe?"
        message={
          pendingDelete
            ? `“${pendingDelete.title}” will be permanently removed. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Keep recipe"
        destructive
        busy={deleting}
        onCancel={() => {
          if (!deleting) setPendingDelete(null)
        }}
        onConfirm={async () => {
          if (!pendingDelete) return
          setDeleting(true)
          setDeleteError('')
          try {
            await deleteRecipe(pendingDelete.id)
            setPendingDelete(null)
          } catch (e) {
            setDeleteError(e.message || 'Could not delete recipe')
            setPendingDelete(null)
          } finally {
            setDeleting(false)
          }
        }}
      />
    </section>
  )
}
