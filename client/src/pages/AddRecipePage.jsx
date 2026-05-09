/**
 * ASSIGNMENT 3 — VIEW 4: Create / publish recipe (Assignment 1 functionality 3).
 * Assignment 4: POST /api/recipes (session required).
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import { validateRecipeForm } from '../utils/clientValidation'
import { apiFetch } from '../api/http'
import { normalizeRecipe } from '../utils/recipeShape'

const emptyForm = {
  title: '',
  category: 'General',
  dietaryTags: '',
  prepTimeMinutes: '15',
  cookTimeMinutes: '20',
  servings: '4',
  ingredients: '',
  instructions: '',
}

export function AddRecipePage() {
  const navigate = useNavigate()
  const { id: editId } = useParams()
  const { addRecipe, updateRecipe, currentUser, mergeRecipe, bootstrapped } = useAppData()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState([])
  const [savedMsg, setSavedMsg] = useState('')
  const [loadError, setLoadError] = useState(null)
  const [loadingRecipe, setLoadingRecipe] = useState(Boolean(editId))

  useEffect(() => {
    if (!editId) {
      setLoadingRecipe(false)
      return
    }
    if (!bootstrapped) return

    let cancelled = false
    setLoadError(null)
    setLoadingRecipe(true)
    ;(async () => {
      try {
        if (!currentUser) {
          if (!cancelled) {
            setLoadError('Please log in to edit recipes.')
            setLoadingRecipe(false)
          }
          return
        }
        const raw = await apiFetch(`/api/recipes/${encodeURIComponent(editId)}`)
        if (cancelled) return
        mergeRecipe(raw)
        const r = normalizeRecipe(raw)
        if (String(r.authorId) !== String(currentUser.id)) {
          setLoadError('You can only edit your own recipes.')
          return
        }
        setForm({
          title: r.title ?? '',
          category: r.category ?? 'General',
          dietaryTags: r.dietaryTags ?? '',
          prepTimeMinutes: String(r.prepTimeMinutes ?? 15),
          cookTimeMinutes: String(r.cookTimeMinutes ?? 20),
          servings: String(r.servings ?? 4),
          ingredients: r.ingredients ?? '',
          instructions: r.instructions ?? '',
        })
      } catch (e) {
        if (!cancelled) setLoadError(e.message || 'Could not load recipe.')
      } finally {
        if (!cancelled) setLoadingRecipe(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [editId, bootstrapped, currentUser, mergeRecipe])

  const onSubmit = async (e) => {
    e.preventDefault()
    setSavedMsg('')
    const v = validateRecipeForm({
      ...form,
      prepTimeMinutes: form.prepTimeMinutes,
      cookTimeMinutes: form.cookTimeMinutes,
      servings: form.servings,
    })
    setErrors(v)
    if (v.length) return
    if (!currentUser) {
      setErrors(['Please log in first.'])
      return
    }
    const payload = {
      title: form.title.trim(),
      category: form.category.trim() || 'General',
      dietaryTags: form.dietaryTags.trim(),
      prepTimeMinutes: Number(form.prepTimeMinutes),
      cookTimeMinutes: Number(form.cookTimeMinutes),
      servings: Number(form.servings),
      ingredients: form.ingredients.trim(),
      instructions: form.instructions.trim(),
    }
    try {
      if (editId) {
        await updateRecipe(editId, payload)
        setSavedMsg('Recipe updated.')
        setTimeout(() => navigate(`/recipes/${editId}`), 400)
      } else {
        const id = await addRecipe(payload)
        setSavedMsg('Recipe published.')
        setForm(emptyForm)
        setTimeout(() => navigate(`/recipes/${id}`), 400)
      }
    } catch (err) {
      const body = err.body
      if (body && Array.isArray(body.errors)) setErrors(body.errors)
      else setErrors([err.message || 'Could not save recipe.'])
    }
  }

  if (editId && loadError) {
    return (
      <section className="page add-recipe-page">
        <div className="card">
          <p role="alert">{loadError}</p>
          <Link to="/recipes" className="btn btn-ghost">
            Back to recipes
          </Link>
        </div>
      </section>
    )
  }

  if (editId && loadingRecipe) {
    return (
      <section className="page add-recipe-page">
        <p>Loading recipe…</p>
      </section>
    )
  }

  return (
    <section className="page add-recipe-page">
      <div className="card">
        <h1>{editId ? 'Edit recipe' : 'Add recipe'}</h1>
        <p className="hint">
          {editId
            ? 'Update your recipe and save your changes.'
            : 'Fill in the details below. Your recipe is validated before it is saved.'}
        </p>
        {errors.length > 0 && (
          <ul className="error-list" role="alert">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        )}
        {savedMsg && <p className="success-msg">{savedMsg}</p>}
        <form onSubmit={onSubmit} className="stack recipe-form">
          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </label>
          <div className="stack-horizontal">
            <label>
              Category
              <input
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              />
            </label>
            <label>
              Dietary tags
              <input
                value={form.dietaryTags}
                onChange={(e) => setForm((f) => ({ ...f, dietaryTags: e.target.value }))}
              />
            </label>
          </div>
          <div className="stack-horizontal">
            <label>
              Prep (min)
              <input
                type="number"
                min={0}
                value={form.prepTimeMinutes}
                onChange={(e) => setForm((f) => ({ ...f, prepTimeMinutes: e.target.value }))}
              />
            </label>
            <label>
              Cook (min)
              <input
                type="number"
                min={0}
                value={form.cookTimeMinutes}
                onChange={(e) => setForm((f) => ({ ...f, cookTimeMinutes: e.target.value }))}
              />
            </label>
            <label>
              Servings
              <input
                type="number"
                min={1}
                value={form.servings}
                onChange={(e) => setForm((f) => ({ ...f, servings: e.target.value }))}
              />
            </label>
          </div>
          <label>
            Ingredients
            <textarea
              rows={5}
              value={form.ingredients}
              onChange={(e) => setForm((f) => ({ ...f, ingredients: e.target.value }))}
            />
          </label>
          <label>
            Instructions
            <textarea
              rows={6}
              value={form.instructions}
              onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
            />
          </label>
          <div className="card-actions">
            <button type="submit" className="btn btn-primary">
              {editId ? 'Save changes' : 'Publish'}
            </button>
            <Link to={editId ? `/recipes/${editId}` : '/recipes'} className="btn btn-ghost">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </section>
  )
}
