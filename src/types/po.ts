export interface POData {
  id: string;
  poNumber: string;
  date: string;
  location: string;
  department: string;
  purposeEnglish: string;
  purposeArabic: string;
  beneficiaryName: string;
  amount: string;
  amountWords: string;
  paymentMethod: string;
  paymentType: string;
  timeToDeliver: string;
  costCenter: string;
  totalBudget: string;
  totalConsumed: string;
  appliedAmount: string;
  leftOver: string;
  customFields: { [key: string]: string };
  tags: string[];
  status: 'draft' | 'pending' | 'approved' | 'completed' | 'declined' | 'review';
  creator?: string;
  meta?: string;
  fayad_approval: boolean;
  ayed_approval: boolean;
  sultan_approval: boolean;
  ekhatib_approval: boolean;
  finance_approval: boolean;
  transaction_number?: string;
}

export interface TableField {
  label: string;
  value: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
}