const appBaseUrl = import.meta.env.BASE_URL || '/'

export function getAppPath(path = '') {
  const cleanPath = String(path).replace(/^\/+/, '')
  return `${appBaseUrl}${cleanPath}`
}

export function getCatalogPath(slug) {
  return getAppPath(slug)
}

export function getCatalogUrl(slug) {
  return `${window.location.origin}${getCatalogPath(slug)}`
}
