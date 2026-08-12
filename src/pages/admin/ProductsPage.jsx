import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { getProductsByStore, deleteProduct, toggleProductActive } from '@/services/productService'
import { getCategoriesByStore } from '@/services/categoryService'
import { deleteMultipleImages } from '@/services/storageService'
import Modal from '@/components/common/Modal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import ProductForm from '@/components/admin/ProductForm'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { formatCurrency } from '@/utils/formatters'
import { getPlan } from '@/utils/constants'

export default function ProductsPage() {
  const { store } = useAuth()
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function loadData() {
    if (!store?.id) {
      setLoading(false)
      return
    }
    try {
      const [prods, cats] = await Promise.all([
        getProductsByStore(store.id),
        getCategoriesByStore(store.id),
      ])
      setProducts(prods)
      setCategories(cats)
    } catch (error) {
      toast.error(error.message || 'Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [store?.id])

  function handleEdit(product) {
    setEditingProduct(product)
    setShowForm(true)
  }

  function handleNew() {
    setEditingProduct(null)
    setShowForm(true)
  }

  function handleFormClose() {
    setShowForm(false)
    setEditingProduct(null)
  }

  async function handleFormSuccess() {
    handleFormClose()
    setLoading(true)
    await loadData()
    toast.success(editingProduct ? 'Produto atualizado!' : 'Produto criado!')
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      if (deleteTarget.images?.length) {
        const paths = deleteTarget.images
          .filter(img => img.path)
          .map(img => img.path)
        if (paths.length) await deleteMultipleImages(paths)
      }
      await deleteProduct(store.id, deleteTarget.id)
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id))
      toast.success('Produto excluído')
    } catch (error) {
      toast.error(error.message || 'Erro ao excluir produto')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  async function handleToggleActive(product) {
    try {
      await toggleProductActive(store.id, product.id, !product.active)
      setProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, active: !p.active } : p)
      )
      toast.success(product.active ? 'Produto desativado' : 'Produto ativado')
    } catch (error) {
      toast.error(error.message || 'Erro ao alterar status')
    }
  }

  const filtered = products.filter(p => {
    const matchSearch = !searchTerm ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategory = !filterCategory || p.categoryId === filterCategory
    return matchSearch && matchCategory
  })
  const plan = getPlan(store?.plan)
  const productLimitReached = plan.maxProducts !== -1 && products.length >= plan.maxProducts

  if (loading) return <LoadingSpinner text="Carregando produtos..." />

  return (
    <div>
      <div className="flex items-center justify-between mb-6" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Produtos</h1>
        <button className="btn btn-primary" onClick={handleNew} disabled={productLimitReached} title={productLimitReached ? 'Limite do plano atingido' : undefined}>
          + Novo Produto
        </button>
      </div>

      <div className="limit-banner">
        <span><strong>{products.length}</strong> produto{products.length === 1 ? '' : 's'} no plano {plan.name}</span>
        <span>{plan.maxProducts === -1 ? 'Sem limite' : `limite de ${plan.maxProducts}`}</span>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-6" style={{ flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ maxWidth: '300px' }}>
          <span className="search-bar-icon">⌕</span>
          <input
            aria-label="Buscar produto"
            type="text"
            className="search-bar-input"
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {categories.length > 0 && (
          <select
            aria-label="Filtrar por categoria"
            className="input-field input-select"
            style={{ maxWidth: '200px' }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Todas categorias</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Lista de produtos */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">P</div>
          <h3 className="empty-state-title">
            {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
          </h3>
          <p className="empty-state-text">
            {searchTerm
              ? 'Tente buscar com outro termo'
              : 'Clique em "Novo Produto" para adicionar seu primeiro produto ao catálogo.'
            }
          </p>
        </div>
      ) : (
        <div className="products-grid">
          {filtered.map(product => (
            <div key={product.id} className="product-card" style={{ cursor: 'default' }}>
              <div className="product-card-image-wrapper">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0].url || product.images[0]}
                    alt={product.name}
                    className="product-card-image"
                  />
                ) : (
                  <div
                    className="product-card-image flex items-center justify-center"
                    style={{ fontSize: '0.7rem', color: 'var(--color-gray-400)', fontWeight: 700 }}
                  >
                    IMG
                  </div>
                )}
                {!product.active && (
                  <div className="product-card-badge">
                    <span className="badge badge-error">Inativo</span>
                  </div>
                )}
                {product.featured && (
                  <div className="product-card-badge" style={{ right: '12px', left: 'auto' }}>
                    <span className="badge badge-warning">Destaque</span>
                  </div>
                )}
              </div>

              <div className="product-card-body">
                <h3 className="product-card-name">{product.name}</h3>
                <p className="product-card-description">{product.description}</p>

                <div className="product-card-footer">
                  <span className="product-card-price">
                    {formatCurrency(product.price)}
                  </span>
                </div>

                {/* Ações */}
                <div className="flex gap-2 mt-4">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleEdit(product)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleToggleActive(product)}
                  >
                    {product.active ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--color-error)' }}
                    onClick={() => setDeleteTarget(product)}
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal do formulário de produto */}
      <Modal
        isOpen={showForm}
        onClose={handleFormClose}
        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
        size="lg"
      >
        <ProductForm
          storeId={store?.id}
          product={editingProduct}
          categories={categories}
          maxProducts={plan.maxProducts}
          maxImages={plan.maxImages}
          onSuccess={handleFormSuccess}
          onCancel={handleFormClose}
        />
      </Modal>

      {/* Diálogo de confirmação de exclusão */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir produto"
        message={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        loading={deleting}
      />
    </div>
  )
}
