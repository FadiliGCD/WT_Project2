/**
 * ASSIGNMENT 3 — VIEW 4: Create / publish recipe (Assignment 1 functionality 3).
 * Assignment 4: POST /api/recipes (session required).
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import { validateRecipeForm } from '../utils/clientValidation'

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
  const { addRecipe, currentUser } = useAppData()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState([])
  const [savedMsg, setSavedMsg] = useState('')

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
      const id = await addRecipe(payload)
      setSavedMsg('Recipe published.')
      setForm(emptyForm)
      setTimeout(() => navigate(`/recipes/${id}`), 400)
    } catch (err) {
      const body = err.body
      if (body && Array.isArray(body.errors)) setErrors(body.errors)
      else setErrors([err.message || 'Could not save recipe.'])
    }
  }

  return (
    <section className="page add-recipe-page">
      <div className="card">
        <h1>Add recipe</h1>
        <p className="hint">Client validation mirrors server rules; recipe is saved via POST /api/recipes.</p>
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
              Publish
            </button>
            <Link to="/recipes" className="btn btn-ghost">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </section>
  )
}
