export default function Tag({ variant = 'muted', children, className = '' }) {
  return <span className={`tag tag--${variant} ${className}`}>{children}</span>;
}
