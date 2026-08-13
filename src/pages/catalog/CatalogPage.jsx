import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getStoreBySlug } from '@/services/storeService'
import { getActiveProducts } from '@/services/productService'
import { getCategoriesByStore } from '@/services/categoryService'
import { guestLogin } from '@/services/authService'
import { CartProvider, useCart } from '@/contexts/CartContext'
import { formatCurrency, normalizeSocialUrl } from '@/utils/formatters'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { ShoppingBagIcon } from '@/components/common/Icons'
import Cart from '@/components/catalog/Cart'

let publicDemoPromise = null

function ensurePublicDemoCatalog() {
  if (!publicDemoPromise) {
    publicDemoPromise = guestLogin().finally(() => {
      publicDemoPromise = null
    })
  }
  return publicDemoPromise
}

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
  const [selectedImage, setSelectedImage] = useState(0)
  const { addItem, totalItems, openCart } = useCart()

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

  if (loading) return <LoadingSpinner text="Carregando catálogo..." />

  if (error) {
    return (
      <div className="loading-page">
          <div className="empty-state-icon">!</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{error}</h2>
        <p className="text-secondary">Verifique o link e tente novamente.</p>
      </div>
    )
  }

  const filtered = products.filter(p => {
    const matchSearch = !searchTerm ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCat = !activeCategory || p.categoryId === activeCategory
    return matchSearch && matchCat
  })

  const layout = store?.layout || 'modern'

  function handleAddToCart(product) {
    addItem(product)
  }

  function renderProductCard(product) {
    const image = product.images?.[0]?.url || product.images?.[0] || ''

    if (layout === 'classic') {
      return (
        <div
          key={product.id}
          className="product-card-list"
          onClick={() => { setSelectedProduct(product); setSelectedImage(0) }}
        >
          {image ? (
            <img src={image} alt={product.name} className="product-card-list-image" />
          ) : (
            <div className="product-card-list-image flex items-center justify-center" style={{ fontSize: '0.7rem', color: 'var(--color-gray-400)', fontWeight: 700 }}>IMG</div>
          )}
          <div className="product-card-list-info">
            <div>
              <h3 className="product-card-name">{product.name}</h3>
              {product.description && (
                <p className="product-card-description">{product.description}</p>
              )}
            </div>
            <div className="product-card-footer">
              <span className="product-card-price">{formatCurrency(product.price)}</span>
              <button
                className="product-card-add-btn"
                aria-label={`Adicionar ${product.name} ao carrinho`}
                onClick={(e) => { e.stopPropagation(); handleAddToCart(product) }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (layout === 'minimal') {
      return (
        <div
          key={product.id}
          className="product-card"
          style={{ border: 'none', borderBottom: '1px solid var(--color-border)', borderRadius: 0 }}
          onClick={() => { setSelectedProduct(product); setSelectedImage(0) }}
        >
          <div className="product-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>{product.name}</h3>
              {product.description && (
                <p className="text-sm text-secondary mt-1">{product.description}</p>
              )}
              <p style={{ color: 'var(--color-primary)', fontWeight: 700, marginTop: '4px' }}>
                {formatCurrency(product.price)}
              </p>
            </div>
            {image && (
              <img src={image} alt={product.name} style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-lg)', objectFit: 'cover' }} />
            )}
            <button
              className="product-card-add-btn"
              aria-label={`Adicionar ${product.name} ao carrinho`}
              onClick={(e) => { e.stopPropagation(); handleAddToCart(product) }}
            >
              +
            </button>
          </div>
        </div>
      )
    }

    if (layout === 'grid') {
      return (
        <div
          key={product.id}
          className="product-card"
          onClick={() => { setSelectedProduct(product); setSelectedImage(0) }}
        >
          <div className="product-card-image-wrapper">
            {image ? (
              <img src={image} alt={product.name} className="product-card-image" style={{ aspectRatio: '1' }} />
            ) : (
              <div className="product-card-image flex items-center justify-center" style={{ aspectRatio: '1', fontSize: '0.7rem', color: 'var(--color-gray-400)', fontWeight: 700 }}>IMG</div>
            )}
          </div>
          <div style={{ padding: '8px 12px 12px' }}>
            <h3 style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: '2px' }}>{product.name}</h3>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-primary)' }}>
                {formatCurrency(product.price)}
              </span>
              <button
                className="product-card-add-btn"
                aria-label={`Adicionar ${product.name} ao carrinho`}
                style={{ width: '28px', height: '28px', fontSize: '14px' }}
                onClick={(e) => { e.stopPropagation(); handleAddToCart(product) }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      )
    }

    /* Layout modern (default) */
    return (
      <div
        key={product.id}
        className="product-card"
        onClick={() => { setSelectedProduct(product); setSelectedImage(0) }}
      >
        <div className="product-card-image-wrapper">
          {image ? (
            <img src={image} alt={product.name} className="product-card-image" />
          ) : (
          <div className="product-card-image flex items-center justify-center" style={{ fontSize: '0.7rem', color: 'var(--color-gray-400)', fontWeight: 700 }}>IMG</div>
          )}
          {product.featured && (
            <div className="product-card-badge">
              <span className="badge badge-warning">Destaque</span>
            </div>
          )}
        </div>
        <div className="product-card-body">
          <h3 className="product-card-name">{product.name}</h3>
          {product.description && (
            <p className="product-card-description">{product.description}</p>
          )}
          <div className="product-card-footer">
            <span className="product-card-price">{formatCurrency(product.price)}</span>
            <button
              className="product-card-add-btn"
              aria-label={`Adicionar ${product.name} ao carrinho`}
              onClick={(e) => { e.stopPropagation(); handleAddToCart(product) }}
            >
              +
            </button>
          </div>
        </div>
      </div>
    )
  }

  const gridClass = layout === 'classic' || layout === 'minimal' ? 'products-list' : 'products-grid'
  const gridStyle = layout === 'grid'
    ? { gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }
    : {}

  return (
    <div className="catalog-layout">
      {/* Header do catálogo */}
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

          {/* Carrinho no header */}
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

      {/* Busca */}
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

      <div className="catalog-section-bar">
        <div>
          <p className="catalog-section-kicker">Nossa seleção</p>
          <h2 className="catalog-section-title">Peças para acompanhar você</h2>
        </div>
        <span className="catalog-result-count">{filtered.length} {filtered.length === 1 ? 'item' : 'itens'}</span>
      </div>

      {/* Categorias */}
      {categories.length > 0 && (
        <div className="catalog-categories">
          <button
            className={`catalog-category-btn ${!activeCategory ? 'active' : ''}`}
            onClick={() => setActiveCategory('')}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`catalog-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Produtos */}
      <div className="catalog-container">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">?</div>
            <h3 className="empty-state-title">Nenhum produto encontrado</h3>
            <p className="empty-state-text">
              {searchTerm ? 'Tente buscar com outras palavras' : 'Este catálogo ainda não possui produtos'}
            </p>
          </div>
        ) : (
          <div className={gridClass} style={gridStyle}>
            {filtered.map(product => renderProductCard(product))}
          </div>
        )}
      </div>

      <footer className="catalog-footer">
        <span>Catálogo por <strong>CatálogoDigital</strong></span>
        {(store.socialLinks?.instagram || store.socialLinks?.facebook) && (
          <div className="catalog-social-links">
            {store.socialLinks?.instagram && (
              <a href={normalizeSocialUrl(store.socialLinks.instagram, 'instagram')} target="_blank" rel="noopener noreferrer">Instagram</a>
            )}
            {store.socialLinks?.facebook && (
              <a href={normalizeSocialUrl(store.socialLinks.facebook, 'facebook')} target="_blank" rel="noopener noreferrer">Facebook</a>
            )}
          </div>
        )}
      </footer>

      {/* Botão flutuante do carrinho */}
      {totalItems > 0 && (
        <button className="cart-float-btn" onClick={openCart} aria-label="Abrir carrinho">
          <ShoppingBagIcon size={23} />
          <span className="badge-counter">{totalItems}</span>
        </button>
      )}

      {/* Modal de detalhe do produto */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{selectedProduct.name}</h3>
                        <button className="modal-close" onClick={() => setSelectedProduct(null)} aria-label="Fechar produto">×</button>
            </div>
            <div className="modal-body">
              <div className="product-detail-grid">
                <div className="product-gallery">
                  {selectedProduct.images?.length > 0 ? (
                    <>
                      <img
                        src={selectedProduct.images[selectedImage]?.url || selectedProduct.images[selectedImage]}
                        alt={selectedProduct.name}
                        className="product-gallery-main"
                      />
                      {selectedProduct.images.length > 1 && (
                        <div className="product-gallery-thumbs">
                          {selectedProduct.images.map((img, i) => (
                            <img
                              key={i}
                              src={img.url || img}
                              alt={`${selectedProduct.name} ${i + 1}`}
                              className={`product-gallery-thumb ${i === selectedImage ? 'active' : ''}`}
                              onClick={() => setSelectedImage(i)}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="product-gallery-main flex items-center justify-center" style={{ fontSize: '0.8rem', color: 'var(--color-gray-400)', fontWeight: 700 }}>SEM IMAGEM</div>
                  )}
                </div>

                <div className="product-detail-info">
                  <h2 className="product-detail-name">{selectedProduct.name}</h2>
                  <p className="product-detail-price">{formatCurrency(selectedProduct.price)}</p>
                  {selectedProduct.description && (
                    <p className="product-detail-description">{selectedProduct.description}</p>
                  )}
                  <button
                    className="btn btn-primary btn-lg btn-full"
                    onClick={() => {
                      handleAddToCart(selectedProduct)
                      setSelectedProduct(null)
                      openCart()
                    }}
                  >
                    Adicionar ao carrinho
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer do carrinho */}
      <Cart store={store} />
    </div>
  )
}

export default function CatalogPage() {
  const { slug } = useParams()

  return (
    <CartProvider storeSlug={slug}>
      <CatalogContent />
    </CartProvider>
  )
}
