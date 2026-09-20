"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { user, register, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');
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

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      await register({ name, mobile, location, password });
      setSuccessMsg('Vault Created! Redirecting...');
      // Navigation is handled by AuthContext upon success
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create account. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (authLoading || user) {
    return <div className="min-h-screen bg-surface flex items-center justify-center" />;
  }

  return (
    <main className="min-h-screen flex flex-col relative w-full bg-surface pb-8">
      {/* Visual Header */}
      <div className="relative w-full h-48 overflow-hidden">
        <img alt="Rural farmland at sunrise" className="absolute inset-0 w-full h-full object-cover object-center" src="/assets/kisanvault_mobile_register/screen.png" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-surface/75 to-surface"></div>
        
        <div className="relative z-10 pt-4 px-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-1 bg-surface-bright/95 px-3 py-1.5 rounded-full shadow-sm">
            <span className="material-symbols-outlined text-primary text-lg" style={{fontVariationSettings: "'FILL' 1"}}>potted_plant</span>
            <span className="font-newsreader text-xl text-primary tracking-tight font-semibold">KisanVault</span>
          </div>
          <div className="inline-flex items-center gap-1 bg-secondary-container/90 px-2.5 py-1 rounded-full text-secondary font-semibold text-xs">
            <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>shield</span>
            <span>Secure Vault</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto px-4 -mt-6 relative z-20">
        <div className="flex flex-col gap-1 mb-6">
          <div className="flex items-center gap-1.5 text-secondary">
            <span className="material-symbols-outlined text-sm">agriculture</span>
            <span className="text-xs tracking-wider uppercase font-semibold">GET STARTED</span>
          </div>
          <h1 className="font-newsreader text-3xl text-text font-semibold tracking-tight">
            Begin your farm record.
          </h1>
          <p className="text-base text-text-muted leading-relaxed">
            Create a simple, secure vault for your fields, soil tests, and seasonal harvests.
          </p>
        </div>

        {/* Registration Card / Form */}
        <div className="bg-surface-bright p-6 lg:p-8 rounded-xl shadow-sm border border-border flex flex-col gap-6">
          <form className="flex flex-col gap-4" onSubmit={handleRegister}>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-text font-semibold flex items-center gap-1" htmlFor="farmer-name">
                <span>Full Name</span>
                <span className="text-primary font-bold">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-text-muted pointer-events-none">person</span>
                <input 
                  id="farmer-name" 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full h-12 pl-11 pr-4 rounded-lg bg-surface text-text border border-border focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-text font-semibold flex items-center gap-1" htmlFor="mobile-number">
                <span>Mobile Number</span>
                <span className="text-primary font-bold">*</span>
              </label>
              <div className="relative flex items-stretch">
                <div className="flex items-center gap-1 px-3 bg-surface-container rounded-l-lg border border-border border-r-0 select-none">
                  <span className="text-sm text-text font-semibold">+91</span>
                  <span className="material-symbols-outlined text-sm text-text-muted">arrow_drop_down</span>
                </div>
                <input 
                  id="mobile-number" 
                  type="tel" 
                  inputMode="numeric" 
                  maxLength="10" 
                  pattern="[0-9]{10}"
                  required
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full h-12 px-3.5 rounded-r-lg bg-surface text-text border border-border focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-text font-semibold flex items-center gap-1" htmlFor="farm-location">
                <span>Farm Location / Village</span>
                <span className="text-primary font-bold">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-text-muted pointer-events-none">location_on</span>
                <input 
                  id="farm-location" 
                  type="text" 
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Village / District, State"
                  className="w-full h-12 pl-11 pr-4 rounded-lg bg-surface text-text border border-border focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-text font-semibold flex items-center gap-1" htmlFor="password-input">
                <span>Password</span>
                <span className="text-primary font-bold">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-text-muted pointer-events-none">lock</span>
                <input 
                  id="password-input" 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full h-12 pl-11 pr-12 rounded-lg bg-surface text-text border border-border focus:outline-none focus:border-primary transition-colors"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 h-12 w-12 flex items-center justify-center text-text-muted hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
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
              className="mt-2 w-full h-[52px] bg-primary text-surface-bright font-semibold text-base rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  <span>Securing your vault...</span>
                </>
              ) : (
                <>
                  <span>Create farm vault</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="bg-surface-container p-3.5 rounded-lg flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary text-2xl shrink-0" style={{fontVariationSettings: "'FILL' 1"}}>
              verified_user
            </span>
            <div className="flex flex-col">
              <span className="text-sm text-secondary font-semibold">Farmer Owned &amp; Protected</span>
              <span className="text-sm text-text-muted leading-snug">
                Your farm records remain private to you and your family. Never shared with brokers or marketing agencies.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center text-center gap-2">
          <Link href="/login" className="inline-flex items-center gap-1.5 py-3 px-4 text-base text-text hover:text-primary transition-colors">
            <span className="text-text-muted">Already have a vault?</span>
            <span className="text-primary font-semibold underline underline-offset-4">Sign in</span>
          </Link>
          
          <div className="inline-flex items-center gap-1 text-text-muted text-xs opacity-80 mt-1">
            <span className="material-symbols-outlined text-sm">wb_sunny</span>
            <span>Optimized for clear outdoor viewing</span>
          </div>
        </div>
      </div>
    </main>
  );
}
