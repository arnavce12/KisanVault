"use client";

import { useRouter } from 'next/navigation';
import { AddRecordForm } from '@/components/domain/AddRecordForm';

export default function AddRecordPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 pb-8 max-w-3xl mx-auto w-full">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-secondary text-sm font-semibold tracking-wider uppercase">Log Entry</span>
            <h1 className="font-newsreader text-4xl text-text font-semibold tracking-tight mt-1">Add Record</h1>
          </div>
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-text-muted hover:text-text transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <p className="text-text-muted mt-2">Securely log your farm's latest activities, expenses, and harvests.</p>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <AddRecordForm />
      </div>
    </div>
  );
}
