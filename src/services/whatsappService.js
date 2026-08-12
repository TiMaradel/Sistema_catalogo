import { formatCurrency } from '@/utils/formatters'

/* Montar mensagem formatada para o WhatsApp */
export function buildWhatsAppMessage(orderData) {
  const { customerName, customerPhone, notes, items, total, storeName } = orderData

  if (!customerName?.trim()) throw new Error('Informe seu nome para continuar')
  if (!Array.isArray(items) || items.length === 0) throw new Error('O carrinho está vazio')

  let message = `*NOVO PEDIDO — ${storeName || 'Catálogo Digital'}*\n`
  message += `-------------------\n`
  message += `*Cliente:* ${customerName}\n`

  if (customerPhone) {
    message += `*Telefone:* ${customerPhone}\n`
  }

  message += `\n*ITENS DO PEDIDO:*\n`

  items.forEach((item, index) => {
    const subtotal = item.price * item.quantity
    message += `${index + 1}. ${item.quantity}x ${item.name}`
    message += ` — ${formatCurrency(subtotal)}\n`
  })

  message += `-------------------\n`
  message += `*TOTAL: ${formatCurrency(total)}*\n`

  if (notes) {
    message += `\n*Observações:*\n${notes}\n`
  }

  message += `\n${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`

  return message
}

/* Abrir WhatsApp com a mensagem */
export function openWhatsApp(phoneNumber, message) {
  let cleaned = String(phoneNumber || '').replace(/\D/g, '')

  if (!cleaned) throw new Error('A loja ainda não informou um número de WhatsApp')

  if (cleaned.length <= 11 && !cleaned.startsWith('55')) {
    cleaned = '55' + cleaned
  }

  const url = buildWhatsAppUrl(cleaned, message)

  window.open(url, '_blank')
  return url
}

export function buildWhatsAppUrl(phoneNumber, message) {
  let cleaned = String(phoneNumber || '').replace(/\D/g, '')
  if (cleaned.length <= 11 && !cleaned.startsWith('55')) cleaned = `55${cleaned}`
  if (cleaned.length < 12) throw new Error('Número de WhatsApp inválido')
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
}

/* Fluxo completo: montar mensagem + abrir WhatsApp */
export function sendOrderToWhatsApp(phoneNumber, orderData, targetWindow) {
  const message = buildWhatsAppMessage(orderData)
  const url = buildWhatsAppUrl(phoneNumber, message)
  if (targetWindow && !targetWindow.closed) {
    targetWindow.location.href = url
  } else {
    window.location.href = url
  }
  return message
}
