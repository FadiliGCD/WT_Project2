// Assignment 4: static entry; other views load data from /api when visited.
import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'

export function HomePage() {
  const { currentUser } = useAppData()

  return (
    <section className="page home-page">
      <div className="hero-card card">
        <h1>Plan meals. Share recipes.</h1>
        <p className="lead">
          Discover dishes, save favourites, and lay out your week, one calm place for home
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
        <li>Browse &amp; search recipes from the API</li>
        <li>Add recipes with client and server validation</li>
        <li>Favourites &amp; weekly meal plan persisted on the server</li>
      </ul>
    </section>
  )
}
