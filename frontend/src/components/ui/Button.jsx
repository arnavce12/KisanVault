export function Button({ children, variant = 'primary', icon, className = '', ...props }) {
  const baseClasses = "h-12 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer";
  
  const variants = {
    primary: "bg-primary text-surface-bright hover:bg-secondary shadow-sm",
    secondary: "bg-surface-container text-text hover:bg-border border border-border",
    ghost: "bg-transparent text-primary hover:bg-primary-container"
  };

  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {icon && <span className="material-symbols-outlined text-[20px]">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
