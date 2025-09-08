import { useBeneficiaryNameSuggestions } from "@/hooks/useBeneficiaryNameSuggestions";
function BeneficiaryNameAutocomplete({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const suggestions = useBeneficiaryNameSuggestions();
  const [show, setShow] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const ref = useRef<HTMLInputElement>(null);
  const filtered = value.trim()
    ? suggestions.filter(s => s.toLowerCase().includes(value.trim().toLowerCase()) && s !== value.trim()).slice(0, 7)
    : [];
  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setShow(true); setHighlight(-1); }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 120)}
        style={{ width: '100%', fontSize: '11px', border: '1px solid #888', borderRadius: '3px', padding: '2px' }}
        placeholder="Beneficiary Name"
        autoComplete="off"
      />
      <ul style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: ref.current ? ref.current.offsetHeight + 4 : 40,
        background: '#fff',
        border: '2px solid #2563eb',
        borderRadius: '3px',
        zIndex: 10,
        margin: 0,
        padding: 0,
        listStyle: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        maxHeight: 140,
        overflowY: 'auto',
        fontSize: '12px',
        display: value.trim() && filtered.length > 0 && show ? 'block' : 'none',
      }}>
        {filtered.map((s, i) => (
          <li
            key={s}
            onMouseDown={() => { onChange(s); setShow(false); }}
            onMouseEnter={() => setHighlight(i)}
            style={{
              background: highlight === i ? '#e6f0fa' : '#fff',
              padding: '6px 12px',
              cursor: 'pointer',
              borderBottom: i !== filtered.length - 1 ? '1px solid #eee' : 'none',
            }}
          >{s}</li>
        ))}
      </ul>
    </div>
  );
}
// --- Autocomplete for Arabic Purpose ---
import React, { useState, useRef } from "react";
import { FaStar } from "react-icons/fa";
type PurposeSuggestion = { value: string; isAI?: boolean };
type PurposeArabicAutocompleteProps = {
  value: string;
  onChange: (v: string) => void;
  suggestionsHook: () => PurposeSuggestion[];
};
function PurposeArabicAutocomplete({ value, onChange, suggestionsHook }: PurposeArabicAutocompleteProps) {
  const suggestions = suggestionsHook();
  const [show, setShow] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const ref = useRef<HTMLTextAreaElement>(null);
  const filtered = value.trim()
    ? suggestions.filter(s => s.value.includes(value.trim()) && s.value !== value.trim()).slice(0, 7)
    : suggestions.slice(0, 7);
  // Always show suggestions when focused, hide only on blur
  return (
    <div style={{ position: 'relative', direction: 'rtl' }}>
      <textarea
        ref={ref}
        value={value}
        onChange={e => { onChange(e.target.value); setShow(true); setHighlight(-1); }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 120)}
        style={{ fontSize: '12px', minHeight: '32px', border: '1px solid #888', padding: '4px', background: '#fafafa', width: '100%', resize: 'vertical', direction: 'rtl' }}
        placeholder="ادخل الوصف بالعربية"
      />
      <ul style={{
        position: 'absolute',
        right: 0,
        left: 0,
        top: ref.current ? ref.current.offsetHeight + 4 : 40,
        background: '#fff',
        border: '2px solid #e00',
        borderRadius: '3px',
        zIndex: 10,
        margin: 0,
        padding: 0,
        listStyle: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        maxHeight: 140,
        overflowY: 'auto',
        fontSize: '12px',
        textAlign: 'right',
        display: show ? 'block' : 'none',
      }}>
        {filtered.map((s, i) => (
          <li
            key={s.value}
            onMouseDown={() => { onChange(s.value); setShow(false); }}
            onMouseEnter={() => setHighlight(i)}
            style={{
              background: highlight === i ? '#e6f0fa' : '#fff',
              padding: '6px 12px',
              cursor: 'pointer',
              borderBottom: i !== filtered.length - 1 ? '1px solid #eee' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {s.value}
            {s.isAI && <FaStar style={{ color: '#2563eb', marginRight: 6 }} title="AI suggestion" />}
          </li>
        ))}
      </ul>
    </div>
  );
}
import '../poform-print.css';
import fotter from '@/assets/fotter.png';
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { uploadAttachment } from '@/utils/uploadAttachment';
import { POFormHeader } from "@/components/POForm/POFormHeader";
import { PODetailsSection } from "@/components/POForm/PODetailsSection";
import { BilingualInput } from "@/components/POForm/BillingualInput";
import { usePurposeArabicSuggestions } from "@/hooks/usePurposeArabicSuggestions";
import { CustomizableTable } from "@/components/POForm/CustomizableTable";
import { CostCenterTable } from "@/components/POForm/CostCenterTable";
import { ApprovalSection } from "@/components/POForm/ApprovalSection";
import { POFormFooter } from "@/components/POForm/POFormFooter";
import { PrintButton } from "@/components/POForm/PrintButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DialogFooter } from "@/components/ui/dialog";
import { DialogTrigger } from "@/components/ui/dialog";
import nmcLogo from "@/assets/nmc-logo.png";
import { CompanySettingsDialog } from "@/components/Settings/CompanySettingsDialog";
import { POData, TableField } from "@/types/po";
import { getNextPONumber } from "@/utils/poUtils";
import { Save, ArrowLeft, Settings } from "lucide-react";
import { addPOToSupabase, updatePOInSupabase } from '@/utils/poSupabase';
import type { CustomTableColumn, CustomTableRow } from "@/components/POForm/CustomTable";
import TabulatorTable from "@/components/POForm/TabulatorTable";
import DataGridTable from "@/components/POForm/DataGridTable";

const defaultTableFields: TableField[] = [
  { label: "Beneficiary Name المستفيد", value: "", type: "text" },
  { label: "Amount المبلغ", value: "", type: "text" },
  { label: "Payment Method طريقة الدفع", value: "", type: "text" },
  { label: "Payment Type نوع الدفع", value: "", type: "text" },
  { label: "Time to Deliver وقت التسليم", value: "", type: "text" }
];

const POForm = () => {
  // Attachments state

  // Handle attachment file input change
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    setAttachmentURLs(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
  };
  // ...existing code...
  // State for extra custom table
  const [customColumns, setCustomColumns] = useState<CustomTableColumn[]>([
    { id: "col1", name: "Column 1" },
    { id: "col2", name: "Column 2" }
  ]);
  const [customRows, setCustomRows] = useState<CustomTableRow[]>([
    { id: "row1", values: ["", ""] }
  ]);
  // PO type selection
  const [poTypeDialogOpen, setPOTypeDialogOpen] = useState(true);
  const [poType, setPOType] = useState<'normal' | 'extra-table' | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Detect edit mode
  const editPO = location.state?.po;
  const editPOId = editPO?.id || null;

  // Form state
  const [poNumber, setPONumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationOptions, setLocationOptions] = useState<{ en: string; ar: string }[]>([]);
  const [poLocation, setPOLocation] = useState("");
  const [department, setDepartment] = useState("");
  const [purposeEnglish, setPurposeEnglish] = useState("");
  const [purposeArabic, setPurposeArabic] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [companySettingsKey, setCompanySettingsKey] = useState(0);

  // Cost center fields
  const [costCenter, setCostCenter] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [totalConsumed, setTotalConsumed] = useState("");
  const [appliedAmount, setAppliedAmount] = useState("");
  const [leftOver, setLeftOver] = useState("");

  // Table fields
  const [tableFields, setTableFields] = useState<TableField[]>(defaultTableFields);

  // Approvals
  const [approvals, setApprovals] = useState({
    hrOfficer: { signed: false, signature: "", comments: "" },
    projectsManager: { signed: false, signature: "", comments: "" },
    managingDirector: { signed: false, signature: "", comments: "" },
    financeManagement: { signed: false, signature: "", comments: "" }
  });

  // Load PO data if editing
  useEffect(() => {
    function setInitialPONumber() {
      if (editPO) {
        setPONumber(editPO.poNumber || "");
        setDate(editPO.date || new Date().toISOString().split('T')[0]);
        setPOLocation(editPO.location || "MAINTENANCE DEPARTMENT");
        setDepartment(editPO.department || "");
        setPurposeEnglish(editPO.purposeEnglish || "");
        setPurposeArabic(editPO.purposeArabic || "");
        setCostCenter(editPO.costCenter || "");
        setTotalBudget(editPO.totalBudget || "");
        setTotalConsumed(editPO.totalConsumed || "");
        setAppliedAmount(editPO.appliedAmount || "");
        setLeftOver(editPO.leftOver || "");
        if (editPO.customFields) {
          const fields = defaultTableFields.map(f => ({ ...f, value: editPO.customFields[f.label] || "" }));
          setTableFields(fields);
        }
        if (editPO.approvals) setApprovals(editPO.approvals);
      } else {
        // Use local POs for numbering
        setPONumber(getNextPONumber());
        setPOLocation("MAINTENANCE DEPARTMENT");
      }
    }
    setInitialPONumber();
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

  // Attachments state
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentURLs, setAttachmentURLs] = useState<string[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<number | null>(null);

  // Save PO handler
  const handleSave = async (type: 'pending' | 'draft') => {
  // Save locationOptions as default if changed (user can edit in form in future)
  localStorage.setItem("locationOptions", JSON.stringify(locationOptions));
    // --- SAVE LOGIC EXPLANATION ---
    // Saving as draft: status remains 'draft', PO is not sent to finance, can be edited later.
    // Publishing: status becomes 'pending', PO is sent to finance for processing.

    // Upload attachments to Supabase if any
    let uploadedAttachmentUrls: string[] = [];
    if (attachments.length > 0) {
      for (let file of attachments) {
        try {
          // Upload to a path named after the PO number and file name, not inside attachments folder
          const folder = poNumber || 'unknown-po';
          const filePath = `${folder}/${file.name}`;
          // uploadAttachment returns a public URL string
          const publicUrl = await uploadAttachment(file, filePath);
          if (publicUrl) uploadedAttachmentUrls.push(publicUrl);
        } catch (e) {
          toast({ title: 'Attachment Upload Error', description: 'Failed to upload one or more attachments', variant: 'destructive' });
        }
      }
    }

    // Compose meta object as required
    const metaObj = {
      purposeArabic,
      costCenter,
      totalBudget,
      totalConsumed, 
      appliedAmount,
      leftOver,
      tableFields,
      customColumns,
      customRows,
      poType,
      attachments: uploadedAttachmentUrls
    };

    // Compose PO data
    // Get creator from localStorage (set in account picker)
    let creator = localStorage.getItem('hrName') || '';
    const poData: Partial<POData> = {
      poNumber,
      date,
      location: poLocation,
      department,
      purposeEnglish,
      purposeArabic,
      costCenter,
      totalBudget,
      totalConsumed,
      appliedAmount,
      leftOver,
      customFields: tableFields.reduce((acc, field) => {
        acc[field.label] = field.value;
        return acc;
      }, {} as { [key: string]: string }),
      status: type === 'pending' ? 'pending' : 'draft',
      tags: [],
      creator,
      meta: JSON.stringify(metaObj)
    };

    const savedPOs = JSON.parse(localStorage.getItem('pos') || '[]');

    // Helper to filter PO fields for Supabase
    const filterForSupabase = (po: any) => ({
      id: po.id,
      poNumber: po.poNumber,
      date: po.date,
      location: po.location,
      department: po.department,
      purposeEnglish: po.purposeEnglish,
      status: po.status,
      creator: po.creator, // send creator to Supabase
      meta: po.meta || '',
      // Do NOT send any approval booleans on creation; let Supabase default them to null/false
      // ...add other fields as needed
    });

    if (editPOId) {
      // Update existing PO
      const idx = savedPOs.findIndex((p: any) => p.id === editPOId);
      if (idx !== -1) {
        savedPOs[idx] = { ...savedPOs[idx], ...poData, id: editPOId };
        localStorage.setItem('pos', JSON.stringify(savedPOs));
        try {
          await updatePOInSupabase(editPOId, filterForSupabase({ ...poData, id: editPOId }));
        } catch (e) {
          toast({ title: 'Supabase Error', description: 'Failed to update PO in Supabase', variant: 'destructive' });
        }
        toast({
          title: language === 'ar' ? 'تم التحديث بنجاح' : 'Success',
          description: language === 'ar' ? (type === 'pending' ? 'تم نشر أمر الدفع بنجاح' : 'تم حفظ أمر الدفع كمسودة') : (type === 'pending' ? 'PO published successfully' : 'PO saved as draft'),
        });
        navigate('/');
        return;
      }
    }

    // Create new PO
    const newPO = {
      ...poData,
      id: Date.now().toString(),
    };
    savedPOs.push(newPO);
    localStorage.setItem('pos', JSON.stringify(savedPOs));
    try {
      await addPOToSupabase(filterForSupabase(newPO));
    } catch (e) {
      toast({ title: 'Supabase Error', description: 'Failed to upload PO to Supabase', variant: 'destructive' });
    }
    toast({
      title: language === 'ar' ? 'تم الحفظ بنجاح' : 'Success',
      description: language === 'ar' ? (type === 'pending' ? 'تم نشر أمر الدفع بنجاح' : 'تم حفظ أمر الدفع كمسودة') : (type === 'pending' ? 'PO published successfully' : 'PO saved as draft'),
    });
    navigate('/');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSettingsChange = () => {
    setCompanySettingsKey(prev => prev + 1);
  };

  const printRef = useRef<HTMLDivElement>(null);

  // Load company defaults from localStorage
  const [language, setLanguage] = useState("en");
  const [companyLogo, setCompanyLogo] = useState("");
  const [companyNameEn, setCompanyNameEn] = useState("");
  const [companyNameAr, setCompanyNameAr] = useState("");
  const [locationEn, setLocationEn] = useState("");
  const [locationAr, setLocationAr] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem("settings") || "{}");
  setLanguage(savedSettings.language || "en");
  setCompanyLogo(savedSettings.companyLogo || nmcLogo);
  setCompanyNameEn(savedSettings.companyNameEn || "Northern Mountains Contracting Co.");
  setCompanyNameAr(savedSettings.companyNameAr || "شركة الجبال الشمالية للمقاولات");
  setLocationEn(savedSettings.locationEn || "Riyadh – KSA");
  setLocationAr(savedSettings.locationAr || "المملكة العربية السعودية – الرياض");
  setPhoneNumber(savedSettings.phoneNumber || "Phone: 011-2397939");
    // Load location options from localStorage (set by OptionsTab)
    const saved = localStorage.getItem("locationOptions");
    let opts: { en: string; ar: string }[] = [];
    if (saved) {
      opts = JSON.parse(saved);
    } else {
      opts = [
        { en: "MAINTENANCE DEPARTMENT", ar: "قسم الصيانة" },
        { en: "PROJECTS DEPARTMENT", ar: "قسم المشاريع" },
        { en: "HR DEPARTMENT", ar: "قسم الموارد البشرية" },
        { en: "FINANCE DEPARTMENT", ar: "قسم المالية" },
        { en: "OTHER", ar: "قسم آخر" },
      ];
      localStorage.setItem("locationOptions", JSON.stringify(opts));
    }
    setLocationOptions(opts);
    // Set default location to first option if not editing
    if (!editPO && opts.length > 0) {
      // Use default location if set in settings, else first option
      if (savedSettings.locationEn && opts.some(o => o.en === savedSettings.locationEn)) {
        setPOLocation(savedSettings.locationEn);
      } else {
        setPOLocation(opts[0].en);
      }
    }
  }, []);

  // Print Attachments
  const handlePrintAttachments = async () => {
    // Use uploadedAttachmentUrls if available, else use attachmentURLs (local preview)
    let urls: string[] = [];
    if (attachments.length > 0 && attachmentURLs.length === attachments.length) {
      // Not yet saved, use local preview
      urls = attachmentURLs;
    } else if (editPO?.meta) {
      // After save, use uploaded URLs from meta
      try {
        const metaObj = JSON.parse(editPO.meta);
        urls = metaObj.attachments || [];
      } catch {
        urls = [];
      }
    }
    if (!urls.length) {
      toast({ title: 'No Attachments', description: 'No attachments to print', variant: 'destructive' });
      return;
    }
    // Dynamically import jsPDF and html2canvas for PDF merging
    const [{ default: jsPDF }, html2canvas] = await Promise.all([
      import('jspdf'),
      import('html2canvas')
    ]);
    const pdf = new jsPDF();
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) {
        // Image
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        await new Promise(res => { img.onload = res; });
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx && ctx.drawImage(img, 0, 0);
        const imgData = canvas.toDataURL('image/png');
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, 10, 190, 277);
      } else if (url.match(/\.pdf$/i)) {
        // PDF: embed as object (jsPDF can't merge PDFs natively in browser)
        // Open in new window for print
        window.open(url, '_blank');
      }
    }
    pdf.autoPrint && pdf.autoPrint();
    pdf.output('dataurlnewwindow');
  };

  // Add this function inside the POForm component, before the return statement:
  const handleDeleteAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
    setAttachmentURLs(prev => prev.filter((_, i) => i !== idx));
    if (typeof previewAttachment === 'number' && previewAttachment === idx) setPreviewAttachment(null);
  };

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

        {/* Main form content - everything inside the bordered form */}
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
              <img src={companyLogo || nmcLogo} alt="Logo" style={{ height: '40px', marginBottom: '2px' }} />
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
                style={{ fontSize: '12px', minHeight: '32px', border: '1px solid #888', padding: '4px', background: '#fafafa', width: '100%', resize: 'vertical' }}
                placeholder="Enter purpose in English"
              />
              <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>Files attached</div>
            </div>
            <div style={{ width: '48%', textAlign: 'right', position: 'relative' }}>
              <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '2px' }}>الوصف:</div>
              <PurposeArabicAutocomplete
                value={purposeArabic}
                onChange={setPurposeArabic}
                suggestionsHook={() => usePurposeArabicSuggestions(purposeArabic)}
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
          {/* NMC Details Table */}
          {/* Conditional table rendering based on PO type */}
          {poType === 'extra-table' && (
            <div style={{ margin: '32px 0' }}>
              <DataGridTable />
            </div>
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
                <td style={{ border: '1px solid #888', padding: '4px' }}>
                  <BeneficiaryNameAutocomplete
                    value={tableFields[0]?.value || ''}
                    onChange={v => {
                      const newFields = [...tableFields];
                      newFields[0].value = v;
                      setTableFields(newFields);
                    }}
                  />
                </td>
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
                <td style={{ border: '1px solid #888', padding: '4px' }}><input type="text" value={tableFields[5]?.value || ''} onChange={e => {
                  const newFields = [...tableFields];
                  if (newFields[5]) newFields[5].value = e.target.value;
                  setTableFields(newFields);
                }} style={{ width: '100%', fontSize: '11px', border: '1px solid #888', borderRadius: '3px', padding: '2px' }} /></td>
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
          {/* Footer now inside the form borders */}
          <div className="po-footer-print" style={{ width: '100%', marginTop: 32, textAlign: 'center' }}>
            <img src={fotter} alt="Footer" style={{ maxWidth: '100%', height: 60, objectFit: 'contain', display: 'block', margin: '0 auto' }} />
          </div>
        </div>
        {/* Attachments Section - moved outside the form and printRef, with a line separator */}
        <hr style={{ border: 'none', borderTop: '2px solid #888', margin: '40px 0 24px 0' }} />
        <div className="mb-6" style={{ maxWidth: 800, margin: '0 auto' }}>
          <h3 className="text-lg font-bold mb-2">Attachments</h3>
          <div className="flex gap-4 mt-4">
            <Button
              type="button"
              variant="default"
              style={{ background: '#2563eb', color: '#fff' }}
              onClick={() => document.getElementById('attachment-input')?.click()}
            >
              Add Attachments
            </Button>
            <input
              id="attachment-input"
              type="file"
              multiple
              accept=".pdf,image/png,image/jpeg,image/jpg,image/webp,image/gif,image/bmp,image/svg+xml"
              onChange={handleAttachmentChange}
              style={{ display: 'none' }}
            />
          </div>
          {/* Display list of added files below the button */}
          <div className="flex flex-wrap gap-4 mt-4">
            {attachments.length === 0 && <div style={{ color: '#888', fontSize: 13 }}>No attachments added yet.</div>}
            {attachments.map((file, idx) => (
              <div
                key={idx}
                style={{ textAlign: 'center', background: '#fff', border: '1px solid #ddd', borderRadius: 6, padding: 8, minWidth: 120, position: 'relative', boxShadow: '0 1px 4px #0001', cursor: 'pointer' }}
                onClick={() => setPreviewAttachment(idx)}
              >
                {file.type.startsWith('image/') ? (
                  <img src={attachmentURLs[idx]} alt={file.name} style={{ maxWidth: 100, maxHeight: 100, border: '1px solid #ccc', borderRadius: 4 }} />
                ) : file.type === 'application/pdf' ? (
                  <span style={{ fontSize: 32 }}>📄</span>
                ) : (
                  <span style={{ fontSize: 32 }}>📎</span>
                )}
                <div style={{ fontSize: 11, marginTop: 4, wordBreak: 'break-all' }}>{file.name}</div>
                <Button type="button" size="sm" variant="destructive" style={{ position: 'absolute', top: 4, right: 4 }} onClick={e => { e.stopPropagation(); handleDeleteAttachment(idx); }}>×</Button>
              </div>
            ))}
          </div>
          {/* Attachment preview popup */}
          {typeof previewAttachment === 'number' && attachments[previewAttachment] && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPreviewAttachment(null)}>
              <div style={{ background: '#fff', padding: 24, borderRadius: 8, maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }} onClick={e => e.stopPropagation()}>
                <Button type="button" size="sm" variant="destructive" style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }} onClick={() => setPreviewAttachment(null)}>×</Button>
                {attachments[previewAttachment].type.startsWith('image/') ? (
                  <img src={attachmentURLs[previewAttachment]} alt={attachments[previewAttachment].name} style={{ maxWidth: '80vw', maxHeight: '80vh', display: 'block', margin: '0 auto' }} />
                ) : attachments[previewAttachment].type === 'application/pdf' ? (
                  <iframe src={attachmentURLs[previewAttachment]} title={attachments[previewAttachment].name} style={{ width: '80vw', height: '80vh', border: 'none' }} />
                ) : (
                  <div style={{ fontSize: 18, textAlign: 'center' }}>{attachments[previewAttachment].name}</div>
                )}
              </div>
            </div>
          )}
        </div>
        {/* CompanySettingsDialog remains outside the form container */}
        <CompanySettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          onSettingsChange={handleSettingsChange}
        />
      </div>
    </div>
  );
};

export default POForm;