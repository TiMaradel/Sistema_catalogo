import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function Sidebar({ isOpen, onClose }) {
  const { store, isSuperAdmin } = useAuth()

  const adminLinks = [
    { to: '/admin', icon: '01', label: 'Visão geral', end: true },
    { to: '/admin/products', icon: '02', label: 'Produtos' },
    { to: '/admin/categories', icon: '03', label: 'Categorias' },
    { to: '/admin/orders', icon: '04', label: 'Pedidos' },
    { to: '/admin/layout', icon: '05', label: 'Aparência' },
    { to: '/admin/settings', icon: '06', label: 'Configurações' },
  ]

  const superAdminLinks = [
    { to: '/super', icon: 'M', label: 'Painel Master', end: true },
    { to: '/super/stores', icon: 'L', label: 'Gerenciar lojas' },
  ]

  return (
    <>
      <div className={`mobile-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose}></div>
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">C</div>
          <span className="sidebar-logo-text">CatálogoDigital</span>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-title">Meu Catálogo</span>
          {adminLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}

          {isSuperAdmin && (
            <>
              <span className="sidebar-section-title" style={{ marginTop: '16px' }}>
                Plataforma
              </span>
              {superAdminLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="sidebar-link-icon">{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          {store && (
            <a
              href={`/${store.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="sidebar-link"
              style={{ color: '#FF6B00' }}
            >
              <span className="sidebar-link-icon">↗</span>
              Ver catálogo público
            </a>
          )}
        </div>
      </aside>
    </>
  )
}
