const configuredApiBase = typeof process !== 'undefined' && process.env.API_BASE
  ? process.env.API_BASE
  : typeof window !== 'undefined' && window.__API_BASE__
    ? window.__API_BASE__
    : ''

export const API_BASE = configuredApiBase.replace(/\/+$/, '')

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${normalizedPath}`
}
