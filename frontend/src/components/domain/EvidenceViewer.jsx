import { RecordCard } from './RecordCard';

export function EvidenceViewer({ sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-8 border-t border-border pt-6">
      <div className="flex items-center gap-2 text-text-muted mb-4">
        <span className="material-symbols-outlined text-[18px]">find_in_page</span>
        <h3 className="font-semibold text-sm uppercase tracking-wider">Source Records</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sources.map(source => (
          <RecordCard key={source.id} record={source} highlight={true} />
        ))}
      </div>
    </div>
  );
}
