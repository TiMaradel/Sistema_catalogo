import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { getOrdersByStore, updateOrderStatus } from '@/services/orderService'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { ORDER_STATUSES } from '@/utils/constants'

export default function OrdersPage() {
  const { store } = useAuth()
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState('')

  useEffect(() => {
    async function loadOrders() {
      if (!store?.id) {
        setLoading(false)
        return
      }
      try {
        const data = await getOrdersByStore(store.id)
        setOrders(data)
      } catch (error) {
        toast.error(error.message || 'Erro ao carregar pedidos')
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [store?.id])

  const visibleOrders = statusFilter === 'all'
    ? orders
    : orders.filter(order => (order.status || 'pending') === statusFilter)

  const activeOrders = orders.filter(order => !['delivered', 'cancelled'].includes(order.status || 'pending'))
  const totalRevenue = orders
    .filter(order => (order.status || 'pending') !== 'cancelled')
    .reduce((sum, order) => sum + Number(order.total || 0), 0)

  async function handleStatusChange(orderId, status) {
    if (!store?.id) return
    setUpdatingId(orderId)
    try {
      const updated = await updateOrderStatus(store.id, orderId, status)
      setOrders(current => current.map(order => order.id === orderId ? updated : order))
      toast.success('Status do pedido atualizado')
    } catch (error) {
      toast.error(error.message || 'Não foi possível atualizar o pedido')
    } finally {
      setUpdatingId('')
    }
  }

  if (loading) return <LoadingSpinner text="Carregando pedidos..." />

  return (
    <div>
      <h1 className="admin-page-title">Pedidos</h1>
      <p className="text-secondary mb-6">
        Acompanhe os pedidos enviados pelo WhatsApp e organize cada etapa da operação.
      </p>

      <div className="order-summary-grid">
        <div className="stat-card compact-stat-card">
          <span className="stat-card-label">Pedidos ativos</span>
          <span className="stat-card-value">{activeOrders.length}</span>
          <span className="stat-card-change">Aguardando atendimento</span>
        </div>
        <div className="stat-card compact-stat-card">
          <span className="stat-card-label">Valor dos pedidos</span>
          <span className="stat-card-value order-summary-value">{formatCurrency(totalRevenue)}</span>
          <span className="stat-card-change">Sem cancelados</span>
        </div>
      </div>

      {orders.length > 0 && (
        <div className="orders-toolbar">
          <label className="input-label" htmlFor="order-status-filter">Filtrar por status</label>
          <select
            id="order-status-filter"
            className="input-field input-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os pedidos ({orders.length})</option>
            {Object.entries(ORDER_STATUSES).map(([value, status]) => (
              <option key={value} value={value}>{status.label}</option>
            ))}
          </select>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">P</div>
          <h3 className="empty-state-title">Nenhum pedido ainda</h3>
          <p className="empty-state-text">
            Quando seus clientes enviarem pedidos pelo catálogo, eles aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleOrders.length === 0 ? (
            <div className="empty-state compact-empty-state">
              <h3 className="empty-state-title">Nenhum pedido nesse status</h3>
              <p className="empty-state-text">Escolha outro filtro para visualizar os pedidos.</p>
            </div>
          ) : visibleOrders.map(order => (
            <div key={order.id} className="card card-elevated">
              <div className="card-body">
                <div className="flex items-center justify-between mb-3" style={{ flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span className="font-semibold">{order.customerName}</span>
                    {order.customerPhone && (
                      <span className="text-sm text-secondary ml-2">
                        {order.customerPhone}
                      </span>
                    )}
                  </div>
                  <div className="order-card-meta">
                    <span className={`badge badge-${ORDER_STATUSES[order.status || 'pending']?.tone || 'warning'}`}>
                      {ORDER_STATUSES[order.status || 'pending']?.label || 'Novo'}
                    </span>
                    <span className="text-xs text-secondary">{formatDateTime(order.sentAt)}</span>
                  </div>
                </div>

                <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '12px' }}>
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm" style={{ padding: '4px 0' }}>
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold mt-2" style={{ paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                    <span>Total</span>
                    <span className="text-accent">{formatCurrency(order.total)}</span>
                  </div>
                </div>

                {order.notes && (
                  <p className="text-sm text-secondary mt-3">
                    Observação: {order.notes}
                  </p>
                )}

                <div className="order-card-actions">
                  <label className="input-label" htmlFor={`order-status-${order.id}`}>Atualizar etapa</label>
                  <select
                    id={`order-status-${order.id}`}
                    className="input-field input-select"
                    value={order.status || 'pending'}
                    disabled={updatingId === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    {Object.entries(ORDER_STATUSES).map(([value, status]) => (
                      <option key={value} value={value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
