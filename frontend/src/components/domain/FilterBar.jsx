"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { recordsService } from '@/services/records';
import { Button } from '@/components/ui/Button';

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [fields, setFields] = useState([]);
  
  // Local state initialized from query params
  const [field, setField] = useState(searchParams.get('field_name') || 'All');
  const [season, setSeason] = useState(searchParams.get('season') || 'All');
  const [type, setType] = useState(searchParams.get('record_type') || 'All');

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const data = await recordsService.getFields();
        setFields(data || []);
      } catch (err) {
        console.error("Failed to load fields", err);
      }
    };
    fetchFields();
  }, []);

  const handleApply = () => {
    const params = new URLSearchParams();
    if (field !== 'All') params.set('field_name', field);
    if (season !== 'All') params.set('season', season);
    if (type !== 'All') params.set('record_type', type);
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    setField('All');
    setSeason('All');
    setType('All');
    router.push(pathname);
  };

  return (
    <div className="bg-surface-bright border border-border p-4 rounded-2xl flex flex-wrap gap-4 items-end shadow-sm">
      <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Field</label>
        <select 
          value={field} 
          onChange={(e) => setField(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-sm"
        >
          <option value="All">All Fields</option>
          {fields.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>
      
      <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Season</label>
        <select 
          value={season} 
          onChange={(e) => setSeason(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-sm"
        >
          <option value="All">All Seasons</option>
          <option value="Kharif 2024">Kharif 2024</option>
          <option value="Rabi 2024">Rabi 2024</option>
          <option value="Zaid 2024">Zaid 2024</option>
        </select>
      </div>

      <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Record Type</label>
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-sm"
        >
          <option value="All">All Types</option>
          <option value="activity">Activities 🌱</option>
          <option value="expense">Expenses 💰</option>
          <option value="harvest">Harvests 🌾</option>
        </select>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={handleClear} className="py-2">Clear</Button>
        <Button onClick={handleApply} className="py-2">Apply Filters</Button>
      </div>
    </div>
  );
}
