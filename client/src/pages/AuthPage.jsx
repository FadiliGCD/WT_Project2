// Assignment 4: POST /api/auth/login and /api/auth/register with session cookie.

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'
import { validateLogin, validateRegister } from '../utils/clientValidation'

function formatApiError(err) {
  const body = err.body
  if (body && Array.isArray(body.errors)) return body.errors
  if (body && Array.isArray(body.error)) return [body.error]
  if (typeof body?.error === 'string') return [body.error]
  return [err.message || 'Request failed.']
}

export function AuthPage() {
  const navigate = useNavigate()
  const { login, register } = useAppData()
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

  const handleLogin = async (e) => {
    e.preventDefault()
    setSuccess('')
    const v = validateLogin(loginForm)
    setErrors(v)
    if (v.length) return
    try {
      await login(loginForm.username.trim(), loginForm.password)
      setSuccess('Welcome back!')
      setTimeout(() => navigate('/recipes'), 400)
    } catch (err) {
      setErrors(formatApiError(err))
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setSuccess('')
    const v = validateRegister(registerForm)
    setErrors(v)
    if (v.length) return
    try {
      await register({
        username: registerForm.username.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
        confirmPassword: registerForm.confirmPassword,
      })
      setSuccess('Account created. You are now logged in.')
      setTimeout(() => navigate('/recipes'), 400)
    } catch (err) {
      setErrors(formatApiError(err))
    }
  }

  return (
    <section className="page auth-page">
      <div className="card auth-card">
        <h1>{mode === 'login' ? 'Log in' : 'Register'}</h1>
        <p className="hint">
          Session-based auth via <code>/api/auth/{mode === 'login' ? 'login' : 'register'}</code>.
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
