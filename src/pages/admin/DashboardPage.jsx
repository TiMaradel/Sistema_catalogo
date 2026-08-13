import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getOrdersByStore } from '@/services/orderService'
import { getProductsByStore } from '@/services/productService'
import { getCategoriesByStore } from '@/services/categoryService'
import { useToast } from '@/contexts/ToastContext'
import { copyText } from '@/utils/clipboard'
import { getPlan } from '@/utils/constants'
import { getCatalogUrl } from '@/utils/urls'
import { formatCurrency } from '@/utils/formatters'
import { PlusCircleIcon } from '@/components/common/Icons'

/* Agrupa pedidos por dia (últimos N dias) */
function buildDailyChart(orders, days = 7) {
  const result = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(now.getDate() - i)
    const key = date.toISOString().slice(0, 10) // YYYY-MM-DD

    const count = orders.filter(o => {
      const created = o.createdAt?.seconds
        ? new Date(o.createdAt.seconds * 1000)
        : o.createdAt ? new Date(o.createdAt) : null
      return created && created.toISOString().slice(0, 10) === key
    }).length

    const label = date.toLocaleDateString('pt-BR', { weekday: 'short' })
      .replace('.', '')
      .slice(0, 3)

    result.push({ key, label, count })
  }

  return result
}

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
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      if (!store?.id) {
        setLoading(false)
        return
      }
      try {
        /* Uma única chamada para pedidos — derivamos a contagem dos dados */
        const [categories, productList, orderList] = await Promise.all([
          getCategoriesByStore(store.id),
          getProductsByStore(store.id),
          getOrdersByStore(store.id),
        ])

        const validOrders = orderList.filter(o => (o.status || 'pending') !== 'cancelled')
        const revenue = validOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)

        const itemCounts = validOrders
          .flatMap(o => o.items || [])
          .reduce((acc, item) => {
            acc[item.name] = (acc[item.name] || 0) + Number(item.quantity || 0)
            return acc
          }, {})

        const topProductName = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

        setStats({
          products: productList.length,
          categories: categories.length,
          orders: orderList.length,
          pendingOrders: orderList.filter(
            o => !['delivered', 'cancelled'].includes(o.status || 'pending')
          ).length,
          revenue,
          averageTicket: validOrders.length ? revenue / validOrders.length : 0,
          topProduct: topProductName || productList[0]?.name || '—',
        })

        setChartData(buildDailyChart(orderList, 7))
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
  const chartMax = Math.max(...chartData.map(d => d.count), 1)

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
          <span
            className="stat-card-value"
            style={{ fontSize: '1.5rem', color: store?.active ? 'var(--color-success)' : 'var(--color-error)' }}
          >
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
          <small>Mais pedido no histórico</small>
        </div>
      </div>

      {/* Gráfico de pedidos — últimos 7 dias */}
      {!loading && chartData.length > 0 && (
        <div className="card card-elevated mt-6">
          <div className="card-body">
            <p className="mini-chart-title">Pedidos — últimos 7 dias</p>
            <div className="mini-chart">
              {chartData.map(day => (
                <div key={day.key} className="mini-chart-col">
                  <span className="mini-chart-count">{day.count > 0 ? day.count : ''}</span>
                  <div
                    className="mini-chart-bar"
                    style={{ height: `${Math.max((day.count / chartMax) * 100, day.count > 0 ? 8 : 3)}%` }}
                    title={`${day.label}: ${day.count} pedido${day.count !== 1 ? 's' : ''}`}
                  />
                  <span className="mini-chart-label">{day.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state quando não há produtos */}
      {stats.products === 0 && !loading && (
        <div className="empty-state mt-8">
          <div className="empty-state-icon">
            <PlusCircleIcon size={32} />
          </div>
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
