"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { recordsService } from '@/services/records';
import { FilterBar } from '@/components/domain/FilterBar';

export default function HistoryPage() {
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
          field_name: searchParams.get('field_name'),
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
          icon: '🌱',
          label: 'text-primary'
        };
      case 'expense':
        return {
          border: 'border-error',
          bg: 'bg-error/5',
          icon: '💰',
          label: 'text-error'
        };
      case 'harvest':
        return {
          border: 'border-secondary',
          bg: 'bg-secondary/5',
          icon: '🌾',
          label: 'text-secondary'
        };
      default:
        return {
          border: 'border-border',
          bg: 'bg-surface',
          icon: '📄',
          label: 'text-text-muted'
        };
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <span className="text-secondary text-sm font-semibold tracking-wider uppercase">Ledger</span>
        <h1 className="font-newsreader text-4xl text-text font-semibold tracking-tight mt-1">Farm History</h1>
        <p className="text-text-muted mt-2">A complete chronological record of your farming activities.</p>
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
            <p>No records found for the selected filters.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-border ml-4 flex flex-col gap-8 py-4">
            {records.map((record) => {
              const styles = getRecordStyles(record.record_type);
              
              // Helper to render details safely
              const renderDetails = () => {
                const d = record.details || {};
                switch (record.record_type) {
                  case 'activity':
                    return (
                      <div className="text-sm flex flex-col gap-1 mt-2 text-text-muted">
                        <p><strong className="text-text">Type:</strong> {d.activity_type}</p>
                        {d.quantity && <p><strong className="text-text">Quantity:</strong> {d.quantity} {d.unit}</p>}
                        {d.cost && <p><strong className="text-text">Cost:</strong> ₹{d.cost}</p>}
                        {d.description && <p className="italic">"{d.description}"</p>}
                      </div>
                    );
                  case 'expense':
                    return (
                      <div className="text-sm flex flex-col gap-1 mt-2 text-text-muted">
                        <p><strong className="text-text">Type:</strong> {d.expense_type}</p>
                        <p><strong className="text-text">Amount:</strong> ₹{d.amount}</p>
                        {d.description && <p className="italic">"{d.description}"</p>}
                      </div>
                    );
                  case 'harvest':
                    return (
                      <div className="text-sm flex flex-col gap-1 mt-2 text-text-muted">
                        <p><strong className="text-text">Yield:</strong> {d.harvest_quantity} {d.harvest_unit}</p>
                        {d.total_revenue && <p><strong className="text-text">Revenue:</strong> ₹{d.total_revenue}</p>}
                        {d.quality_notes && <p className="italic">"{d.quality_notes}"</p>}
                      </div>
                    );
                  default:
                    return null;
                }
              };

              return (
                <div key={record.id} className="relative pl-8 animate-in fade-in slide-in-from-bottom-2">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-2 border-surface-bright flex items-center justify-center ${styles.bg} ${styles.label}`}>
                    <span className="text-[16px]">{styles.icon}</span>
                  </div>
                  
                  {/* Card */}
                  <div className={`p-4 rounded-xl border ${styles.border} ${styles.bg}`}>
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-2">
                      <div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${styles.label}`}>
                          {record.record_type}
                        </span>
                        <h3 className="font-semibold text-lg text-text mt-1">{record.field_name} - {record.crop_name}</h3>
                        <p className="text-sm text-text-muted">{record.season}</p>
                      </div>
                      <span className="text-sm font-medium text-text-muted bg-surface/50 px-2 py-1 rounded">
                        {record.date}
                      </span>
                    </div>
                    {renderDetails()}
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
