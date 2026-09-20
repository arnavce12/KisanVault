export function Input({ icon, error, className = '', ...props }) {
  return (
    <div className="w-full">
      <div className="relative">
        <input 
          className={`w-full h-12 px-4 rounded-xl bg-surface-container-low font-sourcesans text-text focus:outline-none focus:bg-surface-container transition-colors ${icon ? 'pl-10' : ''} ${error ? 'border-error' : 'border-transparent'} ${className}`} 
          {...props} 
        />
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none text-[20px]">
            {icon}
          </span>
        )}
      </div>
      {error && <p className="text-sm text-error mt-1">{error}</p>}
    </div>
  );
}
