import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'

// Páginas de autenticação
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

// Páginas do admin
import AdminLayout from '@/layouts/AdminLayout'
import DashboardPage from '@/pages/admin/DashboardPage'
import ProductsPage from '@/pages/admin/ProductsPage'
import CategoriesPage from '@/pages/admin/CategoriesPage'
import SettingsPage from '@/pages/admin/SettingsPage'
import LayoutPage from '@/pages/admin/LayoutPage'
import OrdersPage from '@/pages/admin/OrdersPage'

// Páginas do catálogo público
import CatalogPage from '@/pages/catalog/CatalogPage'

// Páginas do super admin
import SuperDashboard from '@/pages/superadmin/SuperDashboard'

/* Rota protegida: redireciona para login se não estiver autenticado */
function ProtectedRoute({ requiredRole }) {
  const { isAuthenticated, loading, userData } = useAuth()

  if (loading) return <LoadingSpinner text="Carregando..." />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (requiredRole === 'superadmin' && userData?.role !== 'superadmin') {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}

/* Rota pública: redireciona para admin se já estiver autenticado */
function PublicRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner text="Carregando..." />
  if (isAuthenticated) {
    const demoDestination = sessionStorage.getItem('catalog_demo_destination')
    if (demoDestination && (location.pathname === '/login' || location.pathname === '/register')) {
      return <Navigate to={demoDestination} replace />
    }
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas (login/registro) */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Rotas protegidas do admin */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="layout" element={<LayoutPage />} />
          <Route path="orders" element={<OrdersPage />} />
        </Route>
      </Route>

      {/* Rotas protegidas do super admin */}
      <Route element={<ProtectedRoute requiredRole="superadmin" />}>
        <Route path="/super" element={<AdminLayout />}>
          <Route index element={<SuperDashboard />} />
          <Route path="stores" element={<SuperDashboard />} />
        </Route>
      </Route>

      {/* Catálogo público (qualquer pessoa acessa) */}
      <Route path="/:slug" element={<CatalogPage />} />

      {/* Rota raiz redireciona para login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
