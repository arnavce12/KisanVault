"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { recordsService } from '@/services/records';
import { Button } from '@/components/ui/Button';

export function AddRecordForm() {
  const router = useRouter();
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);
  
  // Section 1 State
  const [fieldName, setFieldName] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const [season, setSeason] = useState('');
  const [customSeason, setCustomSeason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cropName, setCropName] = useState('');
  const [newCropName, setNewCropName] = useState('');
  
  // Section 2 State
  const [recordType, setRecordType] = useState(''); // 'activity', 'expense', 'harvest'
  
  // Section 3 State - Activity
  const [activityType, setActivityType] = useState('Field Preparation');
  const [activityDescription, setActivityDescription] = useState('');
  const [activityQuantity, setActivityQuantity] = useState('');
  const [activityUnit, setActivityUnit] = useState('litres');
  const [activityCost, setActivityCost] = useState('');
  
  // Section 3 State - Expense
  const [expenseType, setExpenseType] = useState('Labour');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  
  // Section 3 State - Harvest
  const [harvestQuantity, setHarvestQuantity] = useState('');
  const [harvestUnit, setHarvestUnit] = useState('kg');
  const [harvestQuality, setHarvestQuality] = useState('');
  const [harvestSellingPrice, setHarvestSellingPrice] = useState('');
  const [harvestTotalRevenue, setHarvestTotalRevenue] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const data = await recordsService.getFields();
        setFields(data || []);
      } catch (err) {
        console.error("Failed to fetch fields", err);
      }
    };
    fetchFields();
  }, []);

  useEffect(() => {
    const fetchCrops = async () => {
      const activeField = fieldName === 'NEW' ? newFieldName : fieldName;
      if (activeField) {
        try {
          const data = await recordsService.getCrops(activeField);
          setCrops(data || []);
        } catch (err) {
          console.error("Failed to fetch crops", err);
        }
      } else {
        setCrops([]);
      }
    };
    fetchCrops();
  }, [fieldName, newFieldName]);

  // Auto-calculate revenue
  useEffect(() => {
    const qty = parseFloat(harvestQuantity) || 0;
    const price = parseFloat(harvestSellingPrice) || 0;
    setHarvestTotalRevenue(qty * price);
  }, [harvestQuantity, harvestSellingPrice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const finalFieldName = fieldName === 'NEW' ? newFieldName : fieldName;
    const finalSeason = season === 'Custom' ? customSeason : season;
    const finalCropName = cropName === 'NEW' ? newCropName : cropName;

    if (!finalFieldName || !finalSeason || !date || !finalCropName || !recordType) {
      setError("Please fill in all required basic fields and select a record type.");
      return;
    }

    const payload = {
      field_name: finalFieldName,
      crop_name: finalCropName,
      season: finalSeason,
      date,
      record_type: recordType,
      details: {}
    };

    if (recordType === 'activity') {
      if (!activityType) return setError("Activity type is required");
      payload.details = {
        activity_type: activityType,
        description: activityDescription,
        quantity: activityQuantity ? parseFloat(activityQuantity) : null,
        unit: activityUnit,
        cost: activityCost ? parseFloat(activityCost) : null
      };
    } else if (recordType === 'expense') {
      if (!expenseType || !expenseAmount) return setError("Expense type and amount are required");
      payload.details = {
        expense_type: expenseType,
        amount: parseFloat(expenseAmount),
        description: expenseDescription
      };
    } else if (recordType === 'harvest') {
      if (!harvestQuantity) return setError("Harvest quantity is required");
      payload.details = {
        harvest_quantity: parseFloat(harvestQuantity),
        harvest_unit: harvestUnit,
        quality_notes: harvestQuality,
        selling_price: harvestSellingPrice ? parseFloat(harvestSellingPrice) : null,
        total_revenue: harvestTotalRevenue
      };
    }

    setLoading(true);
    try {
      await recordsService.addRecord(payload);
      setSuccess(true);
      
      // Reset form
      setFieldName('');
      setNewFieldName('');
      setSeason('');
      setCustomSeason('');
      setCropName('');
      setNewCropName('');
      setRecordType('');
      setActivityDescription('');
      setActivityQuantity('');
      setActivityCost('');
      setExpenseAmount('');
      setExpenseDescription('');
      setHarvestQuantity('');
      setHarvestQuality('');
      setHarvestSellingPrice('');
      setHarvestTotalRevenue(0);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to save record.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-3xl mx-auto bg-surface p-6 sm:p-10 rounded-3xl border border-border shadow-sm">
      
      {/* Toast Notifications */}
      {error && (
        <div className="bg-error/10 text-error p-4 rounded-xl border border-error/20 font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-success/10 text-success p-4 rounded-xl border border-success/20 font-medium">
          Record saved successfully!
        </div>
      )}

      {/* SECTION 1: Basic Info */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-newsreader font-semibold border-b border-border pb-2">Section 1: Basic Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Field Name *</label>
            <select 
              value={fieldName} 
              onChange={(e) => setFieldName(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
            >
              <option value="" disabled>Select a field</option>
              {fields.map(f => <option key={f} value={f}>{f}</option>)}
              <option value="NEW">+ Add New Field</option>
            </select>
            {fieldName === 'NEW' && (
              <input 
                type="text" 
                placeholder="Enter new field name" 
                value={newFieldName} 
                onChange={(e) => setNewFieldName(e.target.value)}
                className="mt-2 bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary" 
              />
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Season *</label>
            <select 
              value={season} 
              onChange={(e) => setSeason(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
            >
              <option value="" disabled>Select season</option>
              <option value="Kharif 2024">Kharif 2024</option>
              <option value="Rabi 2024">Rabi 2024</option>
              <option value="Zaid 2024">Zaid 2024</option>
              <option value="Custom">Custom</option>
            </select>
            {season === 'Custom' && (
              <input 
                type="text" 
                placeholder="Enter custom season" 
                value={customSeason} 
                onChange={(e) => setCustomSeason(e.target.value)}
                className="mt-2 bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary" 
              />
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Crop Name *</label>
            <select 
              value={cropName} 
              onChange={(e) => setCropName(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
            >
              <option value="" disabled>Select a crop</option>
              {crops.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="NEW">+ Add New Crop</option>
            </select>
            {cropName === 'NEW' && (
              <input 
                type="text" 
                placeholder="Enter new crop name" 
                value={newCropName} 
                onChange={(e) => setNewCropName(e.target.value)}
                className="mt-2 bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary" 
              />
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Date *</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
              required
            />
          </div>

        </div>
      </section>

      {/* SECTION 2: Record Type Selection */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-newsreader font-semibold border-b border-border pb-2">Section 2: Record Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <button 
            type="button"
            onClick={() => setRecordType('activity')}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${recordType === 'activity' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30 bg-surface-bright'}`}
          >
            <span className="text-4xl mb-2">🌱</span>
            <span className="font-semibold text-lg">Activity</span>
          </button>
          
          <button 
            type="button"
            onClick={() => setRecordType('expense')}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${recordType === 'expense' ? 'border-error bg-error/5 text-error' : 'border-border hover:border-error/30 bg-surface-bright'}`}
          >
            <span className="text-4xl mb-2">💰</span>
            <span className="font-semibold text-lg">Expense</span>
          </button>
          
          <button 
            type="button"
            onClick={() => setRecordType('harvest')}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${recordType === 'harvest' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-border hover:border-secondary/30 bg-surface-bright'}`}
          >
            <span className="text-4xl mb-2">🌾</span>
            <span className="font-semibold text-lg">Harvest</span>
          </button>

        </div>
      </section>

      {/* SECTION 3: Dynamic Fields */}
      {recordType && (
        <section className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h2 className="text-xl font-newsreader font-semibold border-b border-border pb-2">
            Section 3: {recordType === 'activity' ? 'Activity' : recordType === 'expense' ? 'Expense' : 'Harvest'} Details
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {recordType === 'activity' && (
              <>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-sm font-semibold">Activity Type *</label>
                  <select value={activityType} onChange={(e) => setActivityType(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2">
                    <option value="Field Preparation">Field Preparation</option>
                    <option value="Irrigation">Irrigation</option>
                    <option value="Fertilizer Application">Fertilizer Application</option>
                    <option value="Pesticide Application">Pesticide Application</option>
                    <option value="Observation">Observation / Note</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-sm font-semibold">Description</label>
                  <textarea value={activityDescription} onChange={(e) => setActivityDescription(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2 min-h-[100px]" placeholder="Add notes..."></textarea>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold">Quantity</label>
                  <input type="number" step="0.01" value={activityQuantity} onChange={(e) => setActivityQuantity(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2" />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold">Unit</label>
                  <select value={activityUnit} onChange={(e) => setActivityUnit(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2">
                    <option value="litres">litres</option>
                    <option value="kg">kg</option>
                    <option value="hours">hours</option>
                    <option value="bags">bags</option>
                    <option value="other">other</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold">Cost (₹)</label>
                  <input type="number" step="0.01" value={activityCost} onChange={(e) => setActivityCost(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2" />
                </div>
              </>
            )}

            {recordType === 'expense' && (
              <>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-sm font-semibold">Expense Type *</label>
                  <select value={expenseType} onChange={(e) => setExpenseType(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2">
                    <option value="Labour">Labour</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizer Purchase">Fertilizer Purchase</option>
                    <option value="Pesticide Purchase">Pesticide Purchase</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-sm font-semibold">Amount (₹) *</label>
                  <input type="number" step="0.01" required value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2" />
                </div>
                
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-sm font-semibold">Description</label>
                  <textarea value={expenseDescription} onChange={(e) => setExpenseDescription(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2 min-h-[100px]" placeholder="Add notes..."></textarea>
                </div>
              </>
            )}

            {recordType === 'harvest' && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold">Harvest Quantity *</label>
                  <input type="number" step="0.01" required value={harvestQuantity} onChange={(e) => setHarvestQuantity(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2" />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold">Unit *</label>
                  <select value={harvestUnit} onChange={(e) => setHarvestUnit(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2">
                    <option value="kg">kg</option>
                    <option value="quintal">quintal</option>
                    <option value="tonnes">tonnes</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold">Selling Price per Unit (₹)</label>
                  <input type="number" step="0.01" value={harvestSellingPrice} onChange={(e) => setHarvestSellingPrice(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2" />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold">Total Revenue (₹)</label>
                  <input type="number" readOnly value={harvestTotalRevenue} className="bg-surface-bright text-text-muted border border-border rounded-lg px-3 py-2" />
                </div>
                
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-sm font-semibold">Quality Notes</label>
                  <textarea value={harvestQuality} onChange={(e) => setHarvestQuality(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2 min-h-[100px]" placeholder="Add notes..."></textarea>
                </div>
              </>
            )}

          </div>

          <div className="mt-4 flex justify-end">
            <Button type="submit" disabled={loading} icon={loading ? "hourglass_empty" : "save"}>
              {loading ? "Saving..." : "Save Record"}
            </Button>
          </div>
        </section>
      )}

    </form>
  );
}
