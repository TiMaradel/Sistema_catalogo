/**
 * CategoryFilter — Barra de filtro por categoria do catálogo público.
 *
 * Props:
 *  categories    — array de { id, name }
 *  activeCategory — id da categoria ativa ('' = todos)
 *  onChange       — callback(categoryId)
 */
export default function CategoryFilter({ categories, activeCategory, onChange }) {
  if (!categories || categories.length === 0) return null

  return (
    <div className="catalog-categories">
      <button
        className={`catalog-category-btn ${!activeCategory ? 'active' : ''}`}
        onClick={() => onChange('')}
      >
        Todos
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          className={`catalog-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
          onClick={() => onChange(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
