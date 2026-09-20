import { useState } from 'react';
import { RecordCard } from './RecordCard';

export function EvidenceViewer({ sources }) {
  const [hoveredId, setHoveredId] = useState(null);

  if (!sources || sources.length === 0) return null;

  // Helper to map backend snake_case full_record to the camelCase expected by RecordCard
  const mapToCardFormat = (full) => {
    if (!full) return {};
    const typeMap = { activity: 'Activity', expense: 'Expense', harvest: 'Harvest' };
    
    // Capitalize title
    let title = full.activityType || full.expenseType || 'Harvest';
    if (title) title = title.charAt(0).toUpperCase() + title.slice(1).replace(/_/g, ' ');

    return {
      type: typeMap[full.recordType] || 'Activity',
      title: title,
      date: full.date,
      amount: full.amount || full.cost || full.totalRevenue,
      description: full.description || full.qualityNotes,
      fieldName: full.fieldName,
      ...full
    };
  };

  return (
    <div className="mt-8 border-t border-border pt-6">
      <div className="flex items-center gap-2 text-text-muted mb-4">
        <span className="material-symbols-outlined text-[18px]">find_in_page</span>
        <h3 className="font-semibold text-sm uppercase tracking-wider">Source Records</h3>
      </div>
      
      <div className="flex flex-col gap-3">
        {sources.map(source => {
          const mappedRecord = mapToCardFormat(source.fullRecord);
          
          return (
            <div 
              key={source.recordId}
              className="relative p-4 rounded-xl border border-border bg-surface-bright shadow-sm hover:border-primary transition-colors cursor-pointer flex items-center justify-between group"
              onMouseEnter={() => setHoveredId(source.recordId)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="flex flex-col">
                <span className="font-semibold text-text">{mappedRecord.title || source.table}</span>
                <span className="text-sm text-text-muted">{mappedRecord.date} • {mappedRecord.fieldName}</span>
              </div>
              
              <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-semibold uppercase tracking-wider">View Details</span>
                <span className="material-symbols-outlined text-[18px]">info</span>
              </div>
              
              {/* Floating Card */}
              {hoveredId === source.recordId && (
                <div className="absolute z-50 bottom-full left-0 lg:left-1/2 lg:-translate-x-1/2 mb-2 w-full sm:w-[400px] shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
                  <div className="bg-surface rounded-2xl overflow-hidden border border-primary/20">
                    <RecordCard record={mappedRecord} highlight={true} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
