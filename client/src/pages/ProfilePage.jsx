/**
 * ASSIGNMENT 3 — VIEW 7: Profile & my recipes (Assignment 1 functionality 6).
 * Intended backend: user document + GET recipes filtered by author (web: /profile).
 * Here we filter mock `recipes` where authorUsername matches current user.
 */

import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'

export function ProfilePage() {
  const { currentUser, recipes } = useAppData()

  if (!currentUser) {
    return (
      <section className="page">
        <div className="card">
          <h1>Profile</h1>
          <p>Log in to see your recipes.</p>
          <Link to="/auth" className="btn btn-primary">
            Log in
          </Link>
        </div>
      </section>
    )
  }

  const mine = recipes.filter((r) => r.authorUsername === currentUser.username)

  return (
    <section className="page profile-page">
      <div className="card profile-header">
        <h1>Profile</h1>
        <p>
          <strong>{currentUser.username}</strong>
        </p>
        <p className="hint">
          Future: session from <code>POST .../api/auth/login</code>; list from filtered{' '}
          <code>/api/recipes</code> or profile endpoint.
        </p>
        <Link to="/add-recipe" className="btn btn-primary">
          Add recipe
        </Link>
      </div>
      <h2>My recipes</h2>
      <ul className="recipe-grid">
        {mine.map((r) => (
          <li key={r._id} className="recipe-card card">
            <h3>
              <Link to={`/recipes/${r._id}`}>{r.title}</Link>
            </h3>
            <p className="meta">{r.category}</p>
          </li>
        ))}
      </ul>
      {mine.length === 0 && (
        <p className="empty-state">You have not added any recipes yet.</p>
      )}
    </section>
  )
}
