export function Select({ options, icon, error, className = '', ...props }) {
  return (
    <div className="w-full relative">
      <select 
        className={`w-full h-12 pl-4 pr-10 rounded-xl bg-surface-container-low font-sourcesans text-text appearance-none focus:outline-none focus:bg-surface-container transition-colors ${icon ? 'pl-10' : ''} ${error ? 'border-error' : 'border-transparent'} ${className}`} 
        {...props}
      >
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[20px]">
        expand_more
      </span>
      {icon && (
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none text-[20px]">
          {icon}
        </span>
      )}
      {error && <p className="text-sm text-error mt-1">{error}</p>}
    </div>
  );
}
