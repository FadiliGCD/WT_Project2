// Assignment 4: bootstrap gate + API connectivity message.

import { Navbar } from './Navbar'
import { useAppData } from '../context/AppDataContext'

export function Layout({ children }) {
  const { bootstrapped, bootstrapError } = useAppData()

  if (!bootstrapped) {
    return (
      <>
        <Navbar />
        <main className="main-content">
          <p className="page">Loading application…</p>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="main-content">
        {bootstrapError && (
          <div className="card" role="alert" style={{ margin: '1rem', borderColor: 'var(--danger, #c00)' }}>
            <strong>Connection issue:</strong> {bootstrapError}
            <p className="hint">Make sure the backend server is running, then refresh the page.</p>
          </div>
        )}
        {children}
      </main>
      <footer className="site-footer">
        <p>Recipe Meal Planner.</p>
      </footer>
    </>
  )
}
