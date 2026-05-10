export default function Card({ as: Tag = 'div', flat, className = '', children, ...rest }) {
  const classes = ['card', flat && 'card--flat', className].filter(Boolean).join(' ');
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
