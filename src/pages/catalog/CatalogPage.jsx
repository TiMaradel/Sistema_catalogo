import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { getStoreBySlug } from '@/services/storeService'
import { getActiveProducts } from '@/services/productService'
import { getCategoriesByStore } from '@/services/categoryService'
import { guestLogin } from '@/services/authService'
import { CartProvider, useCart } from '@/contexts/CartContext'
import { normalizeSocialUrl } from '@/utils/formatters'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { ShoppingBagIcon, EmptyBoxIcon, AlertCircleIcon } from '@/components/common/Icons'
import Cart from '@/components/catalog/Cart'
import ProductCard from '@/components/catalog/ProductCard'
import ProductModal from '@/components/catalog/ProductModal'
import CategoryFilter from '@/components/catalog/CategoryFilter'

/* Garante que o login de demo só acontece uma vez */
let publicDemoPromise = null

function ensurePublicDemoCatalog() {
  if (!publicDemoPromise) {
    publicDemoPromise = guestLogin().finally(() => {
      publicDemoPromise = null
    })
  }
  return publicDemoPromise
}

/* ────────────────────────────────────────────────── */
/*  Conteúdo principal do catálogo                  */
/* ────────────────────────────────────────────────── */
function CatalogContent() {
  const { slug } = useParams()
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)

  /* Mapa de feedback "adicionado" por produto: { [productId]: true } */
  const [addedMap, setAddedMap] = useState({})

  const { addItem, totalItems, openCart } = useCart()

  /* Carrega a loja, produtos e categorias */
  useEffect(() => {
    async function loadStore() {
      sessionStorage.removeItem('catalog_demo_destination')
      try {
        let storeData = await getStoreBySlug(slug)
        if (!storeData && slug === 'loja-teste') {
          await ensurePublicDemoCatalog()
          storeData = await getStoreBySlug(slug)
        }
        if (!storeData || storeData.active === false) {
          setError(storeData ? 'Catálogo temporariamente indisponível' : 'Catálogo não encontrado')
          setLoading(false)
          return
        }
        setStore(storeData)

        const [prods, cats] = await Promise.all([
          getActiveProducts(storeData.id),
          getCategoriesByStore(storeData.id),
        ])
        setProducts(prods)
        setCategories(cats.filter(c => c.active !== false))
      } catch (loadError) {
        console.error('Erro ao carregar catálogo:', loadError)
        setError('Erro ao carregar catálogo')
      } finally {
        setLoading(false)
      }
    }
    loadStore()
  }, [slug])

  /* Adiciona item e exibe feedback visual por 700ms */
  const handleAddToCart = useCallback((product) => {
    addItem(product)
    setAddedMap(prev => ({ ...prev, [product.id]: true }))
    setTimeout(() => {
      setAddedMap(prev => {
        const next = { ...prev }
        delete next[product.id]
        return next
      })
    }, 700)
  }, [addItem])

  /* ── Estados de carregamento e erro ── */
  if (loading) return <LoadingSpinner text="Carregando catálogo..." />

  if (error) {
    return (
      <div className="loading-page">
        <div className="empty-state-icon">
          <AlertCircleIcon size={32} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{error}</h2>
        <p className="text-secondary">Verifique o link e tente novamente.</p>
      </div>
    )
  }

  /* ── Filtros de produto ── */
  const filtered = products.filter(p => {
    const matchSearch = !searchTerm ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCat = !activeCategory || p.categoryId === activeCategory
    return matchSearch && matchCat
  })

  const layout = store?.layout || 'modern'
  const gridClass = layout === 'classic' || layout === 'minimal' ? 'products-list' : 'products-grid'
  const gridStyle = layout === 'grid'
    ? { gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }
    : {}

  /* Textos personalizáveis com fallback genérico */
  const heading = store?.catalogHeading?.trim() || 'Nosso catálogo'
  const subheading = store?.catalogSubheading?.trim() || 'Confira todos os itens disponíveis'

  return (
    <div className="catalog-layout">

      {/* ── Header ── */}
      <header className="catalog-header">
        <div className="catalog-header-inner">
          <div className="catalog-store-info">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="catalog-store-logo" />
            ) : (
              <div className="catalog-store-logo flex items-center justify-center" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {store.name?.trim()?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            )}
            <div className="catalog-store-copy">
              <p className="catalog-eyebrow">Catálogo online</p>
              <h1 className="catalog-store-name">{store.name}</h1>
              {store.description && (
                <p className="catalog-store-description">{store.description}</p>
              )}
              {(store.businessHours || store.deliveryInfo) && (
                <div className="catalog-business-meta">
                  {store.businessHours && <span>Atendimento: {store.businessHours}</span>}
                  {store.deliveryInfo && <span>{store.deliveryInfo}</span>}
                  {store.pickupAvailable && <span>Retirada no local disponível</span>}
                </div>
              )}
            </div>
          </div>

          {/* Botão do carrinho */}
          <button
            className="catalog-cart-button"
            onClick={openCart}
            aria-label={`Abrir carrinho${totalItems > 0 ? `, ${totalItems} itens` : ''}`}
          >
            <ShoppingBagIcon size={22} />
            <span className="catalog-cart-label">Carrinho</span>
            {totalItems > 0 && (
              <span className="badge-counter">{totalItems}</span>
            )}
          </button>
        </div>
      </header>

      {/* ── Busca ── */}
      <div style={{ maxWidth: 'var(--max-catalog-width)', margin: '0 auto', padding: '16px 20px 0' }}>
        <div className="search-bar" style={{ maxWidth: '100%' }}>
          <span className="search-bar-icon">⌕</span>
          <input
            aria-label="Buscar produtos"
            type="text"
            className="search-bar-input"
            placeholder="Buscar por nome ou categoria"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── Título da seção ── */}
      <div className="catalog-section-bar">
        <div>
          <p className="catalog-section-kicker">Nossa seleção</p>
          <h2 className="catalog-section-title">{heading}</h2>
          {subheading && (
            <p className="catalog-section-sub">{subheading}</p>
          )}
        </div>
        <span className="catalog-result-count">
          {filtered.length} {filtered.length === 1 ? 'item' : 'itens'}
        </span>
      </div>

      {/* ── Filtro de categorias ── */}
      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onChange={setActiveCategory}
      />

      {/* ── Grade de produtos ── */}
      <div className="catalog-container">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <EmptyBoxIcon size={32} />
            </div>
            <h3 className="empty-state-title">Nenhum produto encontrado</h3>
            <p className="empty-state-text">
              {searchTerm
                ? 'Tente buscar com outras palavras'
                : 'Este catálogo ainda não possui produtos'}
            </p>
          </div>
        ) : (
          <div className={gridClass} style={gridStyle}>
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                layout={layout}
                onSelect={(p) => setSelectedProduct(p)}
                onAdd={handleAddToCart}
                added={!!addedMap[product.id]}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Rodapé ── */}
      <footer className="catalog-footer">
        <span>Catálogo por <strong>CatálogoDigital</strong></span>
        {(store.socialLinks?.instagram || store.socialLinks?.facebook) && (
          <div className="catalog-social-links">
            {store.socialLinks?.instagram && (
              <a href={normalizeSocialUrl(store.socialLinks.instagram, 'instagram')} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            )}
            {store.socialLinks?.facebook && (
              <a href={normalizeSocialUrl(store.socialLinks.facebook, 'facebook')} target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            )}
          </div>
        )}
      </footer>

      {/* ── Botão flutuante do carrinho ── */}
      {totalItems > 0 && (
        <button className="cart-float-btn" onClick={openCart} aria-label="Abrir carrinho">
          <ShoppingBagIcon size={23} />
          <span className="badge-counter">{totalItems}</span>
        </button>
      )}

      {/* ── Modal de detalhe do produto ── */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p) => {
          handleAddToCart(p)
          openCart()
        }}
      />

      {/* ── Drawer do carrinho ── */}
      <Cart store={store} />
    </div>
  )
}

/* ────────────────────────────────────────────────── */
/*  Exportação com o CartProvider                   */
/* ────────────────────────────────────────────────── */
export default function CatalogPage() {
  const { slug } = useParams()

  return (
    <CartProvider storeSlug={slug}>
      <CatalogContent />
    </CartProvider>
  )
}
