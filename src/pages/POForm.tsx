import { useState, useEffect } from "react";
import "@/poform-print.css";
import AccountTypePicker, { AccountType } from "./AccountTypePicker";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { POFormHeader } from "@/components/POForm/POFormHeader";
import { PODetailsSection } from "@/components/POForm/PODetailsSection";
import { BilingualInput } from "@/components/POForm/BillingualInput";
import { CustomizableTable } from "@/components/POForm/CustomizableTable";
import WordTable from "@/components/POForm/WordTable";
import { CostCenterTable } from "@/components/POForm/CostCenterTable";
import { ApprovalSection } from "@/components/POForm/ApprovalSection";
import { POFormFooter } from "@/components/POForm/POFormFooter";
import { PrintButton } from "@/components/POForm/PrintButton";
import { PrintAttachmentsButton } from "@/components/POForm/PrintAttachmentsButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DialogFooter } from "@/components/ui/dialog";
import { DialogTrigger } from "@/components/ui/dialog";
import React, { useRef } from "react";
import nmcLogo from "@/assets/nmc-logo.png";
import footerImg from "@/assets/fotter.png";
import { CompanySettingsDialog } from "@/components/Settings/CompanySettingsDialog";
import { POData, TableField } from "@/types/po";
import { fetchAllPOsFromSupabase } from "@/utils/poSupabase";
import { addPOToSupabase, updatePOInSupabase } from '@/utils/poSupabase';
import { uploadAttachment } from '@/utils/uploadAttachment';
import { Save, ArrowLeft, Settings } from "lucide-react";

// For WordTable data
function createInitialWordTable() {
  return {
    columns: [
      { id: "col1", width: 120, name: "Column 1" },
      { id: "col2", width: 120, name: "Column 2" },
      { id: "col3", width: 120, name: "Column 3" },
    ],
    rows: [
      { id: "row1", height: 32, cells: ["", "", ""] },
      { id: "row2", height: 32, cells: ["", "", ""] },
      { id: "row3", height: 32, cells: ["", "", ""] }
    ]
  };
}

const defaultTableFields: TableField[] = [
  { label: "Beneficiary Name المستفيد", value: "", type: "text" },
  { label: "Amount المبلغ", value: "", type: "text" },
  { label: "Payment Method طريقة الدفع", value: "", type: "text" },
  { label: "Payment Type نوع الدفع", value: "", type: "text" },
  { label: "Other Field حقل آخر", value: "", type: "text" },
  { label: "Time to Deliver وقت التسليم", value: "", type: "text" }
];



// Define missing types for custom table columns and rows
type CustomTableColumn = {
  id: string;
  name: string;
};

