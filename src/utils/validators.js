/* Validação de email */
export function validateEmail(email) {
  if (!email) return 'O email é obrigatório'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Digite um email válido'
  return ''
}

/* Validação de senha */
export function validatePassword(password) {
  if (!password) return 'A senha é obrigatória'
  if (password.length < 6) return 'A senha deve ter no mínimo 6 caracteres'
  return ''
}

/* Validação de nome */
export function validateName(name) {
  if (!name || !name.trim()) return 'O nome é obrigatório'
  if (name.trim().length < 2) return 'O nome deve ter no mínimo 2 caracteres'
  return ''
}

/* Validação de telefone */
export function validatePhone(phone) {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length < 10 || cleaned.length > 11) return 'Telefone inválido'
  return ''
}

/* Validação de WhatsApp */
export function validateWhatsApp(phone) {
  if (!phone) return 'O número do WhatsApp é obrigatório'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length < 10 || cleaned.length > 13) return 'Número de WhatsApp inválido'
  return ''
}

/* Validação de preço */
export function validatePrice(price) {
  if (price === null || price === undefined || price === '') return 'O preço é obrigatório'
  const numPrice = parseFloat(price)
  if (isNaN(numPrice)) return 'Digite um preço válido'
  if (numPrice < 0) return 'O preço não pode ser negativo'
  return ''
}

/* Validação de slug */
export function validateSlug(slug) {
  if (!slug) return 'O link do catálogo é obrigatório'
  if (slug.length < 3) return 'O link deve ter no mínimo 3 caracteres'
  const slugRegex = /^[a-z0-9-]+$/
  if (!slugRegex.test(slug)) return 'Use apenas letras minúsculas, números e hífens'
  return ''
}

/* Validar formulário inteiro (recebe objeto com campos e validações) */
export function validateForm(fields) {
  const errors = {}
  let hasErrors = false

  Object.keys(fields).forEach(key => {
    const { value, validators } = fields[key]
    for (const validator of validators) {
      const error = validator(value)
      if (error) {
        errors[key] = error
        hasErrors = true
        break
      }
    }
  })

  return { errors, hasErrors }
}
