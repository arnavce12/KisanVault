import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const typeStyles = {
  Activity: { icon: 'agriculture', color: 'text-secondary', bg: 'bg-secondary-container' },
  Expense: { icon: 'account_balance_wallet', color: 'text-error', bg: 'bg-error-container' },
  Harvest: { icon: 'eco', color: 'text-primary', bg: 'bg-primary-container' },
  Field: { icon: 'landscape', color: 'text-tertiary', bg: 'bg-tertiary-container' },
  Crop: { icon: 'grass', color: 'text-secondary', bg: 'bg-secondary-container' },
};

export function RecordCard({ record, highlight = false }) {
  const style = typeStyles[record.type] || typeStyles.Activity;
  const dateObj = new Date(record.date);
  const formattedDate = !isNaN(dateObj) ? dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : record.date;
  
  return (
    <Card className={`relative flex flex-col gap-3 transition-colors ${highlight ? 'border-primary shadow-md' : 'hover:border-outline'}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.bg} ${style.color}`}>
            <span className="material-symbols-outlined">{style.icon}</span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold text-text text-base">{record.title}</h3>
            <span className="text-xs text-text-muted">{formattedDate}</span>
          </div>
        </div>
        {record.amount && (
          <span className={`font-semibold text-sm ${record.type === 'Expense' ? 'text-error' : 'text-primary'}`}>
            {record.type === 'Expense' ? '-' : '+'}₹{record.amount.toLocaleString('en-IN')}
          </span>
        )}
      </div>
      
      {(record.description || record.fieldName) && (
        <div className="pt-3 border-t border-border flex flex-col gap-2">
          {record.description && <p className="text-sm text-text-muted">{record.description}</p>}
          {record.fieldName && (
            <Badge variant="neutral" icon="location_on" className="self-start">
              {record.fieldName}
            </Badge>
          )}
        </div>
      )}
    </Card>
  );
}
