import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser, guestLogin, updateUserData, deleteUser, logoutUser, loginUser } from '@/services/authService'
import { createStore } from '@/services/storeService'
import { generateSlug } from '@/utils/formatters'
import { AUTH_ERRORS } from '@/utils/constants'
import { validateEmail, validateName, validateSlug, validateWhatsApp } from '@/utils/validators'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [storeName, setStoreName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const slug = generateSlug(storeName)
    const validationError = validateName(name) || validateName(storeName) || validateEmail(email) || validateWhatsApp(whatsapp) || validateSlug(slug)
    if (validationError) {
      setError(validationError)
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setLoading(true)
    let createdUser = null
    try {
      const user = await registerUser(email, password, name, 'admin', false)
      createdUser = user

      const storeId = await createStore({
        name: storeName,
        slug,
        whatsapp: whatsapp.replace(/\D/g, ''),
        logo: '',
        description: '',
        layout: 'modern',
        theme: 'light',
        socialLinks: {},
        ownerId: user.uid,
        plan: 'free',
      })

      await updateUserData(user.uid, { storeId })
      await loginUser(email, password)

      navigate('/admin')
    } catch (err) {
      if (createdUser) {
        await deleteUser(createdUser.uid).catch(() => {})
        await logoutUser().catch(() => {})
      }
      const msg = AUTH_ERRORS[err.code] || err.message || 'Erro ao criar conta. Tente novamente.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleGuestLogin() {
    setLoading(true)
    try {
      await guestLogin()
      navigate('/admin')
    } catch {
      setError('Erro ao entrar como teste.')
    } finally {
      setLoading(false)
    }
  }

  async function handleOpenDemoCatalog() {
    setLoading(true)
    setError('')
    sessionStorage.setItem('catalog_demo_destination', '/loja-teste')
    try {
      await guestLogin()
    } catch {
      sessionStorage.removeItem('catalog_demo_destination')
      setError('Não foi possível abrir o catálogo de teste.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">C</div>
          <span className="auth-logo-text">CatálogoDigital</span>
        </div>

        <h1 className="auth-title">Criar sua conta</h1>
        <p className="auth-subtitle">Configure seu catálogo em poucos minutos</p>

        <div className="auth-demo-access">
          <button
            type="button"
            onClick={handleOpenDemoCatalog}
            className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
          >
            Ver catálogo de teste
          </button>
          <p>Veja primeiro uma vitrine pronta antes de criar sua conta.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="register-name">Seu nome</label>
            <input
              id="register-name"
              type="text"
              className="input-field"
              placeholder="João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="register-store-name">Nome da loja / catálogo</label>
            <input
              id="register-store-name"
              type="text"
              className="input-field"
              placeholder="Ex: Padaria do Zé"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
            {storeName && (
              <p className="text-xs text-secondary">
                Link do catálogo: seusite.com/<strong className="text-accent">{generateSlug(storeName)}</strong>
              </p>
            )}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="register-whatsapp">WhatsApp (com DDD)</label>
            <input
              id="register-whatsapp"
              type="tel"
              className="input-field"
              placeholder="(11) 99999-9999"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              className="input-field"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="register-password">Senha</label>
            <input
              id="register-password"
              type="password"
              className="input-field"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="input-error-text" style={{ textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
          >
            Criar catálogo grátis
          </button>

          <button
            type="button"
            onClick={handleGuestLogin}
            className={`btn btn-outline btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
            style={{ marginTop: '12px' }}
          >
            Abrir painel de teste
          </button>
        </form>

        <div className="auth-footer">
          Já tem uma conta?{' '}
          <Link to="/login" className="auth-link">Fazer login</Link>
        </div>
      </div>
    </div>
  )
}
