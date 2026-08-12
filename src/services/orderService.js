// Mock Order Service using LocalStorage
import { generateLocalId, readLocalData, writeLocalData } from '@/services/localStorageService'

const ORDERS_KEY = 'cat_orders'

function getOrdersData() {
  return readLocalData(ORDERS_KEY, [])
}

function saveOrdersData(orders) {
  writeLocalData(ORDERS_KEY, orders)
}

export async function saveOrder(storeId, orderData) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (!storeId || !orderData?.customerName?.trim()) return reject(new Error('Dados do pedido incompletos'))
        if (!Array.isArray(orderData.items) || orderData.items.length === 0) return reject(new Error('O pedido não possui itens'))
        const orders = getOrdersData()
        const newOrder = {
          id: generateLocalId(),
          storeId,
          ...orderData,
          sentAt: new Date().toISOString(),
        }
        orders.push(newOrder)
        saveOrdersData(orders)
        resolve(newOrder.id)
      } catch (error) {
        reject(error)
      }
    }, 300)
  })
}

export async function getOrdersByStore(storeId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orders = getOrdersData()
      const storeOrders = orders
        .filter(o => o.storeId === storeId)
        .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
      resolve(storeOrders)
    }, 200)
  })
}

export async function countOrders(storeId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orders = getOrdersData()
      resolve(orders.filter(o => o.storeId === storeId).length)
    }, 150)
  })
}
