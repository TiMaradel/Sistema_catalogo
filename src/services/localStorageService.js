const STORAGE_ERROR_MESSAGE = 'O armazenamento local está cheio ou indisponível. Remova alguns dados do navegador e tente novamente.'

export function readLocalData(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function writeLocalData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    throw new Error(STORAGE_ERROR_MESSAGE)
  }
}

export function removeLocalData(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    throw new Error(STORAGE_ERROR_MESSAGE)
  }
}

export function generateLocalId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