function POForm() {
  // PO edit state
  const [editPO, setEditPO] = useState<any>(null);
  const [poNumber, setPONumber] = useState("");
  const [date, setDate] = useState("");
  const [poLocation, setPOLocation] = useState("");
  const [department, setDepartment] = useState("");
  const [purposeEnglish, setPurposeEnglish] = useState("");
  const [purposeArabic, setPurposeArabic] = useState("");
  const [costCenter, setCostCenter] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [totalConsumed, setTotalConsumed] = useState("");
  const [appliedAmount, setAppliedAmount] = useState("");
  const [leftOver, setLeftOver] = useState("");
  const [customColumns, setCustomColumns] = useState<any[]>([]);
  const [customRows, setCustomRows] = useState<any[]>([]);
  const [poType, setPOType] = useState("normal");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [attachmentURLs, setAttachmentURLs] = useState<string[]>([]);
  // Language and company info
  const [language, setLanguage] = useState('en');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyNameEn, setCompanyNameEn] = useState('');
  const [companyNameAr, setCompanyNameAr] = useState('');
  const [locationEn, setLocationEn] = useState('');
  const [locationAr, setLocationAr] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  // Location options
  const [locationOptions, setLocationOptions] = useState<{en: string, ar: string}[]>([]);
  // Settings dialog
  const [settingsOpen, setSettingsOpen] = useState(false);
  // PO type dialog
  const [poTypeDialogOpen, setPOTypeDialogOpen] = useState(false);
  // Print ref
  const printRef = useRef<HTMLDivElement>(null);
  // Account type
  const [accountType, setAccountType] = useState<string | null>(null);
  // Handler stubs
  const handlePickAccountType = () => {};
  const handleAttachmentChange = () => {};
  const handleDeleteAttachment = (idx: number) => {};
  const handleSettingsChange = () => {};

  // Toast and navigation
  const { toast } = useToast();
  const navigate = useNavigate();
  // Table fields
  const [tableFields, setTableFields] = useState<TableField[]>(defaultTableFields);
  // WordTable data
  const [wordTableData, setWordTableData] = useState(createInitialWordTable());
  // Approvals
  const [approvals, setApprovals] = useState({
    hrOfficer: { signed: false, signature: "", comments: "" },
    projectsManager: { signed: false, signature: "", comments: "" },
    managingDirector: { signed: false, signature: "", comments: "" },
    financeManagement: { signed: false, signature: "", comments: "" }
  });

  // Load PO data if editing
  useEffect(() => {
    if (editPO) {
      setPONumber(editPO.poNumber || "");
      setDate(editPO.date || new Date().toISOString().split('T')[0]);
      setPOLocation(editPO.location || "MAINTENANCE DEPARTMENT");
      setDepartment(editPO.department || "");
      setPurposeEnglish(editPO.purposeEnglish || "");

      // Restore extra details from meta column if present
      let meta: any = {};
      if (editPO.meta) {
        try {
          meta = JSON.parse(editPO.meta);
        } catch (e) {
          meta = {};
        }
      }
      setPurposeArabic(meta?.purposeArabic || "");
      setCostCenter(meta?.costCenter || "");
      setTotalBudget(meta?.totalBudget || "");
      setTotalConsumed(meta?.totalConsumed || "");
      setAppliedAmount(meta?.appliedAmount || "");
      setLeftOver(meta?.leftOver || "");
      if (meta?.tableFields) {
        setTableFields(meta.tableFields);
      }
      if (meta?.approvals) setApprovals(meta.approvals);
      if (meta?.customColumns) setCustomColumns(meta.customColumns);
      if (meta?.customRows) setCustomRows(meta.customRows);
      if (meta?.poType) setPOType(meta.poType);
      if (meta?.wordTableData) {
        setWordTableData(meta.wordTableData);
      }
      // Load saved attachments (Supabase URLs)
      if (meta?.attachments && Array.isArray(meta.attachments)) {
        setAttachments(meta.attachments.map((url: string) => ({ url })));
      }
    } else {
      setPOLocation("MAINTENANCE DEPARTMENT");
      setWordTableData(createInitialWordTable());
    }
  }, []);

  const updateApproval = (role: string, field: string, value: string) => {
    setApprovals(prev => ({
      ...prev,
      [role]: {
        ...prev[role as keyof typeof prev],
        [field]: value
      }
    }));
  };

  // Save dialog state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const handleSave = async (type: 'draft' | 'pending') => {
    if (!poNumber.trim()) {
      toast({
        title: language === 'ar' ? 'خطأ في التحقق' : 'Validation Error',
        description: language === 'ar' ? 'رقم أمر الدفع مطلوب' : 'PO Number is required',
        variant: "destructive"
      });
      return;
    // ...
    // Upload new attachments to Supabase Storage and get URLs, keep existing URLs
    let attachmentUrls: string[] = [];
    if (attachments.length) {
      try {
        const uploadResults = await Promise.all(
          attachments.map(att =>
            att.file ? uploadAttachment(att.file, poNumber) : att.url
          )
        );
        attachmentUrls = uploadResults;
      } catch (err) {
        toast({
          title: 'Attachment Upload Error',
          description: 'Failed to upload one or more attachments.',
          variant: 'destructive',
        });
        return;
      }
    }
    // Save all extra details in a 'meta' column as JSON string
    const meta = {
      purposeArabic,
      costCenter,
      totalBudget,
      totalConsumed,
      appliedAmount,
      leftOver,
      tableFields,
      approvals,
      customColumns,
      customRows,
      poType,
      wordTableData,
      attachments: attachmentUrls,
    };
    const poData = {
      id: (editPO?.id || Date.now().toString()) + '',
      poNumber: (poNumber || '') + '',
      date: (date || '') + '',
      location: (poLocation || '') + '',
      department: (department || '') + '',
      purposeEnglish: (purposeEnglish || '') + '',
      status: (type === 'pending' ? 'pending' : 'draft') + '',
      meta: JSON.stringify(meta) || '',
    };
    console.log('DEBUG: Payload to Supabase:', JSON.stringify(poData, null, 2));
    try {

      console.log('Saving PO to Supabase:', poData);
    } catch (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل الحفظ في Supabase' : 'Failed to save to Supabase',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem("settings") || "{}");
    setLanguage(savedSettings.language || "en");
    setCompanyLogo(savedSettings.companyLogo || nmcLogo);
    setCompanyNameEn(savedSettings.companyNameEn || "Northern Mountains Contracting Co.");
    setCompanyNameAr(savedSettings.companyNameAr || "شركة الجبال الشمالية للمقاولات");
    setLocationEn(savedSettings.locationEn || "Riyadh – KSA");
    setLocationAr(savedSettings.locationAr || "المملكة العربية السعودية – الرياض");
    setPhoneNumber(savedSettings.phoneNumber || "Phone: 011-2397939");
    // Load location options from localStorage
    const saved = localStorage.getItem("locationOptions");
    if (saved) {
      setLocationOptions(JSON.parse(saved));
    } else {
      setLocationOptions([
        { en: "MAINTENANCE DEPARTMENT", ar: "قسم الصيانة" },
        { en: "PROJECTS DEPARTMENT", ar: "قسم المشاريع" },
        { en: "HR DEPARTMENT", ar: "قسم الموارد البشرية" },
        { en: "FINANCE DEPARTMENT", ar: "قسم المالية" },
        { en: "OTHER", ar: "قسم آخر" },
      ]);
    }
  }, []);

  if (!accountType) {
    return <AccountTypePicker onPick={handlePickAccountType} />;
  }
  // Only HR can create/edit POs
  if (accountType === "finance") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="bg-white p-8 rounded shadow-md w-96 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-center">Finance Account</h2>
          <p className="text-center">You can only view and approve/decline published POs.</p>
          <Button onClick={() => { localStorage.removeItem("accountType"); setAccountType(null); }}>Switch Account Type</Button>
        {/* Footer image */}
        <div style={{ width: '100%', marginTop: 32 }}>
          <img src={footerImg} alt="Footer" style={{ width: '100%', maxWidth: '100%', height: 'auto', objectFit: 'contain', display: 'block' }} />
        </div>
        </div>
      </div>
    );
  }
  // HR view (default)
  return (
    <div className="min-h-screen bg-background">
      {/* PO Type Selection Dialog */}
      <Dialog open={poTypeDialogOpen} onOpenChange={setPOTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose PO Type</DialogTitle>
            <DialogDescription>Select the type of Payment Order you want to create.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button variant={poType === 'normal' ? 'default' : 'outline'} onClick={() => { setPOType('normal'); setPOTypeDialogOpen(false); }}>Normal PO</Button>
            <Button variant={poType === 'extra-table' ? 'default' : 'outline'} onClick={() => { setPOType('extra-table'); setPOTypeDialogOpen(false); }}>Extra Table PO</Button>
            <Button variant="ghost" disabled>More PO types coming soon...</Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button 
              onClick={() => setSettingsOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>

          </div>
          <div className="flex items-center gap-2">
            <PrintButton printRef={printRef} />
            <PrintAttachmentsButton attachments={attachments} attachmentURLs={attachmentURLs} />
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {language === 'ar' ? 'حفظ أمر الدفع' : 'Save PO'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{language === 'ar' ? 'خيارات الحفظ' : 'Save Options'}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <Button variant="outline" onClick={() => { setSaveDialogOpen(false); handleSave('draft'); }}>
                    {language === 'ar' ? 'حفظ كمسودة' : 'Save as Draft'}
                  </Button>
                  <Button variant="default" onClick={() => { setSaveDialogOpen(false); handleSave('pending'); }}>
                    {language === 'ar' ? 'حفظ ونشر' : 'Save and Publish'}
                  </Button>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setSaveDialogOpen(false)}>
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

  {/* Main form content - optimized for print and layout */}
  <div ref={printRef} className="po-form-container bg-white border border-form-border p-8 print:shadow-none print:border-none" style={{ position: 'relative', fontFamily: 'Arial, sans-serif', fontSize: '12px', maxWidth: '800px', margin: '0 auto', background: 'white' }}>
          {/* Transparent logo background for print */}
          <img src={companyLogo || nmcLogo} alt="Watermark" className="print-watermark" style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: '70%', opacity: 0.08, pointerEvents: 'none', zIndex: 0 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            {/* Top Left Section */}
            <div style={{ maxWidth: '55%' }}>
              <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{companyNameEn}</div>
              <div style={{ fontSize: '12px' }}>{companyNameAr}</div>
              <div style={{ fontSize: '11px', marginTop: '2px' }}>{locationEn} {locationAr}<br />{phoneNumber}</div>
            </div>
            {/* Top Right Section */}
            <div style={{ textAlign: 'right', maxWidth: '40%' }}>
              <img src={companyLogo || nmcLogo} alt="Logo" style={{ height: '64px', marginBottom: '2px' }} />
              <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '2px' }}>HR PAYMENT ORDER</div>
              <div style={{ fontSize: '12px' }}>
                P.O. (<input type="text" value={poNumber} onChange={e => setPONumber(e.target.value)} style={{ width: '80px', fontSize: '12px', border: '1px solid #888', borderRadius: '3px', padding: '2px', textAlign: 'center' }} />)
              </div>
            </div>
          </div>
          {/* Details Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ width: '48%' }}>
              <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '2px', display: 'flex', alignItems: 'center' }}>
                LOCATION:
                <select value={poLocation} onChange={e => setPOLocation(e.target.value)} style={{ marginLeft: '6px', fontSize: '12px', border: '1px solid #888', borderRadius: '3px', padding: '2px' }}>
                  {locationOptions.map(opt => (
                    <option key={opt.en} value={opt.en}>{opt.en}</option>
                  ))}
                </select>
                <span style={{ marginLeft: '12px', fontSize: '12px', color: '#444', fontWeight: 'normal' }}>{
                  (locationOptions.find(opt => opt.en === poLocation)?.ar) || ""
                }</span>
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '12px' }}>DEPARTMENT <input type="text" value={department} onChange={e => setDepartment(e.target.value)} style={{ marginLeft: '6px', fontSize: '12px', border: '1px solid #888', borderRadius: '3px', padding: '2px', width: '120px' }} /></div>
            </div>
            <div style={{ width: '48%', textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '2px', display: 'flex', alignItems: 'center' }}>
                DATE:
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{ marginLeft: '6px', fontSize: '12px', border: '1px solid #888', borderRadius: '3px', padding: '2px 8px', background: '#fafafa', color: '#222', width: '140px' }}
                />
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '12px' }}>التاريخ <span style={{ fontWeight: 'normal' }}>{date}</span></div>
            </div>
          </div>
          {/* Purpose Section - editable with forced label and auto-translate button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ width: '48%' }}>
              <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '2px' }}>PURPOSE:</div>
              <textarea
                value={purposeEnglish}
                onChange={e => setPurposeEnglish(e.target.value)}
                style={{ fontSize: '12px', minHeight: '32px', border: '1px solid #888', padding: '4px', background: '#fafafa', width: '100%', resize: 'vertical', direction: 'ltr' }}
                placeholder="Enter purpose in English"
                dir="ltr"
              />
              <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>Files attached</div>
            </div>
            <div style={{ width: '48%', textAlign: 'right', position: 'relative' }}>
              <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '2px' }}>الوصف:</div>
              <textarea
                value={purposeArabic}
                onChange={e => setPurposeArabic(e.target.value)}
                style={{ fontSize: '12px', minHeight: '32px', border: '1px solid #888', padding: '4px', background: '#fafafa', width: '100%', resize: 'vertical', direction: 'rtl' }}
                placeholder="ادخل الوصف بالعربية"
                dir="rtl"
              />
              <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>الملفات مرفقة</div>
              {/* Auto-translate button, hidden during print */}
              <button
                type="button"
                onClick={async () => {
                  // Use MyMemory API for translation
                  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(purposeArabic)}&langpair=ar|en`;
                  try {
                    const res = await fetch(url);
                    const data = await res.json();
                    if (data?.responseData?.translatedText) {
                      setPurposeEnglish(data.responseData.translatedText);
                    }
                  } catch (err) {
                    alert('Translation failed');
                  }
                }}
                style={{ position: 'absolute', left: 0, top: '0', fontSize: '11px', padding: '2px 8px', border: '1px solid #888', borderRadius: '3px', background: '#eee', cursor: 'pointer', zIndex: 2, display: 'block' }}
                className="print:hidden"
              >Translate</button>
            </div>
          </div>

          {/* Conditional table rendering based on PO type */}
          {poType === 'extra-table' && (
            <WordTable value={wordTableData} onChange={setWordTableData} />
          )}
          {/* NMC Details Table - fully restored with all fields, editable values only */}
          <table className="compact-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '11px' }}>
            <thead>
              <tr style={{ background: '#f3f3f3' }}>
                <th colSpan={2} style={{ border: '1px solid #888', padding: '4px', fontWeight: 'bold', textAlign: 'center' }}>NMC</th>
                <th colSpan={2} style={{ border: '1px solid #888', padding: '4px', fontWeight: 'bold', textAlign: 'center' }}></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #888', padding: '4px', fontWeight: 'bold' }}>Beneficiary Name<br /><span style={{ fontWeight: 'normal' }}>اسم المستفيد</span></td>
                <td style={{ border: '1px solid #888', padding: '4px' }}><input type="text" value={tableFields[0]?.value || ''} onChange={e => {
                  const newFields = [...tableFields];
                  newFields[0].value = e.target.value;
                  setTableFields(newFields);
                }} style={{ width: '100%', fontSize: '11px', border: '1px solid #888', borderRadius: '3px', padding: '2px' }} /></td>
                <td style={{ border: '1px solid #888', padding: '4px', fontWeight: 'bold' }}>Cost Center<br /><span style={{ fontWeight: 'normal' }}>مركز التكلفة</span></td>
                <td style={{ border: '1px solid #888', padding: '4px' }}><input type="text" value={costCenter} onChange={e => setCostCenter(e.target.value)} style={{ width: '100%', fontSize: '11px', border: '1px solid #888', borderRadius: '3px', padding: '2px' }} /></td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #888', padding: '4px', fontWeight: 'bold' }}>Amount<br /><span style={{ fontWeight: 'normal' }}>المبلغ</span></td>
                <td style={{ border: '1px solid #888', padding: '4px' }}><input type="text" value={tableFields[1]?.value || ''} onChange={e => {
                  const newFields = [...tableFields];
                  newFields[1].value = e.target.value;
                  setTableFields(newFields);
                }} style={{ width: '100%', fontSize: '11px', border: '1px solid #888', borderRadius: '3px', padding: '2px' }} /></td>
                <td style={{ border: '1px solid #888', padding: '4px', fontWeight: 'bold' }}>Total Budget<br /><span style={{ fontWeight: 'normal' }}>الموازنة التقديرية</span></td>
                <td style={{ border: '1px solid #888', padding: '4px' }}><input type="text" value={totalBudget} onChange={e => setTotalBudget(e.target.value)} style={{ width: '100%', fontSize: '11px', border: '1px solid #888', borderRadius: '3px', padding: '2px' }} /></td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #888', padding: '4px', fontWeight: 'bold' }}>Payment Method<br /><span style={{ fontWeight: 'normal' }}>طريقة الدفع</span></td>
                <td style={{ border: '1px solid #888', padding: '4px' }}><input type="text" value={tableFields[2]?.value || ''} onChange={e => {
                  const newFields = [...tableFields];
                  newFields[2].value = e.target.value;
                  setTableFields(newFields);
                }} style={{ width: '100%', fontSize: '11px', border: '1px solid #888', borderRadius: '3px', padding: '2px' }} /></td>
                <td style={{ border: '1px solid #888', padding: '4px', fontWeight: 'bold' }}>Total Consumed<br /><span style={{ fontWeight: 'normal' }}>الاستهلاك من الموازنة</span></td>
                <td style={{ border: '1px solid #888', padding: '4px' }}><input type="text" value={totalConsumed} onChange={e => setTotalConsumed(e.target.value)} style={{ width: '100%', fontSize: '11px', border: '1px solid #888', borderRadius: '3px', padding: '2px' }} /></td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #888', padding: '4px', fontWeight: 'bold' }}>Bank name<br /><span style={{ fontWeight: 'normal' }}>اسم البنك</span></td>
                <td style={{ border: '1px solid #888', padding: '4px' }}><input type="text" value={tableFields[3]?.value || ''} onChange={e => {
                  const newFields = [...tableFields];
                  newFields[3].value = e.target.value;
                  setTableFields(newFields);
                }} style={{ width: '100%', fontSize: '11px', border: '1px solid #888', borderRadius: '3px', padding: '2px' }} /></td>
                <td style={{ border: '1px solid #888', padding: '4px', fontWeight: 'bold' }}>Applied this time<br /><span style={{ fontWeight: 'normal' }}>تم التقديم هذه المرة</span></td>
                <td style={{ border: '1px solid #888', padding: '4px' }}><input type="text" value={appliedAmount} onChange={e => setAppliedAmount(e.target.value)} style={{ width: '100%', fontSize: '11px', border: '1px solid #888', borderRadius: '3px', padding: '2px' }} /></td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #888', padding: '4px', fontWeight: 'bold' }}>Payment Type<br /><span style={{ fontWeight: 'normal' }}>نوع المدفوعات</span></td>
                <td style={{ border: '1px solid #888', padding: '4px' }}><input type="text" value={tableFields[4]?.value || ''} onChange={e => {
                  const newFields = [...tableFields];
                  newFields[4].value = e.target.value;
                  setTableFields(newFields);
                }} style={{ width: '100%', fontSize: '11px', border: '1px solid #888', borderRadius: '3px', padding: '2px' }} /></td>
                <td style={{ border: '1px solid #888', padding: '4px', fontWeight: 'bold' }}>Left Over<br /><span style={{ fontWeight: 'normal' }}>المتبقي</span></td>
                <td style={{ border: '1px solid #888', padding: '4px' }}><input type="text" value={leftOver} onChange={e => setLeftOver(e.target.value)} style={{ width: '100%', fontSize: '11px', border: '1px solid #888', borderRadius: '3px', padding: '2px' }} /></td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #888', padding: '4px', fontWeight: 'bold' }}>Time to Deliver<br /><span style={{ fontWeight: 'normal' }}>وقت التسليم</span></td>
                <td style={{ border: '1px solid #888', padding: '4px' }}>
                  <input
                    type="date"
                    value={tableFields[5]?.value || ''}
                    onChange={e => {
                      const newFields = [...tableFields];
                      if (newFields[5]) newFields[5].value = e.target.value;
                      setTableFields(newFields);
                    }}
                    style={{ width: '100%', fontSize: '11px', border: '1px solid #888', borderRadius: '3px', padding: '2px' }}
                  />
                </td>
                <td style={{ border: '1px solid #888', padding: '4px' }}></td>
                <td style={{ border: '1px solid #888', padding: '4px' }}></td>
              </tr>
            </tbody>
          </table>
          {/* Approvals Table (static, for signatures) */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', marginBottom: '8px', fontSize: '11px' }}>
            <thead>
              <tr style={{ background: '#f3f3f3' }}>
                <th style={{border:'1px solid #888',padding:'4px',fontWeight:'bold'}}>Position<br />الصفة</th>
                <th style={{border:'1px solid #888',padding:'4px',fontWeight:'bold'}}>Signature<br />التوقيع</th>
                <th style={{border:'1px solid #888',padding:'4px',fontWeight:'bold'}}>comments<br />ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{border:'1px solid #888',padding:'4px'}}>HR officer<br />موظف الموارد البشرية</td>
                <td style={{border:'1px solid #888',padding:'4px'}}>.......................</td>
                <td style={{border:'1px solid #888',padding:'4px'}}>.......................</td>
              </tr>
              <tr>
                <td style={{border:'1px solid #888',padding:'4px'}}>Projects Manager<br />مدير المشاريع</td>
                <td style={{border:'1px solid #888',padding:'4px'}}>.......................</td>
                <td style={{border:'1px solid #888',padding:'4px'}}>.......................</td>
              </tr>
              <tr>
                <td style={{border:'1px solid #888',padding:'4px'}}>Managing Director<br />المدير الإداري</td>
                <td style={{border:'1px solid #888',padding:'4px'}}>.......................</td>
                <td style={{border:'1px solid #888',padding:'4px'}}>.......................</td>
              </tr>
              <tr>
                <td style={{border:'1px solid #888',padding:'4px'}}>Finance Management<br />الإدارة المالية</td>
                <td style={{border:'1px solid #888',padding:'4px'}}>.......................</td>
                <td style={{border:'1px solid #888',padding:'4px'}}>.......................</td>
              </tr>
              <tr>
                <td style={{border:'1px solid #888',padding:'4px'}}>CEO<br />الرئيس التنفيذي</td>
                <td style={{border:'1px solid #888',padding:'4px'}}>.......................</td>
                <td style={{border:'1px solid #888',padding:'4px'}}>.......................</td>
              </tr>
            </tbody>
          </table>

        {/* Footer image for the PO form (not for popups) - moved inside po-form-container for printing */}
        <div className="po-form-footer-img" style={{ width: '100%', marginTop: 24, marginBottom: 8, textAlign: 'center' }}>
          <img src={footerImg} alt="Footer" style={{ width: '100%', maxWidth: 600, height: 'auto', objectFit: 'contain', display: 'inline-block' }} />
        </div>
      </div>
      {/* Attachments Section - below the form */}
      <div style={{ maxWidth: 800, margin: '32px auto 0 auto', padding: 16, background: '#f9f9f9', borderRadius: 8, border: '1px solid #e0e0e0' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <label style={{ fontWeight: 'bold', fontSize: 15, marginRight: 16 }}>Attachments</label>
          <button
            type="button"
            onClick={() => document.getElementById('attachment-input')?.click()}
            style={{
              background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 700, marginRight: 4 }}>+</span> Add Attachment
          </button>
          <input
            id="attachment-input"
            type="file"
            multiple
            accept=".pdf,image/png,image/jpeg,image/jpg,image/webp,image/gif,image/bmp,image/svg+xml"
            onChange={handleAttachmentChange}
            style={{ display: 'none' }}
          />
        </div>
        {/* Always-visible attachment viewer (not shown in print) */}
        <div
          className="print:hidden"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 18,
            marginTop: 8,
            maxHeight: 180,
            overflowX: 'auto',
            overflowY: 'auto',
            border: attachments.length ? '1px solid #e0e0e0' : undefined,
            borderRadius: 8,
            background: attachments.length ? '#f6f8fa' : undefined,
            padding: attachments.length ? 12 : 0
          }}
        >
          {attachments.length === 0 && (
            <div style={{ color: '#888', fontSize: 13, padding: 12 }}>No attachments added yet.</div>
          )}
          {attachments.map((file, idx) => {
            const url = attachmentURLs[idx];
            return (
              <div key={idx} style={{ textAlign: 'center', background: '#fff', border: '1px solid #ddd', borderRadius: 6, padding: 8, minWidth: 120, position: 'relative', boxShadow: '0 1px 4px #0001' }}>
                {file.type.startsWith('image/') ? (
                  <img src={url} alt={file.name} style={{ maxWidth: 100, maxHeight: 100, border: '1px solid #ccc', borderRadius: 4 }} />
                ) : file.type === 'application/pdf' ? (
                  <span style={{ fontSize: 32 }}>📄</span>
                ) : (
                  <span style={{ fontSize: 32 }}>📎</span>
                )}
                <div style={{ fontSize: 11, marginTop: 4, wordBreak: 'break-all' }}>{file.name}</div>
                <button
                  type="button"
                  onClick={() => handleDeleteAttachment(idx)}
                  style={{ position: 'absolute', top: 4, right: 4, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontWeight: 700, fontSize: 14, lineHeight: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Delete attachment"
                >×</button>
              </div>
            );
          })}
        </div>
        {/* Print-only: Attachments on separate pages, minimal design */}
        {attachments.map((att, idx) => {
          const url = att.url;
          const ext = url.split('.').pop()?.toLowerCase();
          const isImage = att.file ? att.file.type.startsWith('image/') : /(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(ext || '');
          const isPDF = att.file ? att.file.type === 'application/pdf' : ext === 'pdf';
          return (
            <div
              key={idx}
              className="print-attachment-page"
              style={{
                pageBreakBefore: 'always',
                textAlign: 'center',
                margin: '0 auto',
                maxWidth: 800,
                background: 'white',
                padding: 48,
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 24, color: '#2563eb' }}>
                Attachment: {att.file?.name || url.split('/').pop()}
              </div>
              {isImage ? (
                <img src={url} alt={att.file?.name || url.split('/').pop()} style={{ maxWidth: '90vw', maxHeight: '80vh', border: '1px solid #ccc', borderRadius: 4 }} />
              ) : isPDF ? (
                <object data={url} type="application/pdf" width="90%" height="700px">
                  <a href={url} target="_blank" rel="noopener noreferrer">{att.file?.name || url.split('/').pop()}</a>
                </object>
              ) : (
                <div style={{ fontSize: 48, color: '#888' }}>📎</div>
              )}
            </div>
          );
        })}
        <CompanySettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          onSettingsChange={handleSettingsChange}
        />
      </div>
    </div>
  </div>
  );
};}

export default POForm;