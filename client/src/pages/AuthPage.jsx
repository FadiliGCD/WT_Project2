/**
 * ASSIGNMENT 3 — VIEW 2: Authentication (Assignment 1 functionality 1 — register & login).
 * Intended backend mapping:
 *   POST `${process.env.REACT_APP_API_URL}/api/auth/register`
 *   POST `${process.env.REACT_APP_API_URL}/api/auth/login`
 *   POST `/logout` (web) or session cookie clear — not invoked here per A3.
 * Submit handlers only update React context after client-side validation passes.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import { validateLogin, validateRegister } from '../utils/clientValidation'

export function AuthPage() {
  const navigate = useNavigate()
  const { login } = useAppData()
  const [mode, setMode] = useState('login')
  const [errors, setErrors] = useState([])
  const [success, setSuccess] = useState('')
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleLogin = (e) => {
    e.preventDefault()
    setSuccess('')
    const v = validateLogin(loginForm)
    setErrors(v)
    if (v.length) return
    login(loginForm.username.trim())
    setSuccess('Welcome back! (mock session — no API call)')
    setTimeout(() => navigate('/recipes'), 600)
  }

  const handleRegister = (e) => {
    e.preventDefault()
    setSuccess('')
    const v = validateRegister(registerForm)
    setErrors(v)
    if (v.length) return
    login(registerForm.username.trim())
    setSuccess('Account created locally. (mock — no API call)')
    setTimeout(() => navigate('/recipes'), 600)
  }

  return (
    <section className="page auth-page">
      <div className="card auth-card">
        <h1>{mode === 'login' ? 'Log in' : 'Register'}</h1>
        <p className="hint">
          Client validation only. Intended API:{' '}
          <code>
            {process.env.REACT_APP_API_URL || 'REACT_APP_API_URL'}/api/auth/
            {mode === 'login' ? 'login' : 'register'}
          </code>
        </p>
        <div className="tab-row" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={mode === 'login' ? 'tab active' : 'tab'}
            onClick={() => {
              setMode('login')
              setErrors([])
              setSuccess('')
            }}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={mode === 'register' ? 'tab active' : 'tab'}
            onClick={() => {
              setMode('register')
              setErrors([])
              setSuccess('')
            }}
          >
            Register
          </button>
        </div>
        {errors.length > 0 && (
          <ul className="error-list" role="alert">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        )}
        {success && <p className="success-msg">{success}</p>}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="stack">
            <label>
              Username
              <input
                name="username"
                autoComplete="username"
                value={loginForm.username}
                onChange={(e) => setLoginForm((f) => ({ ...f, username: e.target.value }))}
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
              />
            </label>
            <button type="submit" className="btn btn-primary">
              Log in
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="stack">
            <label>
              Username
              <input
                name="username"
                value={registerForm.username}
                onChange={(e) =>
                  setRegisterForm((f) => ({ ...f, username: e.target.value }))
                }
              />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))}
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm((f) => ({ ...f, password: e.target.value }))
                }
              />
            </label>
            <label>
              Confirm password
              <input
                name="confirmPassword"
                type="password"
                value={registerForm.confirmPassword}
                onChange={(e) =>
                  setRegisterForm((f) => ({ ...f, confirmPassword: e.target.value }))
                }
              />
            </label>
            <button type="submit" className="btn btn-primary">
              Register
            </button>
          </form>
        )}
        <p className="footer-link">
          <Link to="/">← Back home</Link>
        </p>
      </div>
    </section>
  )
}
