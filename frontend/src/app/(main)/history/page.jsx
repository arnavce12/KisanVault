"use client";

import { useEffect, useState } from 'react';
import { recordsService } from '@/services/records';
import { FilterPanel } from '@/components/domain/FilterPanel';
import { Timeline } from '@/components/domain/Timeline';

export default function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [f, c, r] = await Promise.all([
          recordsService.getFields(),
          recordsService.getCrops(),
          recordsService.getTimeline()
        ]);
        setFields(f);
        setCrops(c);
        setRecords(r);
      } catch (err) {
        setError('Failed to load farm history.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleFilterChange = async (filters) => {
    setFilterLoading(true);
    try {
      const filtered = await recordsService.getFilter(filters);
      setRecords(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setFilterLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <span className="text-secondary text-sm font-semibold tracking-wider uppercase">Ledger</span>
        <h1 className="font-newsreader text-4xl text-text font-semibold tracking-tight mt-1">Farm History</h1>
        <p className="text-text-muted mt-2">A complete chronological record of your farming activities.</p>
      </div>

      {error ? (
        <div className="bg-error/10 text-error p-6 rounded-2xl">{error}</div>
      ) : (
        <>
          <FilterPanel 
            fields={fields} 
            crops={crops} 
            onFilterChange={handleFilterChange} 
          />
          
          <div className="bg-surface-bright rounded-2xl p-6 shadow-sm border border-border">
            {filterLoading ? (
              <div className="flex items-center justify-center py-12">
                <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
              </div>
            ) : (
              <Timeline records={records} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
