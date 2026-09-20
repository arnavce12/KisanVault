"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { recordsService } from '@/services/records';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';

export function FilterBar() {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [fields, setFields] = useState([]);
  
  const [field, setField] = useState(searchParams.get('field_name') || 'All');
  const [crop, setCrop] = useState(searchParams.get('crop') || 'All');
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

  const [crops, setCrops] = useState([]);
  
  useEffect(() => {
    const fetchCrops = async () => {
      if (field !== 'All') {
        try {
          const data = await recordsService.getCrops(field);
          setCrops(data || []);
        } catch (err) {
          console.error("Failed to load crops", err);
        }
      } else {
        setCrops([]);
        setCrop('All');
      }
    };
    fetchCrops();
  }, [field]);

  const handleApply = () => {
    const params = new URLSearchParams();
    if (field !== 'All') params.set('field_name', field);
    if (crop !== 'All') params.set('crop', crop);
    if (season !== 'All') params.set('season', season);
    if (type !== 'All') params.set('record_type', type);
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    setField('All');
    setCrop('All');
    setSeason('All');
    setType('All');
    router.push(pathname);
  };

  return (
    <div className="bg-surface-bright border border-border p-4 rounded-2xl flex flex-wrap gap-4 items-end shadow-sm">
      <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t('field')}</label>
        <select 
          value={field} 
          onChange={(e) => setField(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-sm"
        >
          <option value="All">{t('allFields')}</option>
          {fields.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t('crop')}</label>
        <select 
          value={crop} 
          onChange={(e) => setCrop(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-sm disabled:opacity-50"
          disabled={field === 'All' || crops.length === 0}
        >
          <option value="All">{t('allCrops')}</option>
          {crops.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      
      <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t('season')}</label>
        <select 
          value={season} 
          onChange={(e) => setSeason(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-sm"
        >
          <option value="All">{t('allSeasons')}</option>
          <option value="Kharif 2024">Kharif 2024</option>
          <option value="Rabi 2024">Rabi 2024</option>
          <option value="Zaid 2024">Zaid 2024</option>
        </select>
      </div>

      <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">{t('recordType')}</label>
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-sm"
        >
          <option value="All">{t('allTypes')}</option>
          <option value="activity">Activities</option>
          <option value="expense">Expenses</option>
          <option value="harvest">Harvests</option>
        </select>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={handleClear} className="py-2">{t('clear')}</Button>
        <Button onClick={handleApply} className="py-2">{t('applyFilters')}</Button>
      </div>
    </div>
  );
}
