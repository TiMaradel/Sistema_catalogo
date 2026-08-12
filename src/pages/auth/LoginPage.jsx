import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, guestLogin } from '@/services/authService'
import { AUTH_ERRORS } from '@/utils/constants'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Preencha todos os campos')
      return
    }

    setLoading(true)
    try {
      await loginUser(email, password)
      navigate('/admin')
    } catch (err) {
      const msg = AUTH_ERRORS[err.code] || 'Erro ao fazer login. Tente novamente.'
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

        <h1 className="auth-title">Bem-vindo de volta</h1>
        <p className="auth-subtitle">Entre na sua conta para gerenciar seu catálogo</p>

        <div className="auth-demo-access">
          <button
            type="button"
            onClick={handleOpenDemoCatalog}
            className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
          >
            Ver catálogo de teste
          </button>
          <p>Veja como a vitrine fica no celular, com produtos, carrinho e checkout.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="input-field"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="login-password">Senha</label>
            <input
              id="login-password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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
            Entrar
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
          Não tem uma conta?{' '}
          <Link to="/register" className="auth-link">Criar conta</Link>
        </div>
      </div>
    </div>
  )
}
