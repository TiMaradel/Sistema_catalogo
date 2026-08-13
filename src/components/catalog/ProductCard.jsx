import { formatCurrency } from '@/utils/formatters'
import { CheckIcon } from '@/components/common/Icons'

/**
 * ProductCard — renderiza o card de produto conforme o layout da loja.
 *
 * Props:
 *  product  — objeto do produto
 *  layout   — 'modern' | 'classic' | 'minimal' | 'grid'
 *  onSelect — abre o modal de detalhe
 *  onAdd    — adiciona ao carrinho
 *  added    — boolean — se true, mostra feedback de "adicionado"
 */
export default function ProductCard({ product, layout, onSelect, onAdd, added }) {
  const image = product.images?.[0]?.url || product.images?.[0] || ''

  if (layout === 'classic') {
    return (
      <div className="product-card-list" onClick={() => onSelect(product)}>
        {image ? (
          <img src={image} alt={product.name} className="product-card-list-image" />
        ) : (
          <div
            className="product-card-list-image flex items-center justify-center"
            style={{ fontSize: '0.7rem', color: 'var(--color-gray-400)', fontWeight: 700 }}
          >
            IMG
          </div>
        )}
        <div className="product-card-list-info">
          <div>
            <h3 className="product-card-name">{product.name}</h3>
            {product.description && (
              <p className="product-card-description">{product.description}</p>
            )}
          </div>
          <div className="product-card-footer">
            <span className="product-card-price">{formatCurrency(product.price)}</span>
            <AddButton added={added} onAdd={(e) => { e.stopPropagation(); onAdd(product) }} />
          </div>
        </div>
      </div>
    )
  }

  if (layout === 'minimal') {
    return (
      <div
        className="product-card"
        style={{ border: 'none', borderBottom: '1px solid var(--color-border)', borderRadius: 0 }}
        onClick={() => onSelect(product)}
      >
        <div className="product-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>{product.name}</h3>
            {product.description && (
              <p className="text-sm text-secondary mt-1">{product.description}</p>
            )}
            <p style={{ color: 'var(--color-primary)', fontWeight: 700, marginTop: '4px' }}>
              {formatCurrency(product.price)}
            </p>
          </div>
          {image && (
            <img
              src={image}
              alt={product.name}
              style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-lg)', objectFit: 'cover' }}
            />
          )}
          <AddButton added={added} onAdd={(e) => { e.stopPropagation(); onAdd(product) }} />
        </div>
      </div>
    )
  }

  if (layout === 'grid') {
    return (
      <div className="product-card" onClick={() => onSelect(product)}>
        <div className="product-card-image-wrapper">
          {image ? (
            <img src={image} alt={product.name} className="product-card-image" style={{ aspectRatio: '1' }} />
          ) : (
            <div
              className="product-card-image flex items-center justify-center"
              style={{ aspectRatio: '1', fontSize: '0.7rem', color: 'var(--color-gray-400)', fontWeight: 700 }}
            >
              IMG
            </div>
          )}
        </div>
        <div style={{ padding: '8px 12px 12px' }}>
          <h3 style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: '2px' }}>{product.name}</h3>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-primary)' }}>
              {formatCurrency(product.price)}
            </span>
            <AddButton
              added={added}
              onAdd={(e) => { e.stopPropagation(); onAdd(product) }}
              small
            />
          </div>
        </div>
      </div>
    )
  }

  /* Layout modern (default) */
  return (
    <div className="product-card" onClick={() => onSelect(product)}>
      <div className="product-card-image-wrapper">
        {image ? (
          <img src={image} alt={product.name} className="product-card-image" />
        ) : (
          <div
            className="product-card-image flex items-center justify-center"
            style={{ fontSize: '0.7rem', color: 'var(--color-gray-400)', fontWeight: 700 }}
          >
            IMG
          </div>
        )}
        {product.featured && (
          <div className="product-card-badge">
            <span className="badge badge-warning">Destaque</span>
          </div>
        )}
      </div>
      <div className="product-card-body">
        <h3 className="product-card-name">{product.name}</h3>
        {product.description && (
          <p className="product-card-description">{product.description}</p>
        )}
        <div className="product-card-footer">
          <span className="product-card-price">{formatCurrency(product.price)}</span>
          <AddButton added={added} onAdd={(e) => { e.stopPropagation(); onAdd(product) }} />
        </div>
      </div>
    </div>
  )
}

/**
 * Botão de adicionar ao carrinho com feedback visual.
 * Quando `added` é true, exibe um ✓ verde por 700ms.
 */
function AddButton({ added, onAdd, small }) {
  return (
    <button
      className={`product-card-add-btn${added ? ' added' : ''}`}
      aria-label="Adicionar ao carrinho"
      style={small ? { width: '28px', height: '28px', fontSize: '14px' } : undefined}
      onClick={onAdd}
    >
      {added ? <CheckIcon size={small ? 13 : 16} /> : '+'}
    </button>
  )
}
