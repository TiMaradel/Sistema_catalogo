import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { updateStore } from '@/services/storeService'
import { CATALOG_LAYOUTS } from '@/utils/constants'

export default function LayoutPage() {
  const { store, refreshStore } = useAuth()
  const toast = useToast()
  const [selected, setSelected] = useState(store?.layout || 'modern')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await updateStore(store.id, { layout: selected })
      await refreshStore()
      toast.success('Layout atualizado!')
    } catch {
      toast.error('Erro ao salvar layout')
    } finally {
      setSaving(false)
    }
  }

  const layoutPreviews = {
    modern: (
      <div className="flex gap-2" style={{ padding: '8px' }}>
        {[1, 2].map(i => (
          <div key={i} style={{
            flex: 1, background: '#e5e7eb', borderRadius: '8px',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{ height: '60px', background: '#d1d5db' }}></div>
            <div style={{ padding: '8px' }}>
              <div style={{ height: '8px', background: '#9ca3af', borderRadius: '4px', marginBottom: '4px', width: '80%' }}></div>
              <div style={{ height: '6px', background: '#d1d5db', borderRadius: '4px', width: '50%' }}></div>
            </div>
          </div>
        ))}
      </div>
    ),
    classic: (
      <div className="flex flex-col gap-2" style={{ padding: '8px' }}>
        {[1, 2].map(i => (
          <div key={i} className="flex gap-2" style={{ background: '#e5e7eb', borderRadius: '6px', padding: '6px' }}>
            <div style={{ width: '40px', height: '40px', background: '#d1d5db', borderRadius: '4px', flexShrink: 0 }}></div>
            <div style={{ flex: 1 }}>
              <div style={{ height: '6px', background: '#9ca3af', borderRadius: '4px', marginBottom: '4px', width: '70%' }}></div>
              <div style={{ height: '5px', background: '#d1d5db', borderRadius: '4px', width: '40%' }}></div>
            </div>
          </div>
        ))}
      </div>
    ),
    minimal: (
      <div className="flex flex-col items-center gap-3" style={{ padding: '16px' }}>
        <div style={{ width: '60px', height: '60px', background: '#e5e7eb', borderRadius: '50%' }}></div>
        <div style={{ height: '6px', background: '#9ca3af', borderRadius: '4px', width: '60%' }}></div>
        <div style={{ height: '5px', background: '#d1d5db', borderRadius: '4px', width: '40%' }}></div>
      </div>
    ),
    grid: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', padding: '8px' }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{
            aspectRatio: '1', background: '#d1d5db', borderRadius: '4px',
          }}></div>
        ))}
      </div>
    ),
  }

  return (
    <div>
      <h1 className="admin-page-title">Layout do Catálogo</h1>
      <p className="text-secondary mb-6">
        Escolha como seus produtos aparecerão no catálogo público
      </p>

      <div className="layout-selector-grid">
        {Object.values(CATALOG_LAYOUTS).map(layout => (
          <div
            key={layout.id}
            className={`layout-selector-card ${selected === layout.id ? 'selected' : ''}`}
            onClick={() => setSelected(layout.id)}
          >
            <div className="layout-selector-preview">
              {layoutPreviews[layout.id]}
            </div>
            <div className="layout-selector-info">
              <span className="layout-selector-name">
                {layout.icon} {layout.name}
              </span>
              <p className="layout-selector-desc">{layout.description}</p>
              {selected === layout.id && (
                <span className="badge badge-primary mt-2">✓ Selecionado</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button
          className={`btn btn-primary btn-lg ${saving ? 'btn-loading' : ''}`}
          onClick={handleSave}
          disabled={saving || selected === store?.layout}
        >
          Salvar layout
        </button>
        {selected === store?.layout && (
          <p className="text-sm text-secondary mt-2">Este já é o layout ativo do seu catálogo.</p>
        )}
      </div>
    </div>
  )
}
