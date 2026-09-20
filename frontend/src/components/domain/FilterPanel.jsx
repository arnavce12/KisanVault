import { useState } from 'react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export function FilterPanel({ fields, crops, currentFilters, onFilterChange }) {
  const [filters, setFilters] = useState(currentFilters || {});

  const handleApply = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    setFilters({});
    onFilterChange({});
  };

  const fieldOptions = [{ label: 'All Fields', value: '' }, ...fields.map(f => ({ label: f.fieldName, value: f.id }))];
  const cropOptions = [{ label: 'All Crops', value: '' }, ...crops.map(c => ({ label: c.cropName, value: c.id }))];
  const typeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Activity', value: 'Activity' },
    { label: 'Expense', value: 'Expense' },
    { label: 'Harvest', value: 'Harvest' },
  ];

  return (
    <div className="bg-surface-bright rounded-2xl p-5 shadow-sm border border-border mb-6">
      <div className="flex items-center gap-2 mb-4 text-primary">
        <span className="material-symbols-outlined text-[20px]">filter_list</span>
        <h2 className="font-semibold text-text text-lg">Filter Records</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select 
          icon="landscape" 
          options={fieldOptions} 
          value={filters.field_id || ''} 
          onChange={e => setFilters({...filters, field_id: e.target.value})} 
        />
        <Select 
          icon="grass" 
          options={cropOptions} 
          value={filters.crop_id || ''} 
          onChange={e => setFilters({...filters, crop_id: e.target.value})} 
        />
        <Select 
          icon="category" 
          options={typeOptions} 
          value={filters.activity_type || ''} 
          onChange={e => setFilters({...filters, activity_type: e.target.value})} 
        />
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={handleReset}>Reset</Button>
          <Button variant="primary" className="flex-1" onClick={handleApply}>Apply</Button>
        </div>
      </div>
    </div>
  );
}
