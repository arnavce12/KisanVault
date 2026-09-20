export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-surface-bright rounded-2xl p-6 shadow-sm border border-border ${className}`} {...props}>
      {children}
    </div>
  );
}
