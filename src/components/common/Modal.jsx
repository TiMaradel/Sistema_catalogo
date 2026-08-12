import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, footer, size = 'default' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      return () => window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeStyles = {
    default: { maxWidth: '540px' },
    sm: { maxWidth: '400px' },
    lg: { maxWidth: '720px' },
    xl: { maxWidth: '900px' },
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={sizeStyles[size]}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Janela de diálogo'}
      >
        {title && (
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
              <button className="modal-close" onClick={onClose} aria-label="Fechar janela">×</button>
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
