// Mock data for KisanVault UI development

export const mockFields = [
  { id: 'f1', name: 'North Parcel', area: '2.5 Acres' },
  { id: 'f2', name: 'River Side', area: '4.0 Acres' },
  { id: 'f3', name: 'Home Garden', area: '0.5 Acres' },
];

export const mockCrops = [
  { id: 'c1', name: 'Wheat (Sharbati)' },
  { id: 'c2', name: 'Mustard' },
  { id: 'c3', name: 'Soybean' },
];

export const mockTimelineRecords = [
  {
    id: 'r1',
    type: 'Expense',
    date: '2024-11-15T10:00:00Z',
    title: 'Fertilizer Purchase',
    description: 'DAP 2 bags',
    amount: 3200,
    fieldId: 'f1',
    fieldName: 'North Parcel',
  },
  {
    id: 'r2',
    type: 'Activity',
    date: '2024-11-10T08:00:00Z',
    title: 'Irrigation',
    description: 'Watered for 4 hours',
    fieldId: 'f1',
    fieldName: 'North Parcel',
  },
  {
    id: 'r3',
    type: 'Harvest',
    date: '2024-10-05T14:00:00Z',
    title: 'Soybean Harvest',
    description: 'Yield: 15 Quintals',
    amount: 65000,
    fieldId: 'f2',
    fieldName: 'River Side',
  }
];

export const mockSummaryData = {
  season: 'Kharif 2024',
  totalExpenses: 45000,
  totalRevenue: 120000,
  activityCount: 24,
  aiSummary: "Your Kharif season was highly productive. The River Side parcel outperformed expectations in Soybean yield. Expenses remained within 10% of last year's average, primarily driven by fertilizer costs."
};

export const mockSearchResponse = {
  answer: "In November 2024, you spent ₹3,200 on DAP fertilizer for the North Parcel. Prior to that, you also recorded an irrigation activity on the same field.",
  sources: [mockTimelineRecords[0], mockTimelineRecords[1]]
};
