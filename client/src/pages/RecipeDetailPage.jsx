// Assignment 4: GET /api/recipes/:id when not already in context (deep link / refresh).
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiFetch } from '../api/http'
import { useAppData } from '../context/AppDataContext'
import { ConfirmDialog } from '../components/ConfirmDialog'

export function RecipeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    recipes,
    favouriteIds,
    toggleFavourite,
    currentUser,
    mergeRecipe,
    deleteRecipe,
  } = useAppData()
  const [loadError, setLoadError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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

  const isOwner = Boolean(currentUser && recipe.authorId && currentUser.id === recipe.authorId)
  const ingredientsText =
    recipe.ingredients != null && String(recipe.ingredients).trim()
      ? String(recipe.ingredients).trim()
      : null

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
        {ingredientsText ? (
          <pre className="recipe-body">{ingredientsText}</pre>
        ) : (
          <p className="hint">
            No ingredients on file for this recipe.
            {isOwner && (
              <>
                {' '}
                <Link to={`/recipes/${recipe._id}/edit`}>Add ingredients</Link>.
              </>
            )}
          </p>
        )}
      </section>
      <section>
        <h2>Instructions</h2>
        <pre className="recipe-body">{recipe.instructions}</pre>
      </section>
      <div className="card-actions">
        <Link to="/recipes" className="btn btn-ghost">
          ← All recipes
        </Link>
        {isOwner && (
          <>
            <Link to={`/recipes/${recipe._id}/edit`} className="btn btn-primary">
              Edit recipe
            </Link>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setDeleteError('')
                setConfirmOpen(true)
              }}
            >
              Delete recipe
            </button>
          </>
        )}
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
      {deleteError && (
        <p className="error-list" role="alert" style={{ marginTop: '1rem' }}>
          {deleteError}
        </p>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete recipe?"
        message={`“${recipe.title}” will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Keep recipe"
        destructive
        busy={deleting}
        onCancel={() => {
          if (!deleting) setConfirmOpen(false)
        }}
        onConfirm={async () => {
          setDeleting(true)
          setDeleteError('')
          try {
            await deleteRecipe(recipe._id)
            setConfirmOpen(false)
            navigate('/recipes')
          } catch (e) {
            setDeleteError(e.message || 'Could not delete recipe')
            setConfirmOpen(false)
          } finally {
            setDeleting(false)
          }
        }}
      />
    </article>
  )
}
