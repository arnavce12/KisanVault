"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import BackendLoadingWidget from '@/components/ui/BackendLoadingWidget';

export default function LoginPage() {
  const { user, login, demoLogin, isLoading: authLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      await login(identifier, password);
      setSuccessMsg('Vault Unlocked. Redirecting...');
      // Navigation is handled by AuthContext upon success
    } catch (err) {
      setErrorMsg(err.message || 'Failed to authenticate. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  if (authLoading || user) {
    return <div className="min-h-screen bg-surface flex items-center justify-center" />;
  }

  return (
    <main className="w-full min-h-screen bg-surface relative">
      <BackendLoadingWidget isLoading={isSubmitting} />
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-1 border border-border rounded-lg bg-surface-bright/90 px-3 py-1.5 shadow-sm backdrop-blur-sm">
        <span className="material-symbols-outlined text-[18px] text-text-muted">language</span>
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
      <div className="w-full min-h-[calc(100vh-2rem)] flex flex-col lg:flex-row items-stretch p-0 sm:p-6 lg:p-8 gap-0 sm:gap-6 lg:gap-8">
        
        <section className="hidden lg:flex relative w-full lg:w-1/2 min-h-[740px] rounded-3xl overflow-hidden shadow-sm flex-col justify-between p-10 text-surface-bright">
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105" 
               style={{ backgroundImage: "url('/assets/authentic_indian_agricultural_landscape_scene_in_natural_warm_morning_daylight/screen.png')" }}>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/35 to-primary/20"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/90 text-primary shadow-sm backdrop-blur-sm">
              <span className="material-symbols-outlined text-[18px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>verified_user</span>
              <span className="font-sourcesans text-xs tracking-wide uppercase font-semibold">{t('farmerOwned')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-surface-container/90 text-xs bg-primary/40 backdrop-blur-sm px-3 py-1 rounded-full font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
              <span>Harvest Season 2024</span>
            </div>
          </div>
          
          <div className="relative z-10 w-full max-w-lg bg-surface/95 text-text p-7 rounded-2xl shadow-md backdrop-blur-md">
            <div className="flex items-center gap-2 mb-2 text-primary">
              <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>eco</span>
              <span className="text-xs uppercase tracking-wider font-semibold">Field Trust Note</span>
            </div>
            <p className="font-newsreader text-xl text-text leading-snug font-semibold">
              “A calm, secure repository dedicated to your soil, yields, and seasons.”
            </p>
            <div className="mt-4 pt-3 flex items-center justify-between text-text-muted text-sm border-t border-border">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">cloud_done</span>
                Offline-ready ledger sync
              </span>
              <span className="text-secondary font-semibold text-xs">v1.4 Field Edition</span>
            </div>
          </div>
        </section>

        {/* Top Banner - Mobile Only (replicates mobile behavior) */}
        <div className="lg:hidden relative w-full h-48 overflow-hidden flex flex-col justify-end px-4">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/assets/authentic_indian_agricultural_landscape_scene_in_natural_warm_morning_daylight/screen.png')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-surface/60 to-surface"></div>
          
          <div className="relative z-10 flex items-center gap-2 mb-2 bg-surface/90 backdrop-blur-sm self-start px-3 py-1.5 rounded-full shadow-sm">
            <span className="material-symbols-outlined text-primary text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>potted_plant</span>
            <span className="font-newsreader text-sm text-primary tracking-tight font-semibold">KisanVault</span>
          </div>
        </div>

        {/* Right Authentication Surface Panel */}
        <section className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
          <div className="w-full max-w-md mx-auto flex flex-col justify-center">
            
            {/* Brand Identity - Desktop Only */}
            <div className="hidden lg:flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl bg-secondary-container flex items-center justify-center text-secondary shadow-sm">
                <span className="material-symbols-outlined text-[26px]" style={{fontVariationSettings: "'FILL' 1"}}>potted_plant</span>
              </div>
              <div className="flex flex-col">
                <span className="font-newsreader text-2xl tracking-tight text-primary font-semibold">KisanVault</span>
                <span className="text-xs text-text-muted -mt-1 tracking-wider uppercase font-semibold">Sovereign Soil Records</span>
              </div>
            </div>

            {/* Section Intro */}
            <div className="mb-6 lg:mb-8">
              <span className="inline-block text-xs uppercase tracking-widest text-secondary font-semibold mb-2">
                {t('welcomeBackAuth')}
              </span>
              <h1 className="font-newsreader text-3xl lg:text-4xl text-text mb-3 tracking-tight font-semibold">
                {t('farmHistoryWaiting')}
              </h1>
              <p className="text-base text-text-muted leading-relaxed">
                {t('signInDesc')}
              </p>
            </div>

            {/* Form */}
            <form className="flex flex-col gap-5 lg:gap-6" onSubmit={handleLogin}>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-text font-semibold flex items-center justify-between" htmlFor="identifier">
                  <span>{t('mobileOrEmail')}</span>
                  <span className="text-sm text-text-muted font-normal hidden lg:inline">{t('primaryContact')}</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-text-muted text-[22px] pointer-events-none">mail</span>
                  <input 
                    id="identifier"
                    type="text" 
                    required 
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder={t('mobilePlaceholder')}
                    className="w-full h-12 lg:h-[52px] pl-12 pr-4 bg-surface-bright lg:bg-surface text-text rounded-xl shadow-sm border border-border focus:outline-none focus:border-primary transition-all placeholder:text-text-muted/70" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-text font-semibold" htmlFor="password">{t('passwordOrPin')}</label>
                  <button type="button" className="text-sm text-secondary hover:text-primary transition-colors font-semibold">
                    {t('forgotPassword')}
                  </button>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-text-muted text-[22px] pointer-events-none">key</span>
                  <input 
                    id="password"
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    className="w-full h-12 lg:h-[52px] pl-12 pr-12 bg-surface-bright lg:bg-surface text-text rounded-xl shadow-sm border border-border focus:outline-none focus:border-primary transition-all placeholder:text-text-muted/70" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 w-10 h-10 flex items-center justify-center text-text-muted hover:text-text rounded-lg transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[22px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-error/10 text-error rounded-lg text-sm flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-primary-container text-primary rounded-lg text-sm flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>{successMsg}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 lg:h-[52px] mt-2 rounded-xl bg-primary text-surface-bright font-semibold text-base flex items-center justify-center gap-2.5 shadow-sm hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                    <span>{t('openingVault')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('signIn')}</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 py-1 text-text-muted text-sm text-center">
                <span className="material-symbols-outlined text-[18px] text-secondary">lock</span>
                <span>{t('encryptedSafe')}</span>
              </div>
            </form>

            {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
              <button 
                type="button" 
                onClick={async () => {
                  try { await demoLogin(); } catch(e) {}
                }}
                className="w-full h-12 lg:h-[52px] mt-4 rounded-xl bg-tertiary-container text-tertiary font-semibold text-base flex items-center justify-center gap-2.5 shadow-sm hover:opacity-95 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">science</span>
                <span>{t('useDemoAccount')}</span>
              </button>
            )}

            <div className="mt-8 pt-6 border-t border-border flex flex-col lg:flex-row items-center justify-between gap-3 text-center lg:text-left">
              <div className="flex flex-col">
                <span className="text-sm text-text font-semibold">{t('newToKisanVault')}</span>
                <span className="text-sm text-text-muted">{t('digitizeIn2Mins')}</span>
              </div>
              <Link href="/register">
                <button className="h-10 px-4 rounded-lg bg-surface-container text-primary text-sm font-semibold shadow-sm hover:bg-border transition-colors">
                  {t('createAccount')}
                </button>
              </Link>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}
