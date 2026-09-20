export function Badge({ children, variant = 'neutral', icon, className = '', ...props }) {
  const variants = {
    neutral: "bg-surface-container-low text-text-muted",
    success: "bg-primary-container text-on-primary-container",
    error: "bg-error-container text-on-error-container",
    active: "bg-secondary-container text-on-secondary-container",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`} {...props}>
      {icon && <span className="material-symbols-outlined text-[14px]">{icon}</span>}
      {children}
    </span>
  );
}
