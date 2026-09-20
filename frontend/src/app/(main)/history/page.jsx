"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { recordsService } from '@/services/records';
import { FilterBar } from '@/components/domain/FilterBar';
import { useLanguage } from '@/context/LanguageContext';

export default function HistoryPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      setError(null);
      try {
        const filters = {
          field: searchParams.get('field_name'),
          crop: searchParams.get('crop'),
          season: searchParams.get('season'),
          record_type: searchParams.get('record_type')
        };
        const r = await recordsService.getFilter(filters);
        setRecords(r || []);
      } catch (err) {
        setError('Failed to load farm history.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [searchParams]);

  const getRecordStyles = (type) => {
    switch (type) {
      case 'activity':
        return {
          border: 'border-primary',
          bg: 'bg-primary/5',
          icon: 'psychiatry',
          label: 'text-primary'
        };
      case 'expense':
        return {
          border: 'border-error',
          bg: 'bg-error/5',
          icon: 'account_balance_wallet',
          label: 'text-error'
        };
      case 'harvest':
        return {
          border: 'border-secondary',
          bg: 'bg-secondary/5',
          icon: 'agriculture',
          label: 'text-secondary'
        };
      default:
        return {
          border: 'border-border',
          bg: 'bg-surface',
          icon: 'description',
          label: 'text-text-muted'
        };
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <span className="text-secondary text-sm font-semibold tracking-wider uppercase">{t('ledger')}</span>
        <h1 className="font-newsreader text-4xl text-text font-semibold tracking-tight mt-1">{t('farmHistory')}</h1>
        <p className="text-text-muted mt-2">{t('chronologicalRecord')}</p>
      </div>

      <FilterBar />

      <div className="bg-surface-bright rounded-2xl p-6 shadow-sm border border-border min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
          </div>
        ) : error ? (
          <div className="bg-error/10 text-error p-6 rounded-2xl">{error}</div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p>{t('noRecordsFound')}</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-border ml-4 flex flex-col gap-8 py-4">
            {records.map((record) => {
              const styles = getRecordStyles(record.recordType);
              
              // Map to the format RecordCard expects for the floating popover
              const mappedRecord = {
                type: record.recordType === 'activity' ? 'Activity' : record.recordType === 'expense' ? 'Expense' : 'Harvest',
                title: record.activityType || record.expenseType || 'Harvest',
                date: record.date,
                amount: record.amount || record.cost || record.totalRevenue,
                description: record.description || record.qualityNotes,
                fieldName: record.fieldName,
              };

              return (
                <div 
                  key={record.id} 
                  className="relative pl-8 animate-in fade-in slide-in-from-bottom-2 group cursor-pointer"
                >
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-2 border-surface-bright flex items-center justify-center ${styles.bg} ${styles.label}`}>
                    <span className="material-symbols-outlined text-[18px]">{styles.icon}</span>
                  </div>
                  
                  {/* Card (Compact View) */}
                  <div className={`p-4 rounded-xl border transition-colors ${styles.border} ${styles.bg} hover:shadow-sm`}>
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${styles.label}`}>
                          {record.recordType}
                        </span>
                        <h3 className="font-semibold text-lg text-text mt-1">
                          {record.fieldName} - {record.cropName}
                        </h3>
                        <p className="text-sm text-text-muted">{record.season}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-medium text-text-muted bg-surface/50 px-2 py-1 rounded">
                          {record.date}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-primary mt-2">
                          <span className="text-xs font-semibold uppercase tracking-wider">{t('hoverForDetails')}</span>
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Detailed Popover on Hover */}
                  <div className="absolute z-50 left-[102%] top-0 hidden group-hover:block w-80 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
                    <div className="bg-surface rounded-2xl overflow-hidden shadow-2xl border border-border">
                      <div className="p-4 border-b border-border bg-surface-bright">
                        <h4 className="font-newsreader text-xl font-semibold text-text">{mappedRecord.title}</h4>
                        <p className="text-sm text-text-muted mt-1">{mappedRecord.date}</p>
                      </div>
                      <div className="p-4 flex flex-col gap-2 text-sm text-text-muted">
                        {record.quantity && <p><strong className="text-text">{t('quantity')}:</strong> {record.quantity} {record.unit}</p>}
                        {record.harvestQuantity && <p><strong className="text-text">{t('yield')}:</strong> {record.harvestQuantity} {record.harvestUnit}</p>}
                        {mappedRecord.amount && <p><strong className="text-text">{record.recordType === 'expense' ? t('amount') : record.recordType === 'activity' ? t('cost') : t('revenue')}:</strong> ₹{mappedRecord.amount}</p>}
                        {mappedRecord.description && (
                          <div className="mt-2 p-3 bg-surface-container rounded-lg border border-border">
                            <p className="italic">"{mappedRecord.description}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
