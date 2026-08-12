import { useState, useEffect } from 'react'
import { getAllStores, toggleStoreActive, deleteStore } from '@/services/storeService'
import { useToast } from '@/contexts/ToastContext'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { formatDate } from '@/utils/formatters'
import { PLANS } from '@/utils/constants'
import { getCatalogPath } from '@/utils/urls'

export default function SuperDashboard() {
  const toast = useToast()
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function loadStores() {
    try {
      const data = await getAllStores()
      setStores(data)
    } catch {
      toast.error('Erro ao carregar lojas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadStores() }, [])

  async function handleToggle(store) {
    try {
      await toggleStoreActive(store.id, !store.active)
      setStores(prev =>
        prev.map(s => s.id === store.id ? { ...s, active: !s.active } : s)
      )
      toast.success(store.active ? 'Loja desativada' : 'Loja ativada')
    } catch {
      toast.error('Erro ao alterar status')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteStore(deleteTarget.id)
      setStores(prev => prev.filter(s => s.id !== deleteTarget.id))
      toast.success('Loja excluída')
    } catch {
      toast.error('Erro ao excluir loja')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  if (loading) return <LoadingSpinner text="Carregando plataforma..." />

  const activeCount = stores.filter(s => s.active).length

  return (
    <div>
      <h1 className="admin-page-title">Painel da plataforma</h1>

      <div className="stats-grid mb-8">
        <div className="stat-card">
          <span className="stat-card-label">Total de Lojas</span>
          <span className="stat-card-value">{stores.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Lojas Ativas</span>
          <span className="stat-card-value" style={{ color: 'var(--color-success)' }}>{activeCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Lojas Inativas</span>
          <span className="stat-card-value" style={{ color: 'var(--color-error)' }}>{stores.length - activeCount}</span>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Todas as lojas</h2>

      {stores.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">L</div>
          <h3 className="empty-state-title">Nenhuma loja cadastrada</h3>
          <p className="empty-state-text">As lojas aparecerão aqui quando usuários criarem suas contas.</p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Loja</th>
                <th>Slug</th>
                <th>Plano</th>
                <th>Status</th>
                <th>Criada em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {stores.map(store => (
                <tr key={store.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      {store.logo ? (
                        <img src={store.logo} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800 }}>L</div>
                      )}
                      <span className="font-semibold">{store.name}</span>
                    </div>
                  </td>
                  <td>
                    <a href={getCatalogPath(store.slug)} target="_blank" rel="noopener noreferrer" className="text-accent">
                      /{store.slug}
                    </a>
                  </td>
                  <td>
                    <span className="badge badge-primary">
                      {PLANS[store.plan?.toUpperCase()]?.name || store.plan || 'Grátis'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${store.active ? 'badge-success' : 'badge-error'}`}>
                      {store.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="text-sm text-secondary">{formatDate(store.createdAt)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleToggle(store)}
                      >
                        {store.active ? 'Pausar' : 'Ativar'}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--color-error)' }}
                        onClick={() => setDeleteTarget(store)}
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir loja"
        message={`Excluir a loja "${deleteTarget?.name}"? Todos os produtos e dados serão perdidos.`}
        confirmText="Excluir definitivamente"
        loading={deleting}
      />
    </div>
  )
}
