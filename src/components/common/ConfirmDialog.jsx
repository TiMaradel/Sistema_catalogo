import Modal from './Modal'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
}) {
  const iconMap = {
    danger: '×',
    warning: '!',
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="confirm-dialog">
        <div className={`confirm-dialog-icon ${variant}`}>
          {iconMap[variant] || '?'}
        </div>
        <h3 className="confirm-dialog-title">{title}</h3>
        <p className="confirm-dialog-text">{message}</p>
        <div className="confirm-dialog-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
            {cancelText}
          </button>
          <button
            className={`btn btn-${variant} ${loading ? 'btn-loading' : ''}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
