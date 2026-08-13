// Dados de demonstração do modo de teste. Permanecem somente no navegador.
import { readLocalData, writeLocalData } from '@/services/localStorageService'

const STORES_KEY = 'cat_stores'
const CATEGORIES_KEY = 'cat_categories'
const PRODUCTS_KEY = 'cat_products'
const DEMO_SLUG = 'loja-teste'
const demoAsset = (fileName) => `${import.meta.env.BASE_URL}demo-clothing/${fileName}`

const DEMO_CATEGORIES = [
  { id: 'demo-category-essentials', name: 'Essenciais', order: 0 },
  { id: 'demo-category-outerwear', name: 'Terceira peça', order: 1 },
  { id: 'demo-category-tailoring', name: 'Alfaiataria', order: 2 },
]

const DEMO_PRODUCTS = [
  {
    id: 'demo-product-linen-shirt',
    name: 'Camisa Linho Natural',
    description: 'Leve, respirável e fácil de combinar. Uma peça para usar o ano inteiro.',
    price: 149.90,
    categoryId: 'demo-category-essentials',
    featured: true,
    image: demoAsset('linen-shirt.webp'),
  },
  {
    id: 'demo-product-terracotta-tee',
    name: 'Camiseta Algodão Terracota',
    description: 'Malha macia com corte confortável e uma cor que transforma o básico.',
    price: 79.90,
    categoryId: 'demo-category-essentials',
    featured: false,
    image: demoAsset('terracotta-tee.webp'),
  },
  {
    id: 'demo-product-denim-jacket',
    name: 'Jaqueta Jeans Classic',
    description: 'Denim estruturado para completar produções de meia-estação.',
    price: 229.90,
    categoryId: 'demo-category-outerwear',
    featured: true,
    image: demoAsset('denim-jacket.webp'),
  },
  {
    id: 'demo-product-tailored-trousers',
    name: 'Calça Alfaiataria Oat',
    description: 'Modelagem ampla, cintura marcada e caimento elegante.',
    price: 189.90,
    categoryId: 'demo-category-tailoring',
    featured: false,
    image: demoAsset('tailored-trousers.webp'),
  },
]

function createDemoProduct(product, storeId) {
  return {
    id: product.id,
    storeId,
    name: product.name,
    description: product.description,
    price: product.price,
    categoryId: product.categoryId,
    featured: product.featured,
    images: [{ url: product.image, path: `demo/${product.id}.png` }],
    active: true,
    createdAt: new Date().toISOString(),
  }
}

export function ensureDemoCatalog(ownerId) {
  const stores = readLocalData(STORES_KEY, [])
  const storeIndex = stores.findIndex(store => store.ownerId === ownerId)
  if (storeIndex === -1) return null

  const store = {
    ...stores[storeIndex],
    name: 'Ateliê Aurora',
    slug: DEMO_SLUG,
    whatsapp: '5511999999999',
    description: 'Uma curadoria de peças leves, versáteis e feitas para acompanhar sua rotina.',
    businessHours: 'Segunda a sábado, das 9h às 18h',
    deliveryInfo: 'Entrega em até 2 dias úteis • Retirada combinada pelo WhatsApp',
    pickupAvailable: true,
    layout: 'modern',
    theme: 'light',
    socialLinks: {
      instagram: '@atelieaurora.demo',
      facebook: 'atelieaurora.demo',
    },
    active: true,
  }
  stores[storeIndex] = store
  writeLocalData(STORES_KEY, stores)

  const categories = readLocalData(CATEGORIES_KEY, [])
  const categoryIds = new Set(categories.filter(category => category.storeId === store.id).map(category => category.id))
  const missingCategories = DEMO_CATEGORIES
    .filter(category => !categoryIds.has(category.id))
    .map(category => ({ ...category, storeId: store.id, active: true }))
  if (missingCategories.length > 0) {
    writeLocalData(CATEGORIES_KEY, [...categories, ...missingCategories])
  }

  const products = readLocalData(PRODUCTS_KEY, [])
  const productIds = new Set(products.filter(product => product.storeId === store.id).map(product => product.id))
  const missingProducts = DEMO_PRODUCTS
    .filter(product => !productIds.has(product.id))
    .map(product => createDemoProduct(product, store.id))
  if (missingProducts.length > 0) {
    writeLocalData(PRODUCTS_KEY, [...products, ...missingProducts])
  }

  return store
}
