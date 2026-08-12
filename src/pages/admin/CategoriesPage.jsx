import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { getCategoriesByStore, createCategory, updateCategory, deleteCategory } from '@/services/categoryService'
import Modal from '@/components/common/Modal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { getPlan } from '@/utils/constants'

export default function CategoriesPage() {
  const { store } = useAuth()
  const toast = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function loadCategories() {
    if (!store?.id) {
      setLoading(false)
      return
    }
    try {
      const cats = await getCategoriesByStore(store.id)
      setCategories(cats)
    } catch (error) {
      toast.error(error.message || 'Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCategories() }, [store?.id])

  const plan = getPlan(store?.plan)
  const categoryLimitReached = plan.maxCategories !== -1 && categories.length >= plan.maxCategories

  function openNew() {
    setEditing(null)
    setName('')
    setShowForm(true)
  }

  function openEdit(cat) {
    setEditing(cat)
    setName(cat.name)
    setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) {
      toast.warning('Digite o nome da categoria')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await updateCategory(store.id, editing.id, { name: name.trim() })
        toast.success('Categoria atualizada')
      } else {
        await createCategory(store.id, {
          name: name.trim(),
          order: categories.length,
        }, plan.maxCategories)
        toast.success('Categoria criada')
      }
      setShowForm(false)
      setLoading(true)
      await loadCategories()
    } catch (error) {
      toast.error(error.message || 'Erro ao salvar categoria')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteCategory(store.id, deleteTarget.id)
      setCategories(prev => prev.filter(c => c.id !== deleteTarget.id))
      toast.success('Categoria excluída')
    } catch (error) {
      toast.error(error.message || 'Erro ao excluir categoria')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  if (loading) return <LoadingSpinner text="Carregando categorias..." />

  return (
    <div>
      <div className="flex items-center justify-between mb-6" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <h1 className="admin-page-title" style={{ marginBottom: 0 }}>Categorias</h1>
        <button className="btn btn-primary" onClick={openNew} disabled={categoryLimitReached} title={categoryLimitReached ? 'Limite do plano atingido' : undefined}>
          + Nova Categoria
        </button>
      </div>

      <div className="limit-banner">
        <span><strong>{categories.length}</strong> categoria{categories.length === 1 ? '' : 's'} no plano {plan.name}</span>
        <span>{plan.maxCategories === -1 ? 'Sem limite' : `limite de ${plan.maxCategories}`}</span>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">C</div>
          <h3 className="empty-state-title">Nenhuma categoria</h3>
          <p className="empty-state-text">
            Crie categorias para organizar seus produtos no catálogo.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {categories.map((cat, index) => (
            <div key={cat.id} className="card" style={{ padding: '16px 20px' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-secondary text-sm">#{index + 1}</span>
                  <span className="font-semibold">{cat.name}</span>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(cat)}>
                    Editar
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--color-error)' }}
                    onClick={() => setDeleteTarget(cat)}
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de formulário */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Editar Categoria' : 'Nova Categoria'}
        size="sm"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)} disabled={saving}>
              Cancelar
            </button>
            <button
              className={`btn btn-primary ${saving ? 'btn-loading' : ''}`}
              onClick={handleSave}
              disabled={saving}
            >
              {editing ? 'Salvar' : 'Criar'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label" htmlFor="category-name">Nome da categoria</label>
            <input
              id="category-name"
              type="text"
              className="input-field"
              placeholder="Ex: Eletrônicos, Roupas, Bebidas..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir categoria"
        message={`Excluir "${deleteTarget?.name}"? Os produtos desta categoria não serão excluídos, apenas ficarão sem categoria.`}
        confirmText="Excluir"
        loading={deleting}
      />
    </div>
  )
}
