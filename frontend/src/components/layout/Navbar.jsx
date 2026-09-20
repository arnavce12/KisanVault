import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Navbar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-sm border-b border-border h-20">
      <div className="h-full max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[28px]">potted_plant</span>
            <span className="font-newsreader text-2xl text-primary font-semibold tracking-tight">KisanVault</span>
          </div>
          <div className="hidden xl:flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container text-text-muted text-xs font-semibold">
            <span className="material-symbols-outlined text-secondary text-[16px]">contact_phone</span>
            <span>Kisan Sahayata: 1800-180-1551</span>
          </div>
        </div>
        
        <nav className="hidden lg:flex items-center gap-2">
          <Link href="/dashboard" className="px-3 py-2 rounded-lg text-sm font-semibold text-text-muted hover:bg-surface-container hover:text-text transition-colors">Overview</Link>
          <Link href="/history" className="px-3 py-2 rounded-lg text-sm font-semibold text-text-muted hover:bg-surface-container hover:text-text transition-colors">Farm History</Link>
          <Link href="/search" className="px-3 py-2 rounded-lg text-sm font-semibold text-text-muted hover:bg-surface-container hover:text-text transition-colors">Ask KisanVault</Link>
          <Link href="/summary" className="px-3 py-2 rounded-lg text-sm font-semibold text-text-muted hover:bg-surface-container hover:text-text transition-colors">Summary</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/add-record">
            <Button icon="add">Add Record</Button>
          </Link>
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-sm font-semibold text-text">Ramesh Patel</span>
            <span className="text-xs text-text-muted">Gujarat</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer">
            <span className="material-symbols-outlined text-surface-bright text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
