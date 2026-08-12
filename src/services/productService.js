// Mock Product Service using LocalStorage
import { generateLocalId, readLocalData, writeLocalData } from '@/services/localStorageService'

const PRODUCTS_KEY = 'cat_products'

function getProductsData() {
  return readLocalData(PRODUCTS_KEY, [])
}

function saveProductsData(products) {
  writeLocalData(PRODUCTS_KEY, products)
}

export async function createProduct(storeId, productData, maxProducts = -1) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const products = getProductsData()
        const storeProducts = products.filter(p => p.storeId === storeId)
        if (maxProducts !== -1 && storeProducts.length >= maxProducts) {
          return reject(new Error(`Seu plano permite até ${maxProducts} produtos`))
        }

        const newProduct = {
          id: generateLocalId(),
          storeId,
          ...productData,
          active: true,
          order: storeProducts.length,
          createdAt: new Date().toISOString(),
        }

        products.push(newProduct)
        saveProductsData(products)
        resolve(newProduct.id)
      } catch (error) {
        reject(error)
      }
    }, 400)
  })
}

export async function updateProduct(storeId, productId, data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const products = getProductsData()
        const index = products.findIndex(p => p.id === productId && p.storeId === storeId)
        if (index === -1) return reject(new Error('Produto não encontrado'))
        products[index] = { ...products[index], ...data }
        saveProductsData(products)
        resolve(products[index])
      } catch (error) {
        reject(error)
      }
    }, 400)
  })
}

export async function getProductsByStore(storeId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const products = getProductsData()
      const storeProducts = products
        .filter(p => p.storeId === storeId)
        .sort((a, b) => a.order - b.order)
      resolve(storeProducts)
    }, 200)
  })
}

export async function getActiveProducts(storeId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const products = getProductsData()
      const storeProducts = products
        .filter(p => p.storeId === storeId && p.active)
        .sort((a, b) => {
          // Destacados primeiro, depois por ordem
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return a.order - b.order
        })
      resolve(storeProducts)
    }, 200)
  })
}

export async function toggleProductActive(storeId, productId, active) {
  return updateProduct(storeId, productId, { active })
}

export async function deleteProduct(storeId, productId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        let products = getProductsData()
        const initialLength = products.length
        products = products.filter(p => !(p.id === productId && p.storeId === storeId))
        if (products.length === initialLength) return reject(new Error('Produto não encontrado'))
        saveProductsData(products)
        resolve()
      } catch (error) {
        reject(error)
      }
    }, 400)
  })
}

export async function countProducts(storeId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const products = getProductsData()
      resolve(products.filter(p => p.storeId === storeId).length)
    }, 150)
  })
}
