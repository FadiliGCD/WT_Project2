/**
 * Navbar.jsx
 * Primary navigation using React Router (relative paths — no env needed per Assignment 3 note).
 * External “marketing” link example uses REACT_APP_CLIENT_URL as required by the checklist.
 */

import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'

export function Navbar() {
  const { currentUser, logout } = useAppData()
  const base = process.env.REACT_APP_CLIENT_URL || ''

  return (
    <header className="site-header">
      <div className="nav-inner">
        <Link to="/" className="brand">
          Recipe Planner
        </Link>
        <nav className="nav-links" aria-label="Main">
          <Link to="/">Home</Link>
          <Link to="/recipes">Recipes</Link>
          <Link to="/add-recipe">Add recipe</Link>
          <Link to="/favourites">Favourites</Link>
          <Link to="/meal-plan">Meal plan</Link>
          <Link to="/profile">Profile</Link>
          {base ? (
            <a href={`${base}/recipes`}>Recipes (full URL demo)</a>
          ) : null}
          {currentUser ? (
            <>
              <span className="nav-user">Hi, {currentUser.username}</span>
              <button type="button" className="btn btn-ghost" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn btn-secondary">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
