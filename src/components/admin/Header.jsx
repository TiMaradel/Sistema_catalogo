import { useAuth } from '@/contexts/AuthContext'
import { logoutUser } from '@/services/authService'
import { useNavigate } from 'react-router-dom'
import { getCatalogPath } from '@/utils/urls'

export default function Header({ onMenuToggle }) {
  const { userData, store } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logoutUser()
    navigate('/login')
  }

  return (
    <header className="admin-header">
      <div className="flex items-center gap-4">
        <button className="hamburger" onClick={onMenuToggle} aria-label="Abrir menu">
          <span aria-hidden="true">☰</span>
        </button>
        <div className="header-store-context">
          <h2 className="header-store-name" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            {store?.name || 'Meu Catálogo'}
          </h2>
          {store?.slug && (
            <p className="text-xs text-secondary">
              /{store.slug}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {store?.slug && (
          <a
            href={getCatalogPath(store.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.75rem' }}
          >
            ↗ Ver catálogo
          </a>
        )}
        <div className="flex items-center gap-2">
          <div
            className="header-user-avatar"
            style={{
              width: 32, height: 32,
              background: 'var(--color-primary)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '0.8rem',
            }}
          >
            {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
