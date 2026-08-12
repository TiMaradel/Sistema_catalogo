// Mock Category Service using LocalStorage
import { generateLocalId, readLocalData, writeLocalData } from '@/services/localStorageService'

const CATEGORIES_KEY = 'cat_categories'

function getCategoriesData() {
  return readLocalData(CATEGORIES_KEY, [])
}

function saveCategoriesData(categories) {
  writeLocalData(CATEGORIES_KEY, categories)
}

export async function createCategory(storeId, categoryData, maxCategories = -1) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const categories = getCategoriesData()
        const storeCategories = categories.filter(category => category.storeId === storeId)
        const normalizedName = String(categoryData.name || '').trim().toLocaleLowerCase('pt-BR')
        if (!normalizedName) return reject(new Error('O nome da categoria é obrigatório'))
        if (maxCategories !== -1 && storeCategories.length >= maxCategories) {
          return reject(new Error(`Seu plano permite até ${maxCategories} categorias`))
        }
        if (storeCategories.some(category => category.name.trim().toLocaleLowerCase('pt-BR') === normalizedName)) {
          return reject(new Error('Já existe uma categoria com este nome'))
        }

        const newCategory = {
          id: generateLocalId(),
          storeId,
          ...categoryData,
          name: String(categoryData.name).trim(),
          active: true,
          createdAt: new Date().toISOString(),
        }
        categories.push(newCategory)
        saveCategoriesData(categories)
        resolve(newCategory.id)
      } catch (error) {
        reject(error)
      }
    }, 300)
  })
}

export async function updateCategory(storeId, categoryId, data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const categories = getCategoriesData()
        const index = categories.findIndex(c => c.id === categoryId && c.storeId === storeId)
        if (index === -1) return reject(new Error('Categoria não encontrada'))
        const name = String(data.name ?? categories[index].name).trim()
        const normalizedName = name.toLocaleLowerCase('pt-BR')
        if (!name) return reject(new Error('O nome da categoria é obrigatório'))
        if (categories.some(category => category.storeId === storeId && category.id !== categoryId && category.name.trim().toLocaleLowerCase('pt-BR') === normalizedName)) {
          return reject(new Error('Já existe uma categoria com este nome'))
        }
        categories[index] = { ...categories[index], ...data, name }
        saveCategoriesData(categories)
        resolve(categories[index])
      } catch (error) {
        reject(error)
      }
    }, 300)
  })
}

export async function getCategoriesByStore(storeId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const categories = getCategoriesData()
      const storeCategories = categories
        .filter(c => c.storeId === storeId)
        .sort((a, b) => a.order - b.order)
      resolve(storeCategories)
    }, 200)
  })
}

export async function deleteCategory(storeId, categoryId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        let categories = getCategoriesData()
        const initialLength = categories.length
        categories = categories.filter(c => !(c.id === categoryId && c.storeId === storeId))
        if (categories.length === initialLength) return reject(new Error('Categoria não encontrada'))
        saveCategoriesData(categories)

        const products = readLocalData('cat_products', [])
        writeLocalData('cat_products', products.map(product => (
          product.storeId === storeId && product.categoryId === categoryId
            ? { ...product, categoryId: null }
            : product
        )))
        resolve()
      } catch (error) {
        reject(error)
      }
    }, 300)
  })
}
