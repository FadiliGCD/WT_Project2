/**
 * ASSIGNMENT 3 — VIEW: Recipe detail (Assignment 1 — view full recipe, save, plan).
 * Intended backend:
 *   GET `${process.env.REACT_APP_API_URL}/api/recipes/:id`
 *   POST `${process.env.REACT_APP_API_URL}/api/favourites` (body: recipeId)
 * Data resolved from shared mock context by route param.
 */

import { Link, useParams } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'

export function RecipeDetailPage() {
  const { id } = useParams()
  const { recipes, favouriteIds, toggleFavourite, currentUser } = useAppData()
  const recipe = recipes.find((r) => r._id === id)

  if (!recipe) {
    return (
      <section className="page">
        <p>Recipe not found.</p>
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
            onClick={() => toggleFavourite(recipe._id)}
          >
            {favouriteIds.has(recipe._id) ? 'Remove from favourites' : 'Add to favourites'}
          </button>
        )}
      </div>
    </article>
  )
}
