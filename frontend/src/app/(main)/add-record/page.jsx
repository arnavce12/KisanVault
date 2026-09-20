"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { recordsService } from '@/services/records';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

// -- TYPE SELECTOR --
const RecordTypeSelector = ({ activeType, onTypeSelect }) => {
  const types = [
    { id: 'Activity', icon: 'agriculture' },
    { id: 'Expense', icon: 'account_balance_wallet' },
    { id: 'Harvest', icon: 'eco' },
    { id: 'Field', icon: 'landscape' },
    { id: 'Crop', icon: 'grass' },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {types.map(t => (
        <button
          key={t.id}
          type="button"
          onClick={() => onTypeSelect(t.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-colors border ${
            activeType === t.id 
              ? 'bg-primary text-surface-bright border-primary shadow-sm' 
              : 'bg-surface-bright text-text-muted border-border hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
          {t.id}
        </button>
      ))}
    </div>
  );
};

// -- SHARED FORM WRAPPER --
const FormWrapper = ({ onSubmit, loading, error, success, children, submitText = "Save Record" }) => (
  <form onSubmit={onSubmit} className="bg-surface-bright p-6 rounded-2xl shadow-sm border border-border flex flex-col gap-5 mt-4">
    {children}
    
    {error && (
      <div className="p-3 bg-error/10 text-error rounded-lg text-sm flex items-start gap-2">
        <span className="material-symbols-outlined text-[18px]">error</span>
        <span>{error}</span>
      </div>
    )}
    {success && (
      <div className="p-3 bg-primary-container text-primary rounded-lg text-sm flex items-start gap-2">
        <span className="material-symbols-outlined text-[18px]">check_circle</span>
        <span>{success}</span>
      </div>
    )}
    
    <div className="pt-2 border-t border-border">
      <Button type="submit" disabled={loading} className="w-full sm:w-auto mt-2">
        {loading ? (
          <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
        ) : (
          <>
            <span className="material-symbols-outlined text-[20px]">save</span>
            <span>{submitText}</span>
          </>
        )}
      </Button>
    </div>
  </form>
);

// -- FORMS --
function ActivityForm({ fields, crops }) {
  const [formData, setFormData] = useState({ fieldId: '', cropId: '', type: '', date: '', notes: '' });
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });
    try {
      await recordsService.createActivity(formData);
      setStatus({ loading: false, error: null, success: 'Activity recorded successfully.' });
      setFormData({ ...formData, notes: '', date: '' });
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to record activity.', success: null });
    }
  };

  return (
    <FormWrapper onSubmit={handleSubmit} loading={status.loading} error={status.error} success={status.success}>
      <Select 
        label="Field" 
        icon="landscape" 
        required
        value={formData.fieldId} 
        onChange={e => setFormData({...formData, fieldId: e.target.value})}
        options={[{label: 'Select Field', value: ''}, ...fields.map(f => ({label: f.name, value: f.id}))]} 
      />
      <Select 
        label="Crop" 
        icon="grass" 
        required
        value={formData.cropId} 
        onChange={e => setFormData({...formData, cropId: e.target.value})}
        options={[{label: 'Select Crop', value: ''}, ...crops.map(c => ({label: c.name, value: c.id}))]} 
      />
      <Input 
        type="text" 
        icon="category" 
        placeholder="Activity Type (e.g. Irrigation)" 
        required
        value={formData.type}
        onChange={e => setFormData({...formData, type: e.target.value})}
      />
      <Input 
        type="date" 
        icon="calendar_today" 
        required
        value={formData.date}
        onChange={e => setFormData({...formData, date: e.target.value})}
      />
      <Input 
        type="text" 
        icon="notes" 
        placeholder="Observations / Notes" 
        value={formData.notes}
        onChange={e => setFormData({...formData, notes: e.target.value})}
      />
    </FormWrapper>
  );
}

function ExpenseForm({ fields, crops }) {
  const [formData, setFormData] = useState({ fieldId: '', cropId: '', category: '', amount: '', date: '' });
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });
    try {
      await recordsService.createExpense(formData);
      setStatus({ loading: false, error: null, success: 'Expense recorded successfully.' });
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to record expense.', success: null });
    }
  };

  return (
    <FormWrapper onSubmit={handleSubmit} loading={status.loading} error={status.error} success={status.success}>
      <Select 
        icon="landscape" 
        value={formData.fieldId} 
        onChange={e => setFormData({...formData, fieldId: e.target.value})}
        options={[{label: 'Select Field (Optional)', value: ''}, ...fields.map(f => ({label: f.name, value: f.id}))]} 
      />
      <Input type="text" icon="category" placeholder="Expense Category (e.g. Fertilizer)" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
      <Input type="number" icon="payments" placeholder="Amount (₹)" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
      <Input type="date" icon="calendar_today" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
    </FormWrapper>
  );
}

