// Assignment 4: static entry; other views load data from /api when visited.
import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'

export function HomePage() {
  const { currentUser } = useAppData()

  return (
    <section className="page home-page">
      {currentUser && (
        <p className="home-greeting" role="status">
          Welcome back, <strong>{currentUser.username}</strong>
        </p>
      )}
      <div className="hero-card card">
        <h1>Plan meals. Share recipes.</h1>
        <p className="lead">
          Discover new dishes, save your favourites, and organise the whole week in one calm
          place made for home cooks.
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
        <li>Browse and search a growing collection of recipes</li>
        <li>Add your own recipes with quick, friendly validation</li>
        <li>Save favourites and lay out your weekly meal plan</li>
      </ul>
    </section>
  )
}
