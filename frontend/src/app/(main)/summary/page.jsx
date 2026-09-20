"use client";

import { useEffect, useState } from 'react';
import { summaryService } from '@/services/summary';
import { SummaryCard } from '@/components/domain/SummaryCard';
import { recordsService } from '@/services/records';
import { Button } from '@/components/ui/Button';

export default function SummaryPage() {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('All');
  
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [error, setError] = useState(null);

  // Initial load of fields
  useEffect(() => {
    const init = async () => {
      try {
        const fieldsList = await recordsService.getFields();
        setFields(fieldsList);
        if (fieldsList && fieldsList.length > 0) {
          setSelectedField(fieldsList[0]);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to load fields.');
        setLoading(false);
      }
    };
    init();
  }, []);

  // Fetch summary when field or season changes
  useEffect(() => {
    if (!selectedField) return;
    
    const fetchSummary = async () => {
      setLoading(true);
      try {
        let data;
        if (selectedSeason === 'All') {
          data = await summaryService.getField(selectedField, false);
        } else {
          data = await summaryService.getSeason(selectedSeason, selectedField, false);
        }
        setSummary(data);
      } catch (err) {
        setError('Failed to load summary data.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [selectedField, selectedSeason]);

  const handleGenerateAi = async () => {
    if (!selectedField) return;
    setGeneratingAi(true);
    try {
      let data;
      if (selectedSeason === 'All') {
        data = await summaryService.getField(selectedField, true);
      } else {
        data = await summaryService.getSeason(selectedSeason, selectedField, true);
      }
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingAi(false);
    }
  };

  if (loading && !summary) {
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
        <p className="text-text-muted mt-2">Comprehensive breakdown of your records.</p>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-surface-bright p-4 rounded-2xl border border-border">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted uppercase font-semibold">Field</label>
          <select 
            value={selectedField} 
            onChange={(e) => setSelectedField(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            {fields.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-muted uppercase font-semibold">Season</label>
          <select 
            value={selectedSeason} 
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            <option value="All">All Seasons</option>
            <option value="Kharif 2024">Kharif 2024</option>
            <option value="Rabi 2024">Rabi 2024</option>
            <option value="Zaid 2024">Zaid 2024</option>
          </select>
        </div>
      </div>

      {/* AI Summary Section */}
      <div className="bg-primary-container text-text p-6 rounded-2xl border border-primary/20 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
            <span className="font-semibold tracking-wider uppercase text-xs">AI Insights</span>
          </div>
          {!summary?.aiSummary && (
            <Button onClick={handleGenerateAi} disabled={generatingAi} className="text-sm py-1.5 px-3">
              {generatingAi ? 'Generating...' : 'Generate AI Insights'}
            </Button>
          )}
        </div>
        
        {summary?.aiSummary ? (
          <p className="font-newsreader text-lg leading-relaxed font-semibold">{summary.aiSummary}</p>
        ) : (
          <p className="text-text-muted text-sm">Click the button to generate a natural language summary of these records.</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard title="Total Revenue" value={`₹${summary?.totalRevenue?.toLocaleString('en-IN') || 0}`} icon="payments" highlight={true} trend={12} />
        <SummaryCard title="Total Expenses" value={`₹${summary?.totalExpenses?.toLocaleString('en-IN') || 0}`} icon="account_balance_wallet" trend={-4} />
        <SummaryCard title="Recorded Activities" value={summary?.activityCount || 0} icon="agriculture" />
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
