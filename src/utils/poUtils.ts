// Utility functions for PO management
export const getNextPONumber = (): string => {
  const savedPOs = JSON.parse(localStorage.getItem('pos') || '[]');
  
  if (savedPOs.length === 0) {
    return "PO-0001";
  }
  
  // Extract numeric parts from PO numbers and find the highest
  const numbers = savedPOs
    .map((po: any) => {
      const match = po.poNumber?.match(/(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((num: number) => !isNaN(num));
  
  const highestNumber = Math.max(...numbers, 0);
  const nextNumber = highestNumber + 1;
  
  return `PO-${nextNumber.toString().padStart(4, '0')}`;
};

// Company settings management
export interface CompanySettings {
  companyNameEn: string;
  companyNameAr: string;
  address: string;
  phone: string;
  logoUrl: string;
  locationOptions?: string[];
}

export const getCompanySettings = (): CompanySettings => {
  const defaultSettings: CompanySettings = {
    companyNameEn: "Northern Mountain Contracting Co.",
    companyNameAr: "شركة الجبل الشمالي للمقاولات",
    address: "Riyadh – KSA المملكة العربية السعودية – الرياض",
    phone: "Phone: 011-2397939",
    logoUrl: "/src/assets/nmc-logo.png",
    locationOptions: [
      "MAINTENANCE DEPARTMENT",
      "PROJECTS DEPARTMENT",
      "HR DEPARTMENT",
      "FINANCE DEPARTMENT",
      "OTHER"
    ]
  };
  
  const saved = localStorage.getItem('companySettings');
  return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
};

export const saveCompanySettings = (settings: Partial<CompanySettings>) => {
  const current = getCompanySettings();
  const updated = { ...current, ...settings };
  localStorage.setItem('companySettings', JSON.stringify(updated));
};