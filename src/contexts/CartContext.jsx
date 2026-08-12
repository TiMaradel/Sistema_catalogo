import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext(null)

const CART_STORAGE_KEY = 'catalogo_cart'

function loadCart(storeSlug) {
  try {
    const key = `${CART_STORAGE_KEY}_${storeSlug}`
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveCart(storeSlug, items) {
  try {
    const key = `${CART_STORAGE_KEY}_${storeSlug}`
    localStorage.setItem(key, JSON.stringify(items))
  } catch {
    /* localStorage pode estar cheio ou desabilitado */
  }
}

export function CartProvider({ children, storeSlug }) {
  const [items, setItems] = useState(() => loadCart(storeSlug))
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (storeSlug) {
      saveCart(storeSlug, items)
    }
  }, [items, storeSlug])

  useEffect(() => {
    if (storeSlug) {
      setItems(loadCart(storeSlug))
    }
  }, [storeSlug])

  const addItem = useCallback((product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url || product.images?.[0] || '',
        quantity: 1,
      }]
    })
  }, [])

  const removeItem = useCallback((productId) => {
    setItems(prev => prev.filter(item => item.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen(prev => !prev), [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const value = {
    items,
    isOpen,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider')
  }
  return context
}

export default CartContext
