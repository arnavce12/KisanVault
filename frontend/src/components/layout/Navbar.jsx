import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();

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
            <span>{t('kisanSahayata')}: 1800-180-1551</span>
          </div>
        </div>
        
        <nav className="hidden lg:flex items-center gap-2">
          <Link href="/dashboard" className="px-3 py-2 rounded-lg text-sm font-semibold text-text-muted hover:bg-surface-container hover:text-text transition-colors">{t('overview')}</Link>
          <Link href="/history" className="px-3 py-2 rounded-lg text-sm font-semibold text-text-muted hover:bg-surface-container hover:text-text transition-colors">{t('farmHistory')}</Link>
          <Link href="/search" className="px-3 py-2 rounded-lg text-sm font-semibold text-text-muted hover:bg-surface-container hover:text-text transition-colors">{t('askKisanVault')}</Link>
          <Link href="/summary" className="px-3 py-2 rounded-lg text-sm font-semibold text-text-muted hover:bg-surface-container hover:text-text transition-colors">{t('summary')}</Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 mr-2 border border-border rounded-lg bg-surface-bright px-2 py-1">
            <span className="material-symbols-outlined text-[16px] text-text-muted">language</span>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-sm font-semibold text-text focus:outline-none cursor-pointer appearance-none pr-1"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
            </select>
          </div>
          <Link href="/add-record">
            <Button icon="add">{t('addRecord')}</Button>
          </Link>
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-sm font-semibold text-text">{user?.name || 'Farmer'}</span>
            <span className="text-xs text-text-muted">Farmer</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer">
            <span className="material-symbols-outlined text-surface-bright text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
