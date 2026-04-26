/**
 * ASSIGNMENT 3 — VIEW 1: Landing / home page (Assignment 1: entry point, orient user).
 * Intended backend: none required; links route to React pages. Marketing URL pattern:
 *   `${process.env.REACT_APP_CLIENT_URL}/recipes`
 * No HTTP requests are performed (Assignment 3 requirement).
 */

import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'

export function HomePage() {
  const { currentUser } = useAppData()

  return (
    <section className="page home-page">
      <div className="hero-card card">
        <h1>Plan meals. Share recipes.</h1>
        <p className="lead">
          Discover dishes, save favourites, and lay out your week — one calm place for home
          cooks (Assignment 1 vision).
        </p>
        <div className="hero-actions">
          <Link to="/recipes" className="btn btn-primary">
            Browse recipes
          </Link>
          {!currentUser && (
            <Link to="/auth" className="btn btn-secondary">
              Create account
            </Link>
          )}
          {currentUser && (
            <Link to="/meal-plan" className="btn btn-secondary">
              Open meal plan
            </Link>
          )}
        </div>
      </div>
      <ul className="feature-list">
        <li>Browse &amp; search (mock data)</li>
        <li>Add recipes with client validation</li>
        <li>Favourites &amp; weekly planner (local state)</li>
      </ul>
    </section>
  )
}
