// JSON API calls with session cookie
export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  const base = (typeof process !== 'undefined' && process.env.REACT_APP_API_URL
    ? String(process.env.REACT_APP_API_URL)
    : ''
  ).replace(/\/$/, '')
  if (!base) return p
  return `${base}${p}`
}

export async function apiFetch(path, options = {}) {
  const headers = { ...options.headers }
  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  const res = await fetch(apiUrl(path), {
    ...options,
    credentials: 'include',
    headers,
  })
  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }
  if (!res.ok) {
    const err = new Error(typeof data === 'object' && data?.error ? data.error : res.statusText)
    err.status = res.status
    err.body = data
    throw err
  }
  return data
}
