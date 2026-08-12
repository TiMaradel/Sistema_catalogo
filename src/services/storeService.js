// Persistência local para desenvolvimento. Os dados ficam somente neste navegador.
import { generateLocalId, readLocalData, writeLocalData } from '@/services/localStorageService'

const STORES_KEY = 'cat_stores'

function getStoresData() {
  return readLocalData(STORES_KEY, [])
}

function saveStoresData(stores) {
  writeLocalData(STORES_KEY, stores)
}

export async function createStore(storeData) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const stores = getStoresData()
        if (!storeData.slug || !/^[a-z0-9-]{3,}$/.test(storeData.slug)) return reject(new Error('O link da loja é inválido'))
        if (stores.some(s => s.slug === storeData.slug)) return reject(new Error('Este link de catálogo já está em uso'))
        const newStore = {
          id: generateLocalId(),
          ...storeData,
          active: true,
          createdAt: new Date().toISOString(),
        }
        stores.push(newStore)
        saveStoresData(stores)
        resolve(newStore.id)
      } catch (error) {
        reject(error)
      }
    }, 400)
  })
}

export async function updateStore(storeId, data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const stores = getStoresData()
        const index = stores.findIndex(s => s.id === storeId)
        if (index === -1) return reject(new Error('Loja não encontrada'))
        if (data.slug && data.slug !== stores[index].slug) {
          if (!/^[a-z0-9-]{3,}$/.test(data.slug)) return reject(new Error('O link da loja é inválido'))
          if (stores.some(s => s.slug === data.slug && s.id !== storeId)) return reject(new Error('Este link de catálogo já está em uso'))
        }
        stores[index] = { ...stores[index], ...data }
        saveStoresData(stores)
        resolve(stores[index])
      } catch (error) {
        reject(error)
      }
    }, 400)
  })
}

export async function getStoreByOwnerId(ownerId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const stores = getStoresData()
      const store = stores.find(s => s.ownerId === ownerId)
      resolve(store || null)
    }, 200)
  })
}

export async function getStoreById(storeId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const stores = getStoresData()
      const store = stores.find(s => s.id === storeId)
      resolve(store || null)
    }, 200)
  })
}

export async function getStoreBySlug(slug) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const stores = getStoresData()
      const store = stores.find(s => s.slug === slug)
      resolve(store || null)
    }, 200)
  })
}

export async function getAllStores() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getStoresData().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    }, 300)
  })
}

export async function toggleStoreActive(storeId, active) {
  return updateStore(storeId, { active })
}

export async function deleteStore(storeId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let stores = getStoresData()
      const initialLength = stores.length
      stores = stores.filter(s => s.id !== storeId)
      
      if (stores.length === initialLength) {
        return reject(new Error('Loja não encontrada'))
      }

      saveStoresData(stores)

      for (const key of ['cat_products', 'cat_categories', 'cat_orders']) {
        try {
          const data = readLocalData(key, [])
          writeLocalData(key, data.filter(item => item.storeId !== storeId))
        } catch {
          // Um registro inválido não impede a exclusão da loja.
        }
      }
      resolve()
    }, 400)
  })
}
