import Link from 'next/link';

export default function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 w-full z-50 bg-surface border-t border-border flex items-center justify-around h-16 shadow-[0_-1px_3px_rgba(32,38,30,0.06)] pb-safe">
      <Link href="/dashboard" className="flex flex-col items-center gap-1 text-text-muted hover:text-primary">
        <span className="material-symbols-outlined text-[24px]">dashboard</span>
        <span className="text-[10px] font-semibold">Overview</span>
      </Link>
      <Link href="/history" className="flex flex-col items-center gap-1 text-text-muted hover:text-primary">
        <span className="material-symbols-outlined text-[24px]">history</span>
        <span className="text-[10px] font-semibold">History</span>
      </Link>
      <Link href="/add-record" className="flex flex-col items-center gap-1 text-primary relative -top-3">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-surface-bright shadow-md border-4 border-surface">
          <span className="material-symbols-outlined text-[28px]">add</span>
        </div>
        <span className="text-[10px] font-semibold">Add</span>
      </Link>
      <Link href="/search" className="flex flex-col items-center gap-1 text-text-muted hover:text-primary">
        <span className="material-symbols-outlined text-[24px]">search</span>
        <span className="text-[10px] font-semibold">Ask</span>
      </Link>
      <Link href="/summary" className="flex flex-col items-center gap-1 text-text-muted hover:text-primary">
        <span className="material-symbols-outlined text-[24px]">analytics</span>
        <span className="text-[10px] font-semibold">Summary</span>
      </Link>
    </nav>
  );
}
