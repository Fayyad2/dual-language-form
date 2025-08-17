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
  status: 'draft' | 'pending' | 'approved' | 'completed';
  approvals: {
    hrOfficer: { signed: boolean; signature?: string; comments?: string };
    projectsManager: { signed: boolean; signature?: string; comments?: string };
    managingDirector: { signed: boolean; signature?: string; comments?: string };
    financeManagement: { signed: boolean; signature?: string; comments?: string };
  };
}

export interface TableField {
  label: string;
  value: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
}