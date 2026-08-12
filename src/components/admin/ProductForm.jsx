import { useEffect, useRef, useState } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { createProduct, updateProduct } from '@/services/productService'
import { uploadMultipleImages } from '@/services/storageService'
import ImageUpload from '@/components/common/ImageUpload'

export default function ProductForm({ storeId, product, categories, maxProducts = -1, maxImages = 5, onSuccess, onCancel }) {
  const toast = useToast()
  const isEditing = !!product

  const [name, setName] = useState(product?.name || '')
  const [description, setDescription] = useState(product?.description || '')
  const [price, setPrice] = useState(product?.price ?? '')
  const [categoryId, setCategoryId] = useState(product?.categoryId || '')
  const [featured, setFeatured] = useState(product?.featured || false)
  const [images, setImages] = useState(product?.images || [])
  const [newFiles, setNewFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const newFilesRef = useRef([])

  useEffect(() => () => {
    newFilesRef.current.forEach(file => URL.revokeObjectURL(file.preview))
  }, [])

  function validate() {
    const errs = {}
    if (!name.trim()) errs.name = 'Nome é obrigatório'
    if (name.trim().length > 120) errs.name = 'Use no máximo 120 caracteres'
    if (price === '' || price === null || price === undefined) errs.price = 'Preço é obrigatório'
    if (isNaN(parseFloat(price))) errs.price = 'Preço inválido'
    if (parseFloat(price) < 0) errs.price = 'O preço não pode ser negativo'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleAddFiles(files) {
    const previews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true,
    }))
    setNewFiles(prev => {
      const next = [...prev, ...previews]
      newFilesRef.current = next
      return next
    })
  }

  function handleRemoveExisting(index) {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  function handleRemoveNew(index) {
    setNewFiles(prev => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      newFilesRef.current = updated
      return updated
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      let allImages = [...images]

      if (newFiles.length > 0) {
        const files = newFiles.map(f => f.file)
        const uploaded = await uploadMultipleImages(storeId, files)
        allImages = [...allImages, ...uploaded]
      }

      const data = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        categoryId: categoryId || null,
        featured,
        images: allImages,
      }

      if (isEditing) {
        await updateProduct(storeId, product.id, data)
      } else {
        await createProduct(storeId, data, maxProducts)
      }

      newFiles.forEach(f => URL.revokeObjectURL(f.preview))
      newFilesRef.current = []
      onSuccess()
    } catch (error) {
      toast.error(error.message || 'Erro ao salvar produto')
    } finally {
      setLoading(false)
    }
  }

  const allImages = [
    ...images.map(img => ({ url: img.url || img, existing: true })),
    ...newFiles.map(f => ({ url: f.preview, isNew: true })),
  ]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="input-group">
        <label className="input-label" htmlFor="product-name">Nome do produto *</label>
        <input
          id="product-name"
          type="text"
          className={`input-field ${errors.name ? 'input-error' : ''}`}
          placeholder="Ex: Camiseta Básica Preta"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <span className="input-error-text">{errors.name}</span>}
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="product-description">Descrição</label>
        <textarea
          id="product-description"
          className="input-field input-textarea"
          placeholder="Descreva o produto..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
        <div className="input-group" style={{ flex: 1, minWidth: '150px' }}>
          <label className="input-label" htmlFor="product-price">Preço (R$) *</label>
          <input
            id="product-price"
            type="number"
            step="0.01"
            min="0"
            className={`input-field ${errors.price ? 'input-error' : ''}`}
            placeholder="0,00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          {errors.price && <span className="input-error-text">{errors.price}</span>}
        </div>

        <div className="input-group" style={{ flex: 1, minWidth: '150px' }}>
          <label className="input-label" htmlFor="product-category">Categoria</label>
          <select
            id="product-category"
            className="input-field input-select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Sem categoria</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="toggle">
          <input
            id="product-featured"
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
        <span className="text-sm">Produto em destaque</span>
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="product-images">Fotos do produto</label>
        <ImageUpload
          images={allImages}
          onAdd={handleAddFiles}
          onRemove={(index) => {
            if (index < images.length) {
              handleRemoveExisting(index)
            } else {
              handleRemoveNew(index - images.length)
            }
          }}
          maxImages={maxImages}
          inputId="product-images"
          loading={loading}
        />
      </div>

      <div className="flex gap-3 justify-end mt-4">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button
          type="submit"
          className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
          disabled={loading}
        >
          {isEditing ? 'Salvar alterações' : 'Criar produto'}
        </button>
      </div>
    </form>
  )
}
