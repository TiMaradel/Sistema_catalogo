import { useState } from 'react'
import { formatCurrency } from '@/utils/formatters'
import { CheckIcon } from '@/components/common/Icons'

/**
 * ProductModal — Modal de detalhe de produto no catálogo público.
 *
 * Props:
 *  product     — objeto do produto selecionado (ou null para fechar)
 *  onClose     — fecha o modal
 *  onAddToCart — (product) => adiciona ao carrinho
 */
export default function ProductModal({ product, onClose, onAddToCart }) {
  const [selectedImage, setSelectedImage] = useState(0)

  if (!product) return null

  const images = product.images || []
  const mainSrc = images[selectedImage]?.url || images[selectedImage] || null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '800px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{product.name}</h3>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Fechar produto"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="product-detail-grid">

            {/* Galeria de imagens */}
            <div className="product-gallery">
              {images.length > 0 ? (
                <>
                  <img
                    src={mainSrc}
                    alt={product.name}
                    className="product-gallery-main"
                  />
                  {images.length > 1 && (
                    <div className="product-gallery-thumbs">
                      {images.map((img, i) => (
                        <img
                          key={i}
                          src={img.url || img}
                          alt={`${product.name} ${i + 1}`}
                          className={`product-gallery-thumb ${i === selectedImage ? 'active' : ''}`}
                          onClick={() => setSelectedImage(i)}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="product-gallery-main flex items-center justify-center"
                  style={{ fontSize: '0.8rem', color: 'var(--color-gray-400)', fontWeight: 700 }}
                >
                  SEM IMAGEM
                </div>
              )}
            </div>

            {/* Informações do produto */}
            <div className="product-detail-info">
              <h2 className="product-detail-name">{product.name}</h2>
              <p className="product-detail-price">{formatCurrency(product.price)}</p>
              {product.description && (
                <p className="product-detail-description">{product.description}</p>
              )}
              <button
                className="btn btn-primary btn-lg btn-full"
                onClick={() => onAddToCart(product)}
              >
                <CheckIcon size={18} />
                Adicionar ao carrinho
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
