"use client";

import { useEffect, useState } from 'react';
import { summaryService } from '@/services/summary';
import { SummaryCard } from '@/components/domain/SummaryCard';
import { recordsService } from '@/services/records';
import { Button } from '@/components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useLanguage } from '@/context/LanguageContext';

export default function SummaryPage() {
  const { t, language } = useLanguage();
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
          data = await summaryService.getField(selectedField, false, language);
        } else {
          data = await summaryService.getSeason(selectedSeason, selectedField, false, language);
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
        data = await summaryService.getField(selectedField, true, language);
      } else {
        data = await summaryService.getSeason(selectedSeason, selectedField, true, language);
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

  const activityData = summary?.stats?.activityBreakdown 
    ? Object.entries(summary.stats.activityBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  const expenseData = summary?.stats?.expenseBreakdown
    ? Object.entries(summary.stats.expenseBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  const COLORS = ['#2E7D32', '#4CAF50', '#81C784', '#C8E6C9', '#388E3C'];
  const EXPENSE_COLORS = ['#D32F2F', '#F44336', '#E57373', '#FFCDD2', '#C62828'];

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <span className="text-secondary text-sm font-semibold tracking-wider uppercase">{t('analytics')}</span>
          <h1 className="font-newsreader text-4xl text-text font-semibold tracking-tight mt-1">{t('farmSummary')}</h1>
          <p className="text-text-muted mt-2">{t('comprehensiveBreakdown')}</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center bg-[#f3f5ef] rounded-2xl border border-primary/10 p-3 gap-6">
          
          <div className="flex items-center gap-3 pl-2">
            <div className="w-10 h-10 rounded-full border border-border bg-surface-bright flex items-center justify-center text-primary shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[20px]">psychiatry</span>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-text-muted font-medium ml-1">{t('field')}</label>
              <div className="relative">
                <select 
                  value={selectedField} 
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="bg-surface-bright border border-border rounded-lg text-sm font-medium text-text focus:outline-none focus:border-primary py-1.5 pl-3 pr-8 cursor-pointer w-[140px] appearance-none shadow-sm"
                >
                  {fields.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-[18px] text-text pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">expand_more</span>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:block w-[1px] h-12 bg-primary/10"></div>
          
          <div className="flex items-center gap-3 pr-2">
            <div className="w-10 h-10 rounded-full border border-border bg-surface-bright flex items-center justify-center text-primary shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-text-muted font-medium ml-1">{t('season')}</label>
              <div className="relative">
                <select 
                  value={selectedSeason} 
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="bg-surface-bright border border-border rounded-lg text-sm font-medium text-text focus:outline-none focus:border-primary py-1.5 pl-3 pr-8 cursor-pointer w-[160px] appearance-none shadow-sm"
                >
                  <option value="All">{t('allSeasons')}</option>
                  <option value="Kharif 2024">Kharif 2024</option>
                  <option value="Rabi 2024">Rabi 2024</option>
                  <option value="Zaid 2024">Zaid 2024</option>
                </select>
                <span className="material-symbols-outlined text-[18px] text-text pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">expand_more</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* AI Summary Section */}
      <div className="bg-primary-container text-text p-6 rounded-2xl border border-primary/20 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
            <span className="font-semibold tracking-wider uppercase text-xs">{t('aiInsights')}</span>
          </div>
          {!summary?.aiSummary && (
            <Button onClick={handleGenerateAi} disabled={generatingAi} className="text-sm py-1.5 px-3">
              {generatingAi ? t('generating') : t('generateAiInsights')}
            </Button>
          )}
        </div>
        
        {summary?.aiSummary ? (
          <p className="font-newsreader text-lg leading-relaxed font-semibold">{summary.aiSummary}</p>
        ) : (
          <p className="text-text-muted text-sm">{t('aiInsightsLabel')}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard title={t('totalRevenue')} value={`₹${summary?.totalRevenue?.toLocaleString('en-IN') || 0}`} icon="payments" highlight={true} trend={12} />
        <SummaryCard title={t('totalExpenses')} value={`₹${summary?.totalExpenses?.toLocaleString('en-IN') || 0}`} icon="account_balance_wallet" trend={-4} />
        <SummaryCard title={t('recordedActivities')} value={summary?.activityCount || 0} icon="agriculture" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface-bright rounded-2xl p-6 border border-border shadow-sm flex flex-col min-h-[350px]">
          <h3 className="text-text font-semibold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">bar_chart</span>
            {t('activityBreakdown')}
          </h3>
          {activityData.length > 0 ? (
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#757575' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#757575' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip cursor={{ fill: '#F5F5F5' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E0E0E0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#2E7D32" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">bar_chart</span>
              <p>{t('noActivitiesRecorded')}</p>
            </div>
          )}
        </div>
        
        <div className="bg-surface-bright rounded-2xl p-6 border border-border shadow-sm flex flex-col min-h-[350px]">
          <h3 className="text-text font-semibold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-error">pie_chart</span>
            {t('expenseDistribution')}
          </h3>
          {expenseData.length > 0 ? (
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E0E0E0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">pie_chart</span>
              <p>{t('noExpensesRecorded')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
