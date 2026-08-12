import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { getOrdersByStore } from '@/services/orderService'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function OrdersPage() {
  const { store } = useAuth()
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

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

  if (loading) return <LoadingSpinner text="Carregando pedidos..." />

  return (
    <div>
      <h1 className="admin-page-title">Pedidos</h1>
      <p className="text-secondary mb-6">
        Histórico de pedidos enviados pelo WhatsApp
      </p>

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
          {orders.map(order => (
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
                  <span className="text-xs text-secondary">
                    {formatDateTime(order.sentAt)}
                  </span>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
