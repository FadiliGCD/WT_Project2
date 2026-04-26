/**
 * Layout.jsx
 * Shared chrome: navigation + main landmark for accessibility.
 */

import { Navbar } from './Navbar'

/**
 * @param {{ children: import('react').ReactNode }} props
 */
export function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="main-content">{children}</main>
      <footer className="site-footer">
        <p>
          Recipe Meal Planner — WT Assignment 3 (client prototype). API base for future
          integration:{' '}
          <code>{process.env.REACT_APP_API_URL || '(set REACT_APP_API_URL in .env)'}</code>
        </p>
      </footer>
    </>
  )
}
