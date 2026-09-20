"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { recordsService } from '@/services/records';
import { summaryService } from '@/services/summary';
import { SummaryCard } from '@/components/domain/SummaryCard';
import { Timeline } from '@/components/domain/Timeline';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumData, recordsData] = await Promise.all([
          summaryService.getSeason(),
          recordsService.getTimeline()
        ]);
        setSummary(sumData);
        setRecentRecords(recordsData.slice(0, 3)); // Only show latest 3
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error/10 text-error p-6 rounded-2xl">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <span className="material-symbols-outlined">error</span> Error
        </h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-secondary text-sm font-semibold tracking-wider uppercase">Overview</span>
          <h1 className="font-newsreader text-4xl text-text font-semibold tracking-tight mt-1">
            Welcome back, {user?.name?.split(' ')[0] || 'Farmer'}.
          </h1>
          <p className="text-text-muted mt-2">Here is what is happening on your farm today.</p>
        </div>
        <Link href="/add-record">
          <Button icon="add">Add Record</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard 
          title="Season Expenses" 
          value={`₹${summary?.totalExpenses?.toLocaleString('en-IN') || 0}`} 
          icon="account_balance_wallet" 
        />
        <SummaryCard 
          title="Season Revenue" 
          value={`₹${summary?.totalRevenue?.toLocaleString('en-IN') || 0}`} 
          icon="payments" 
          highlight={true} 
        />
        <SummaryCard 
          title="Total Activities" 
          value={summary?.activityCount || 0} 
          icon="agriculture" 
        />
      </div>

      {/* Recent Activity */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-newsreader text-2xl text-text font-semibold tracking-tight">Recent Activity</h2>
          <Link href="/history" className="text-sm font-semibold text-primary hover:text-secondary transition-colors">
            View All →
          </Link>
        </div>
        <div className="bg-surface-bright rounded-2xl p-6 shadow-sm border border-border">
          <Timeline records={recentRecords} />
        </div>
      </div>
    </div>
  );
}
