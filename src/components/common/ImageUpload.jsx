import { useState, useRef } from 'react'
import { validateImageFile } from '@/services/storageService'

export default function ImageUpload({
  images = [],
  onAdd,
  onRemove,
  maxImages = 5,
  loading = false,
  inputId = 'image-upload',
}) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  function handleFiles(files) {
    setError('')
    const fileArray = Array.from(files)

    if (images.length + fileArray.length > maxImages) {
      setError(`Máximo de ${maxImages} imagens permitidas`)
      return
    }

    for (const file of fileArray) {
      const validationError = validateImageFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    onAdd(fileArray)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files)
    }
  }

  function handleDragOver(e) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    setDragOver(false)
  }

  function handleClick() {
    fileInputRef.current?.click()
  }

  function handleInputChange(e) {
    if (e.target.files.length) {
      handleFiles(e.target.files)
    }
    e.target.value = ''
  }

  return (
    <div>
      {images.length < maxImages && (
        <div
          className={`upload-area ${dragOver ? 'drag-over' : ''}`}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="button"
          tabIndex="0"
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handleClick()
            }
          }}
          aria-label="Adicionar imagens do produto"
        >
          <div className="upload-area-icon">IMG</div>
          <p className="upload-area-text">
            <span className="upload-area-highlight">Clique para enviar</span>
            {' '}ou arraste as imagens aqui
          </p>
          <p className="text-xs text-secondary mt-2">
            JPG, PNG ou WebP • Máximo 5MB • {images.length}/{maxImages} imagens
          </p>
          {loading && <p className="text-sm text-primary mt-2">Enviando...</p>}
          <input
            id={inputId}
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            style={{ display: 'none' }}
            onChange={handleInputChange}
          />
        </div>
      )}

      {error && <p className="input-error-text mt-2">{error}</p>}

      {images.length > 0 && (
        <div className="upload-previews">
          {images.map((img, index) => (
            <div key={index} className="upload-preview-item">
              <img
                src={img.url || img.preview || img}
                alt={`Imagem ${index + 1}`}
                className="upload-preview-image"
              />
              <button
                type="button"
                className="upload-preview-remove"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(index)
                }}
                disabled={loading}
                title="Remover imagem"
                aria-label={`Remover imagem ${index + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
