import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-20 bg-surface border-r border-border py-8 px-4 z-40">
      <nav className="flex flex-col gap-2">
        <Link href="/dashboard" className="px-4 py-3 rounded-xl font-semibold text-text-muted hover:bg-surface-container hover:text-text flex items-center gap-3 transition-colors">
          <span className="material-symbols-outlined text-[20px]">dashboard</span>
          Overview
        </Link>
        <Link href="/history" className="px-4 py-3 rounded-xl font-semibold text-text-muted hover:bg-surface-container hover:text-text flex items-center gap-3 transition-colors">
          <span className="material-symbols-outlined text-[20px]">history</span>
          Farm History
        </Link>
        <Link href="/search" className="px-4 py-3 rounded-xl font-semibold text-text-muted hover:bg-surface-container hover:text-text flex items-center gap-3 transition-colors">
          <span className="material-symbols-outlined text-[20px]">search</span>
          Ask KisanVault
        </Link>
        <Link href="/summary" className="px-4 py-3 rounded-xl font-semibold text-text-muted hover:bg-surface-container hover:text-text flex items-center gap-3 transition-colors">
          <span className="material-symbols-outlined text-[20px]">analytics</span>
          Summary
        </Link>
      </nav>
      <div className="mt-auto p-4 bg-surface-container-low rounded-xl">
        <p className="text-sm font-semibold text-primary mb-1">Kisan Sahayata</p>
        <p className="text-xs text-text-muted">Call 1800-180-1551 for farming advisory.</p>
      </div>
    </aside>
  );
}
