"use client";

import { useEffect, useState } from 'react';
import { summaryService } from '@/services/summary';
import { SummaryCard } from '@/components/domain/SummaryCard';

export default function SummaryPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await summaryService.getSeason();
        setSummary(data);
      } catch (err) {
        setError('Failed to load summary data.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (error) {
    return <div className="bg-error/10 text-error p-6 rounded-2xl">{error}</div>;
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <span className="text-secondary text-sm font-semibold tracking-wider uppercase">Analytics</span>
        <h1 className="font-newsreader text-4xl text-text font-semibold tracking-tight mt-1">Farm Summary</h1>
        <p className="text-text-muted mt-2">Comprehensive breakdown of your {summary?.season} season.</p>
      </div>

      {summary?.aiSummary && (
        <div className="bg-primary-container text-text p-6 rounded-2xl border border-primary/20 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
            <span className="font-semibold tracking-wider uppercase text-xs">AI Season Insights</span>
          </div>
          <p className="font-newsreader text-lg leading-relaxed font-semibold">{summary.aiSummary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard title="Total Revenue" value={`₹${summary?.totalRevenue?.toLocaleString('en-IN')}`} icon="payments" highlight={true} trend={12} />
        <SummaryCard title="Total Expenses" value={`₹${summary?.totalExpenses?.toLocaleString('en-IN')}`} icon="account_balance_wallet" trend={-4} />
        <SummaryCard title="Recorded Activities" value={summary?.activityCount} icon="agriculture" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface-bright rounded-2xl p-6 border border-border shadow-sm flex flex-col items-center justify-center min-h-[300px] text-text-muted">
          <span className="material-symbols-outlined text-4xl mb-2">bar_chart</span>
          <p>Activity Breakdown Chart Placeholder</p>
        </div>
        <div className="bg-surface-bright rounded-2xl p-6 border border-border shadow-sm flex flex-col items-center justify-center min-h-[300px] text-text-muted">
          <span className="material-symbols-outlined text-4xl mb-2">pie_chart</span>
          <p>Expense Distribution Chart Placeholder</p>
        </div>
      </div>
    </div>
  );
}
