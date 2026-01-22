const USER_KEY = 'inventorygo.auth.user'

function normalizeAuth(raw) {
  if (!raw) return null
  if (raw.user && typeof raw.user === 'object') {
    return {
      user: raw.user,
      token: raw.token ? String(raw.token) : null,
    }
  }

  // Backward compatibility: old storage was just the user object.
  if (typeof raw === 'object') {
    return { user: raw, token: null }
  }

  return null
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    const auth = normalizeAuth(parsed)
    return auth?.user ?? null
  } catch {
    return null
  }
}

export function getToken() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    const auth = normalizeAuth(parsed)
    return auth?.token ?? null
  } catch {
    return null
  }
}

export function saveAuth(value) {
  if (!value) return

  // Allow either (a) { user, token } or (b) just user (legacy)
  const auth = normalizeAuth(value) || { user: value, token: null }
  if (!auth?.user) return

  localStorage.setItem(USER_KEY, JSON.stringify(auth))
}

export function clearAuth() {
  localStorage.removeItem(USER_KEY)
}

export function hasAuth() {
  return Boolean(getUser())
}