function HarvestForm({ fields, crops }) {
  const [formData, setFormData] = useState({ fieldId: '', cropId: '', quantity: '', unit: '', date: '' });
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });
    try {
      await recordsService.createHarvest(formData);
      setStatus({ loading: false, error: null, success: 'Harvest recorded successfully.' });
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to record harvest.', success: null });
    }
  };

  return (
    <FormWrapper onSubmit={handleSubmit} loading={status.loading} error={status.error} success={status.success}>
      <Select 
        icon="landscape" 
        required
        value={formData.fieldId} 
        onChange={e => setFormData({...formData, fieldId: e.target.value})}
        options={[{label: 'Select Field', value: ''}, ...fields.map(f => ({label: f.name, value: f.id}))]} 
      />
      <Select 
        icon="grass" 
        required
        value={formData.cropId} 
        onChange={e => setFormData({...formData, cropId: e.target.value})}
        options={[{label: 'Select Crop', value: ''}, ...crops.map(c => ({label: c.name, value: c.id}))]} 
      />
      <div className="flex gap-4">
        <Input type="number" icon="scale" placeholder="Quantity" className="flex-1" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
        <Select 
          value={formData.unit} 
          onChange={e => setFormData({...formData, unit: e.target.value})}
          className="w-32"
          options={[
            {label: 'Unit', value: ''},
            {label: 'Quintals', value: 'quintals'},
            {label: 'Tonnes', value: 'tonnes'},
            {label: 'Kg', value: 'kg'}
          ]} 
        />
      </div>
      <Input type="date" icon="calendar_today" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
    </FormWrapper>
  );
}

function FieldForm() {
  const [formData, setFormData] = useState({ name: '', area: '', soilType: '' });
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });
    try {
      await recordsService.createField(formData);
      setStatus({ loading: false, error: null, success: 'Field added successfully.' });
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to add field.', success: null });
    }
  };

  return (
    <FormWrapper onSubmit={handleSubmit} loading={status.loading} error={status.error} success={status.success}>
      <Input type="text" icon="landscape" placeholder="Field Name (e.g. North Parcel)" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
      <Input type="number" icon="straighten" placeholder="Area (Acres)" required value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} />
      <Select 
        icon="science" 
        value={formData.soilType} 
        onChange={e => setFormData({...formData, soilType: e.target.value})}
        options={[
          {label: 'Select Soil Type', value: ''},
          {label: 'Black Soil', value: 'black'},
          {label: 'Alluvial Soil', value: 'alluvial'},
          {label: 'Red Soil', value: 'red'}
        ]} 
      />
    </FormWrapper>
  );
}

function CropForm({ fields }) {
  const [formData, setFormData] = useState({ fieldId: '', name: '', variety: '', sowingDate: '' });
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });
    try {
      await recordsService.createCrop(formData);
      setStatus({ loading: false, error: null, success: 'Crop added successfully.' });
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to add crop.', success: null });
    }
  };

  return (
    <FormWrapper onSubmit={handleSubmit} loading={status.loading} error={status.error} success={status.success}>
      <Input type="text" icon="grass" placeholder="Crop Name (e.g. Wheat)" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
      <Input type="text" icon="label" placeholder="Variety (e.g. Sharbati)" value={formData.variety} onChange={e => setFormData({...formData, variety: e.target.value})} />
      <Select 
        icon="landscape" 
        required
        value={formData.fieldId} 
        onChange={e => setFormData({...formData, fieldId: e.target.value})}
        options={[{label: 'Select Field', value: ''}, ...fields.map(f => ({label: f.name, value: f.id}))]} 
      />
      <Input type="date" icon="calendar_today" required value={formData.sowingDate} onChange={e => setFormData({...formData, sowingDate: e.target.value})} />
    </FormWrapper>
  );
}

export default function AddRecordPage() {
  const [activeType, setActiveType] = useState('Activity');
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [f, c] = await Promise.all([recordsService.getFields(), recordsService.getCrops()]);
        setFields(f);
        setCrops(c);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6 pb-8 max-w-2xl mx-auto w-full">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-secondary text-sm font-semibold tracking-wider uppercase">Log Entry</span>
            <h1 className="font-newsreader text-4xl text-text font-semibold tracking-tight mt-1">Add Record</h1>
          </div>
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-text-muted hover:text-text transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <p className="text-text-muted mt-2">Securely log your farm's latest activities and inputs.</p>
      </div>

      <RecordTypeSelector activeType={activeType} onTypeSelect={setActiveType} />

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeType === 'Activity' && <ActivityForm fields={fields} crops={crops} />}
          {activeType === 'Expense' && <ExpenseForm fields={fields} crops={crops} />}
          {activeType === 'Harvest' && <HarvestForm fields={fields} crops={crops} />}
          {activeType === 'Field' && <FieldForm />}
          {activeType === 'Crop' && <CropForm fields={fields} />}
        </div>
      )}
    </div>
  );
}
