import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { countProducts } from '@/services/productService'
import { countOrders, getOrdersByStore } from '@/services/orderService'
import { getProductsByStore } from '@/services/productService'
import { getCategoriesByStore } from '@/services/categoryService'
import { useToast } from '@/contexts/ToastContext'
import { copyText } from '@/utils/clipboard'
import { getPlan } from '@/utils/constants'
import { getCatalogUrl } from '@/utils/urls'
import { formatCurrency } from '@/utils/formatters'

export default function DashboardPage() {
  const { store } = useAuth()
  const toast = useToast()
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    pendingOrders: 0,
    revenue: 0,
    averageTicket: 0,
    topProduct: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      if (!store?.id) {
        setLoading(false)
        return
      }
      try {
        const [products, categories, orders, productList] = await Promise.all([
          countProducts(store.id),
          getCategoriesByStore(store.id),
          countOrders(store.id),
          getProductsByStore(store.id),
        ])
        const orderList = await getOrdersByStore(store.id)
        const validOrders = orderList.filter(order => (order.status || 'pending') !== 'cancelled')
        const revenue = validOrders.reduce((sum, order) => sum + Number(order.total || 0), 0)
        const itemCounts = validOrders.flatMap(order => order.items || []).reduce((acc, item) => {
          acc[item.name] = (acc[item.name] || 0) + Number(item.quantity || 0)
          return acc
        }, {})
        const topProductName = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
        setStats({
          products,
          categories: categories.length,
          orders,
          pendingOrders: orderList.filter(order => !['delivered', 'cancelled'].includes(order.status || 'pending')).length,
          revenue,
          averageTicket: validOrders.length ? revenue / validOrders.length : 0,
          topProduct: topProductName || productList[0]?.name || '—',
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

      <div className="business-metrics-grid">
        <div className="business-metric-card">
          <span className="business-metric-label">Faturamento estimado</span>
          <strong>{loading ? '...' : formatCurrency(stats.revenue)}</strong>
          <small>Pedidos não cancelados</small>
        </div>
        <div className="business-metric-card">
          <span className="business-metric-label">Ticket médio</span>
          <strong>{loading ? '...' : formatCurrency(stats.averageTicket)}</strong>
          <small>Valor médio por pedido</small>
        </div>
        <div className="business-metric-card">
          <span className="business-metric-label">Aguardando atendimento</span>
          <strong>{loading ? '...' : stats.pendingOrders}</strong>
          <small>Pedidos em andamento</small>
        </div>
        <div className="business-metric-card">
          <span className="business-metric-label">Produto em destaque</span>
          <strong className="business-metric-product">{loading ? '...' : stats.topProduct}</strong>
          <small>Mais procurado no histórico</small>
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
