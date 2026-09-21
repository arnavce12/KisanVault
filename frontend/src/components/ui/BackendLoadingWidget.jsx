import { useState, useEffect } from 'react';

export default function BackendLoadingWidget({ isLoading }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer;
    if (isLoading) {
      // Delay showing the widget to avoid a quick flash on fast responses
      timer = setTimeout(() => {
        setShow(true);
      }, 500);
    } else {
      setShow(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface/80 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-busy="true"
      aria-labelledby="backend-loading-title"
      aria-describedby="backend-loading-desc"
    >
      <div className="w-full max-w-sm bg-surface-bright p-8 rounded-2xl shadow-lg border border-border flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
        <div className="w-10 h-10 rounded-full border-4 border-surface-container border-t-primary animate-spin mb-5"></div>
        
        <h3 id="backend-loading-title" className="font-newsreader text-xl font-semibold text-text mb-2">
          Please wait for the backend
        </h3>
        
        <p id="backend-loading-desc" className="text-sm text-text-muted mb-5 leading-relaxed">
          The backend is waking up. This may take a few moments...
        </p>
        
        <div className="text-xs font-semibold text-primary/80 flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          Connecting to KisanVault...
        </div>
      </div>
    </div>
  );
}
