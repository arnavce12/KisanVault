import { RecordCard } from './RecordCard';

export function TimelineItem({ record, isLast }) {
  return (
    <div className="relative flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className="w-4 h-4 rounded-full bg-surface border-2 border-primary z-10 mt-3" />
        {!isLast && <div className="w-[2px] h-full bg-border -mt-1 flex-1" />}
      </div>
      
      {/* Content */}
      <div className="flex-1 pb-6">
        <RecordCard record={record} />
      </div>
    </div>
  );
}

export function Timeline({ records, emptyMessage = "No recent records found." }) {
  if (!records || records.length === 0) {
    return (
      <div className="py-8 text-center text-text-muted bg-surface-container rounded-2xl border border-border border-dashed">
        <span className="material-symbols-outlined text-4xl text-outline mb-2">history</span>
        <p className="font-semibold">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {records.map((record, index) => (
        <TimelineItem 
          key={record.id || index} 
          record={record} 
          isLast={index === records.length - 1} 
        />
      ))}
    </div>
  );
}
