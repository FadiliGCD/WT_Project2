// Assignment 4: GET /api/recipes/:id when not already in context (deep link / refresh).
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiFetch } from '../api/http'
import { useAppData } from '../context/AppDataContext'

export function RecipeDetailPage() {
  const { id } = useParams()
  const { recipes, favouriteIds, toggleFavourite, currentUser, mergeRecipe } = useAppData()
  const [loadError, setLoadError] = useState(null)
  const [loading, setLoading] = useState(false)

  const hasRecipe = useMemo(() => recipes.some((r) => r._id === id), [recipes, id])
  const recipe = recipes.find((r) => r._id === id)

  useEffect(() => {
    if (!id || hasRecipe) return
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    ;(async () => {
      try {
        const raw = await apiFetch(`/api/recipes/${encodeURIComponent(id)}`)
        if (cancelled) return
        mergeRecipe(raw)
      } catch (e) {
        if (!cancelled) setLoadError(e.message || 'Not found')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, hasRecipe, mergeRecipe])

  if (loading && !recipe) {
    return (
      <section className="page">
        <p>Loading recipe…</p>
      </section>
    )
  }

  if (!recipe) {
    return (
      <section className="page">
        <p>{loadError || 'Recipe not found.'}</p>
        <Link to="/recipes">Back to list</Link>
      </section>
    )
  }

  return (
    <article className="page recipe-detail card">
      <header>
        <h1>{recipe.title}</h1>
        <p className="meta">
          By {recipe.authorUsername} · {recipe.category} · Prep {recipe.prepTimeMinutes}m · Cook{' '}
          {recipe.cookTimeMinutes}m
        </p>
      </header>
      {recipe.dietaryTags && <p className="tags">Dietary: {recipe.dietaryTags}</p>}
      <section>
        <h2>Ingredients</h2>
        <pre className="recipe-body">{recipe.ingredients}</pre>
      </section>
      <section>
        <h2>Instructions</h2>
        <pre className="recipe-body">{recipe.instructions}</pre>
      </section>
      <div className="card-actions">
        <Link to="/recipes" className="btn btn-ghost">
          ← All recipes
        </Link>
        {currentUser && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={async () => {
              try {
                await toggleFavourite(recipe._id)
              } catch (e) {
                window.alert(e.message || 'Could not update favourites')
              }
            }}
          >
            {favouriteIds.has(recipe._id) ? 'Remove from favourites' : 'Add to favourites'}
          </button>
        )}
      </div>
    </article>
  )
}
