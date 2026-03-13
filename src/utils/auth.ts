export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('whatIveDone_user') || 'null')
  } catch {
    return null
  }
}

export function isLoggedIn() {
  return !!getUser()
}

export function setUser(userInfo: Record<string, any>) {
  localStorage.setItem('whatIveDone_user', JSON.stringify(userInfo))
}

export function clearUser() {
  localStorage.removeItem('whatIveDone_user')
}