import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getCatalogPath } from '@/utils/urls'
import {
  DashboardIcon,
  ProductsIcon,
  CategoriesIcon,
  OrdersIcon,
  AppearanceIcon,
  SettingsIcon,
  ExternalLinkIcon,
  SuperAdminIcon,
  StoresIcon,
} from '@/components/common/Icons'

export default function Sidebar({ isOpen, onClose }) {
  const { store, isSuperAdmin } = useAuth()

  const adminLinks = [
    { to: '/admin', icon: <DashboardIcon />, label: 'Visão geral', end: true },
    { to: '/admin/products', icon: <ProductsIcon />, label: 'Produtos' },
    { to: '/admin/categories', icon: <CategoriesIcon />, label: 'Categorias' },
    { to: '/admin/orders', icon: <OrdersIcon />, label: 'Pedidos' },
    { to: '/admin/layout', icon: <AppearanceIcon />, label: 'Aparência' },
    { to: '/admin/settings', icon: <SettingsIcon />, label: 'Configurações' },
  ]

  const superAdminLinks = [
    { to: '/super', icon: <SuperAdminIcon />, label: 'Painel Master', end: true },
    { to: '/super/stores', icon: <StoresIcon />, label: 'Gerenciar lojas' },
  ]

  return (
    <>
      <div className={`mobile-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
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
              href={getCatalogPath(store.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="sidebar-link"
              style={{ color: 'var(--color-primary-light)' }}
            >
              <span className="sidebar-link-icon">
                <ExternalLinkIcon />
              </span>
              Ver catálogo público
            </a>
          )}
        </div>
      </aside>
    </>
  )
}
