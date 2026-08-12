export function ShoppingBagIcon({ size = 22, strokeWidth = 1.8, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5.5 8.5h13l1 11h-15l1-11Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M8.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  )
}
