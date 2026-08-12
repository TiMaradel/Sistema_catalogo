import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { updateStore } from '@/services/storeService'
import { uploadImage } from '@/services/storageService'
import { generateSlug } from '@/utils/formatters'
import { validateSlug, validateWhatsApp } from '@/utils/validators'
import { copyText } from '@/utils/clipboard'

export default function SettingsPage() {
  const { store, refreshStore } = useAuth()
  const toast = useToast()

  const [name, setName] = useState(store?.name || '')
  const [slug, setSlug] = useState(store?.slug || '')
  const [description, setDescription] = useState(store?.description || '')
  const [whatsapp, setWhatsapp] = useState(store?.whatsapp || '')
  const [instagram, setInstagram] = useState(store?.socialLinks?.instagram || '')
  const [facebook, setFacebook] = useState(store?.socialLinks?.facebook || '')
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(store?.logo || '')

  useEffect(() => {
    if (!store) return
    setName(store.name || '')
    setSlug(store.slug || '')
    setDescription(store.description || '')
    setWhatsapp(store.whatsapp || '')
    setInstagram(store.socialLinks?.instagram || '')
    setFacebook(store.socialLinks?.facebook || '')
    setLogoPreview(store.logo || '')
  }, [store])

  function handleLogoChange(e) {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    const normalizedSlug = slug.trim() || generateSlug(name)
    const slugError = validateSlug(normalizedSlug)
    const whatsappError = validateWhatsApp(whatsapp)
    if (!name.trim() || slugError || whatsappError) {
      toast.warning(slugError || whatsappError || 'Nome e WhatsApp são obrigatórios')
      return
    }

    setLoading(true)
    try {
      let logoUrl = store?.logo || ''

      if (logoFile) {
        const result = await uploadImage(store.id, logoFile, 'logo')
        logoUrl = result.url
      }

      await updateStore(store.id, {
        name: name.trim(),
        slug: normalizedSlug,
        description: description.trim(),
        whatsapp: whatsapp.replace(/\D/g, ''),
        logo: logoUrl,
        socialLinks: {
          instagram: instagram.trim(),
          facebook: facebook.trim(),
        },
      })

      await refreshStore()
      toast.success('Configurações salvas!')
    } catch (error) {
      toast.error(error.message || 'Erro ao salvar configurações')
    } finally {
      setLoading(false)
    }
  }

  const catalogUrl = slug ? `${window.location.origin}/${slug}` : ''

  function handleCopyCatalogUrl() {
    copyText(catalogUrl)
      .then(() => toast.success('Link copiado'))
      .catch(() => toast.warning('Não foi possível copiar o link automaticamente'))
  }

  return (
    <div>
      <h1 className="admin-page-title">Configurações</h1>

      <form onSubmit={handleSave} className="flex flex-col gap-6" style={{ maxWidth: '600px' }}>
        {/* Logo */}
        <div className="input-group">
          <label className="input-label">Logo da loja</label>
          <div className="flex items-center gap-4">
            <div
              style={{
                width: 80, height: 80,
                borderRadius: 'var(--radius-xl)',
                background: 'var(--color-bg-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', border: '2px solid var(--color-border)',
                fontSize: '2rem',
              }}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>S</span>
              )}
            </div>
            <div>
              <label className="btn btn-outline btn-sm" htmlFor="store-logo" style={{ cursor: 'pointer' }}>
                Alterar logo
                <input id="store-logo" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
              </label>
              <p className="text-xs text-secondary mt-1">JPG, PNG ou WebP • Máx 5MB</p>
            </div>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="store-name">Nome da loja *</label>
          <input
            id="store-name"
            type="text"
            className="input-field"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (!store?.slug) setSlug(generateSlug(e.target.value))
            }}
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="store-slug">Link do catálogo</label>
          <input
            id="store-slug"
            type="text"
            className="input-field"
            value={slug}
            onChange={(e) => setSlug(generateSlug(e.target.value))}
          />
          {catalogUrl && (
            <div className="public-link-actions">
              <p className="text-xs text-secondary">Seu catálogo: <strong className="text-accent">{catalogUrl}</strong></p>
              <div className="flex gap-2">
                <button type="button" className="btn btn-outline btn-sm" onClick={handleCopyCatalogUrl}>Copiar link</button>
                <a className="btn btn-ghost btn-sm" href={catalogUrl} target="_blank" rel="noopener noreferrer">Abrir catálogo</a>
              </div>
            </div>
          )}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="store-description">Descrição da loja</label>
          <textarea
            id="store-description"
            className="input-field input-textarea"
            placeholder="Uma breve descrição do seu negócio..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="store-whatsapp">WhatsApp (com DDD) *</label>
          <input
            id="store-whatsapp"
            type="tel"
            className="input-field"
            placeholder="(11) 99999-9999"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
          <p className="text-xs text-secondary">Os pedidos dos clientes serão enviados para este número</p>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="store-instagram">Instagram</label>
          <input
            id="store-instagram"
            type="text"
            className="input-field"
            placeholder="@suapagina"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="store-facebook">Facebook</label>
          <input
            id="store-facebook"
            type="text"
            className="input-field"
            placeholder="facebook.com/suapagina"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className={`btn btn-primary btn-lg ${loading ? 'btn-loading' : ''}`}
          disabled={loading}
        >
          Salvar configurações
        </button>
      </form>
    </div>
  )
}
