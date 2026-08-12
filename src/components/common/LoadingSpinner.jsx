export default function LoadingSpinner({ size = 'default', text = '' }) {
  const sizeClass = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : ''

  if (text) {
    return (
      <div className="loading-page">
        <div className={`spinner ${sizeClass}`}></div>
        <p className="loading-text">{text}</p>
      </div>
    )
  }

  return <div className={`spinner ${sizeClass}`}></div>
}
