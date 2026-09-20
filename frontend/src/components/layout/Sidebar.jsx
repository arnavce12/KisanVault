import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function Sidebar() {
  const { t } = useLanguage();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('kisanvault_jwt');
    router.push('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-5rem)] fixed left-0 top-20 bg-surface border-r border-border py-8 px-4 z-40">
      <nav className="flex flex-col gap-2">
        <Link href="/dashboard" className="px-4 py-3 rounded-xl font-semibold text-text-muted hover:bg-surface-container hover:text-text flex items-center gap-3 transition-colors">
          <span className="material-symbols-outlined text-[20px]">dashboard</span>
          {t('overview')}
        </Link>
        <Link href="/history" className="px-4 py-3 rounded-xl font-semibold text-text-muted hover:bg-surface-container hover:text-text flex items-center gap-3 transition-colors">
          <span className="material-symbols-outlined text-[20px]">history</span>
          {t('farmHistory')}
        </Link>
        <Link href="/search" className="px-4 py-3 rounded-xl font-semibold text-text-muted hover:bg-surface-container hover:text-text flex items-center gap-3 transition-colors">
          <span className="material-symbols-outlined text-[20px]">search</span>
          {t('askKisanVault')}
        </Link>
        <Link href="/summary" className="px-4 py-3 rounded-xl font-semibold text-text-muted hover:bg-surface-container hover:text-text flex items-center gap-3 transition-colors">
          <span className="material-symbols-outlined text-[20px]">analytics</span>
          {t('summary')}
        </Link>
      </nav>
      <div className="mt-auto flex flex-col gap-4">
        <div className="p-4 bg-surface-container-low rounded-xl">
          <p className="text-sm font-semibold text-primary mb-1">{t('kisanSahayata')}</p>
          <p className="text-xs text-text-muted">{t('callAdvisory')}</p>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full px-4 py-3 rounded-xl font-semibold text-error hover:bg-error/10 flex items-center gap-3 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          {t('logout')}
        </button>
      </div>
    </aside>
  );
}
