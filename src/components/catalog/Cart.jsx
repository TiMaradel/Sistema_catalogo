import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/services/whatsappService'
import { saveOrder } from '@/services/orderService'
import { formatCurrency } from '@/utils/formatters'
import { useToast } from '@/contexts/ToastContext'
import { ShoppingBagIcon } from '@/components/common/Icons'

export default function Cart({ store }) {
  const {
    items, isOpen, closeCart, totalItems, totalPrice,
    updateQuantity, removeItem, clearCart,
  } = useCart()
  const toast = useToast()

  const [step, setStep] = useState('cart') // 'cart' ou 'checkout'
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [sending, setSending] = useState(false)

  if (!isOpen) return null

  async function handleSendToWhatsApp(e) {
    e.preventDefault()
    if (!customerName.trim()) return

    setSending(true)
    let whatsappWindow = null
    try {
      const orderData = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        notes: notes.trim(),
        items,
        total: totalPrice,
        storeName: store?.name,
      }

      const message = buildWhatsAppMessage(orderData)
      const whatsappUrl = buildWhatsAppUrl(store?.whatsapp, message)
      whatsappWindow = window.open('about:blank', '_blank')

      // Salvar no histórico
      if (store?.id) {
        await saveOrder(store.id, orderData)
      }

      // O endereço é validado antes do salvamento; um número inválido não cria pedido órfão.
      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.location.href = whatsappUrl
      } else {
        window.location.href = whatsappUrl
      }

      // Limpar
      clearCart()
      setStep('cart')
      setCustomerName('')
      setCustomerPhone('')
      setNotes('')
      closeCart()
    } catch (error) {
      if (whatsappWindow && !whatsappWindow.closed) whatsappWindow.close()
      toast.error(error.message || 'Não foi possível enviar o pedido')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="modal-overlay"
        style={{ justifyContent: 'flex-end', padding: 0 }}
        onClick={closeCart}
      >
        <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="cart-drawer-header">
            <h3 className="cart-drawer-title">
              <ShoppingBagIcon size={19} />
              <span>{step === 'cart' ? `Carrinho (${totalItems})` : 'Finalizar pedido'}</span>
            </h3>
            <button className="modal-close" onClick={closeCart} aria-label="Fechar carrinho">×</button>
          </div>

          {step === 'cart' ? (
            <>
              {/* Lista de itens */}
              <div className="cart-drawer-body">
                {items.length === 0 ? (
                  <div className="empty-state" style={{ padding: 'var(--space-8) 0' }}>
                    <div className="empty-state-icon"><ShoppingBagIcon size={28} /></div>
                    <h3 className="empty-state-title">Carrinho vazio</h3>
                    <p className="empty-state-text">Adicione uma peça para começar seu pedido.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {items.map(item => (
                      <div key={item.id} className="cart-item">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="cart-item-image" />
                        ) : (
                          <div className="cart-item-image flex items-center justify-center" style={{ fontSize: '0.7rem', color: 'var(--color-gray-400)', fontWeight: 700 }}>IMG</div>
                        )}
                        <div className="cart-item-info">
                          <span className="cart-item-name">{item.name}</span>
                          <span className="cart-item-price">{formatCurrency(item.price)}</span>
                          <div className="cart-quantity">
                            <button
                              className="cart-quantity-btn"
                              aria-label={`Diminuir quantidade de ${item.name}`}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              −
                            </button>
                            <span className="cart-quantity-value">{item.quantity}</span>
                            <button
                              className="cart-quantity-btn"
                              aria-label={`Aumentar quantidade de ${item.name}`}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ whiteSpace: 'nowrap' }}>
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          <button
                            className="btn btn-ghost btn-icon-sm mt-1"
                            aria-label={`Remover ${item.name} do carrinho`}
                            style={{ color: 'var(--color-error)', fontSize: '12px' }}
                            onClick={() => removeItem(item.id)}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer com total e botão */}
              {items.length > 0 && (
                <div className="cart-drawer-footer">
                  <div className="cart-total">
                    <span className="cart-total-label">Total</span>
                    <span className="cart-total-value">{formatCurrency(totalPrice)}</span>
                  </div>
                  <button
                    className="btn btn-whatsapp btn-full btn-lg"
                    onClick={() => setStep('checkout')}
                  >
                    Enviar pelo WhatsApp
                  </button>
                  <button
                    className="btn btn-ghost btn-full btn-sm mt-2"
                    onClick={clearCart}
                  >
                    Limpar carrinho
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Checkout form */}
              <div className="cart-drawer-body">
                <form className="checkout-form" onSubmit={handleSendToWhatsApp}>
                  {/* Resumo */}
                  <div className="checkout-summary">
                    <p className="checkout-summary-title">Resumo do pedido</p>
                    {items.map((item, i) => (
                      <div key={i} className="checkout-item-row">
                        <span>{item.quantity}x {item.name}</span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="checkout-total-row">
                      <span>Total</span>
                      <span className="checkout-total-value">{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="checkout-name">Seu nome *</label>
                    <input
                      id="checkout-name"
                      type="text"
                      className="input-field"
                      placeholder="Como devemos chamar você?"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="checkout-phone">Seu telefone (opcional)</label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      className="input-field"
                      placeholder="(11) 99999-9999"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="checkout-notes">Observações</label>
                    <textarea
                      id="checkout-notes"
                      className="input-field input-textarea"
                      placeholder="Alguma observação sobre o pedido?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{ minHeight: '80px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className={`btn btn-whatsapp btn-full btn-lg ${sending ? 'btn-loading' : ''}`}
                    disabled={sending || !customerName.trim()}
                  >
                    Enviar pedido pelo WhatsApp
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-full"
                    onClick={() => setStep('cart')}
                  >
                    ← Voltar ao carrinho
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
