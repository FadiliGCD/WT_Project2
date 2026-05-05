// Assignment 4: GET /api/favourites + local recipe list for links.

import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'

export function FavouritesPage() {
  const { recipes, favouriteIds, toggleFavourite, currentUser } = useAppData()
  const saved = recipes.filter((r) => favouriteIds.has(r._id))

  if (!currentUser) {
    return (
      <section className="page">
        <div className="card">
          <h1>Favourites</h1>
          <p>Log in to manage saved recipes.</p>
          <Link to="/auth" className="btn btn-primary">
            Go to login
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="page favourites-page">
      <h1>My favourites</h1>
      <p className="hint">Saved recipes from GET /api/favourites.</p>
      <ul className="recipe-grid">
        {saved.map((r) => (
          <li key={r._id} className="recipe-card card">
            <h2>
              <Link to={`/recipes/${r._id}`}>{r.title}</Link>
            </h2>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={async () => {
                try {
                  await toggleFavourite(r._id)
                } catch (e) {
                  window.alert(e.message || 'Could not remove favourite')
                }
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      {saved.length === 0 && <p className="empty-state">No saved recipes yet. Add some from the recipe list.</p>}
    </section>
  )
}
