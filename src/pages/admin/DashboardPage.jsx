import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { countProducts } from '@/services/productService'
import { countOrders } from '@/services/orderService'
import { getCategoriesByStore } from '@/services/categoryService'
import { useToast } from '@/contexts/ToastContext'
import { copyText } from '@/utils/clipboard'
import { getPlan } from '@/utils/constants'
import { getCatalogUrl } from '@/utils/urls'

export default function DashboardPage() {
  const { store } = useAuth()
  const toast = useToast()
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      if (!store?.id) {
        setLoading(false)
        return
      }
      try {
        const [products, categories, orders] = await Promise.all([
          countProducts(store.id),
          getCategoriesByStore(store.id),
          countOrders(store.id),
        ])
        setStats({
          products,
          categories: categories.length,
          orders,
        })
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [store?.id])

  const catalogUrl = store?.slug ? getCatalogUrl(store.slug) : ''
  const plan = getPlan(store?.plan)

  return (
    <div>
      <h1 className="admin-page-title">Dashboard</h1>

      <div className="dev-notice" role="status">
        <span className="dev-notice-mark">DEV</span>
        <span>Modo desenvolvimento: dados salvos somente neste navegador.</span>
      </div>

      {/* Link do catálogo */}
      {catalogUrl && (
        <div className="card card-elevated mb-6" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div className="card-body flex items-center justify-between gap-4" style={{ flexWrap: 'wrap' }}>
            <div>
              <p className="text-sm font-semibold">Link do seu catálogo</p>
              <p className="text-sm text-secondary mt-1">{catalogUrl}</p>
              <p className="text-xs text-secondary mt-1">Plano atual: {plan.name}</p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                copyText(catalogUrl)
                  .then(() => toast.success('Link copiado para a área de transferência'))
                  .catch(() => toast.warning('Não foi possível copiar automaticamente. Selecione o link manualmente.'))
              }}
            >
              Copiar link
            </button>
          </div>
        </div>
      )}

      {/* Cards de estatísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-card-label">Total de Produtos</span>
          <span className="stat-card-value">{loading ? '...' : stats.products}</span>
          <span className="stat-card-change positive">Cadastrados</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Categorias</span>
          <span className="stat-card-value">{loading ? '...' : stats.categories}</span>
          <span className="stat-card-change positive">Ativas</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Pedidos Recebidos</span>
          <span className="stat-card-value">{loading ? '...' : stats.orders}</span>
          <span className="stat-card-change positive">Total</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Status</span>
          <span className="stat-card-value" style={{ fontSize: '1.5rem', color: store?.active ? 'var(--color-success)' : 'var(--color-error)' }}>
            {store?.active ? 'Ativo' : 'Inativo'}
          </span>
          <span className="stat-card-change">Catálogo {store?.active ? 'visível' : 'oculto'}</span>
        </div>
      </div>

      {/* Dicas rápidas */}
      {stats.products === 0 && !loading && (
        <div className="empty-state mt-8">
          <div className="empty-state-icon">+</div>
          <h3 className="empty-state-title">Comece agora!</h3>
          <p className="empty-state-text">
            Seu catálogo está criado. Adicione seus primeiros produtos para que seus clientes possam vê-los.
          </p>
          <a href="/admin/products" className="btn btn-primary">
            Adicionar primeiro produto
          </a>
        </div>
      )}
    </div>
  )
}
