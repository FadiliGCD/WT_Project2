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
            <p className="hint">Start the API (e.g. <code>npm start</code> in <code>server/</code>) and use Vite dev proxy for <code>/api</code>.</p>
          </div>
        )}
        {children}
      </main>
      <footer className="site-footer">
        <p>
          Recipe Meal Planner — WT Assignment 4. API: same-origin <code>/api</code>
          {process.env.REACT_APP_API_URL ? (
            <>
              {' '}
              or <code>{process.env.REACT_APP_API_URL}</code>
            </>
          ) : null}
          .
        </p>
      </footer>
    </>
  )
}
