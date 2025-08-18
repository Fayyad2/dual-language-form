import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { POFormHeader } from "@/components/POForm/POFormHeader";
import { PODetailsSection } from "@/components/POForm/PODetailsSection";
import { BilingualInput } from "@/components/POForm/BillingualInput";
import { CustomizableTable } from "@/components/POForm/CustomizableTable";
import { CostCenterTable } from "@/components/POForm/CostCenterTable";
import { ApprovalSection } from "@/components/POForm/ApprovalSection";
import { POFormFooter } from "@/components/POForm/POFormFooter";
import { PrintButton } from "@/components/POForm/PrintButton";
import React, { useRef } from "react";
import nmcLogo from "@/assets/nmc-logo.png";
import { CompanySettingsDialog } from "@/components/Settings/CompanySettingsDialog";
import { POData, TableField } from "@/types/po";
import { getNextPONumber } from "@/utils/poUtils";
import { Save, ArrowLeft, Settings } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const defaultTableFields: TableField[] = [
  { label: "Beneficiary Name المستفيد", value: "", type: "text" },
  { label: "Amount المبلغ", value: "", type: "text" },
  { label: "Payment Method طريقة الدفع", value: "", type: "text" },
  { label: "Payment Type نوع الدفع", value: "", type: "text" },
  { label: "Time to Deliver وقت التسليم", value: "", type: "text" }
];

const POForm = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Detect edit mode
  const editPO = location.state?.po;
  const editPOId = editPO?.id || null;

  // Form state
  const [poNumber, setPONumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [poLocation, setPOLocation] = useState("MAINTENANCE DEPARTMENT");
  const [locationOptions, setLocationOptions] = useState<{ en: string; ar: string }[]>([]);
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
  setPONumber(getNextPONumber());
  setPOLocation("MAINTENANCE DEPARTMENT");
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

  const handleSave = (type: 'draft' | 'pending') => {
    if (!poNumber.trim()) {
      toast({
        title: language === 'ar' ? 'خطأ في التحقق' : 'Validation Error',
        description: language === 'ar' ? 'رقم أمر الدفع مطلوب' : 'PO Number is required',
        variant: "destructive"
      });
      return;
    }
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
      approvals,
      status: type,
      tags: []
    };
    const savedPOs = JSON.parse(localStorage.getItem('pos') || '[]');
    if (editPOId) {
      // Update existing PO
      const idx = savedPOs.findIndex((p: any) => p.id === editPOId);
      if (idx !== -1) {
        savedPOs[idx] = { ...savedPOs[idx], ...poData, id: editPOId };
        localStorage.setItem('pos', JSON.stringify(savedPOs));
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
    setCompanyNameEn(savedSettings.companyNameEn || "Northern Mountain Contracting Co.");
    setCompanyNameAr(savedSettings.companyNameAr || "شركة الجبل الشمالي للمقاولات");
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

  return (
    <div className="min-h-screen bg-background">
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
              <textarea
                value={purposeArabic}
                onChange={e => setPurposeArabic(e.target.value)}
                style={{ fontSize: '12px', minHeight: '32px', border: '1px solid #888', padding: '4px', background: '#fafafa', width: '100%', resize: 'vertical' }}
                placeholder="ادخل الوصف بالعربية"
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
                <td style={{ border: '1px solid #888', padding: '4px', fontWeight: 'bold' }}>Total Budget<br /><span style={{ fontWeight: 'normal' }}>الميزانية الكلية</span></td>
                <td style={{ border: '1px solid #888', padding: '4px' }}><input type="text" value={totalBudget} onChange={e => setTotalBudget(e.target.value)} style={{ width: '100%', fontSize: '11px', border: '1px solid #888', borderRadius: '3px', padding: '2px' }} /></td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #888', padding: '4px', fontWeight: 'bold' }}>Payment Method<br /><span style={{ fontWeight: 'normal' }}>طريقة الدفع</span></td>
                <td style={{ border: '1px solid #888', padding: '4px' }}><input type="text" value={tableFields[2]?.value || ''} onChange={e => {
                  const newFields = [...tableFields];
                  newFields[2].value = e.target.value;
                  setTableFields(newFields);
                }} style={{ width: '100%', fontSize: '11px', border: '1px solid #888', borderRadius: '3px', padding: '2px' }} /></td>
                <td style={{ border: '1px solid #888', padding: '4px', fontWeight: 'bold' }}>Total Consumed<br /><span style={{ fontWeight: 'normal' }}>الاستهلاك</span></td>
                <td style={{ border: '1px solid #888', padding: '4px' }}><input type="text" value={totalConsumed} onChange={e => setTotalConsumed(e.target.value)} style={{ width: '100%', fontSize: '11px', border: '1px solid #888', borderRadius: '3px', padding: '2px' }} /></td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #888', padding: '4px', fontWeight: 'bold' }}>Bank name<br /><span style={{ fontWeight: 'normal' }}>اسم البنك</span></td>
                <td style={{ border: '1px solid #888', padding: '4px' }}><input type="text" value={tableFields[3]?.value || ''} onChange={e => {
                  const newFields = [...tableFields];
                  newFields[3].value = e.target.value;
                  setTableFields(newFields);
                }} style={{ width: '100%', fontSize: '11px', border: '1px solid #888', borderRadius: '3px', padding: '2px' }} /></td>
                <td style={{ border: '1px solid #888', padding: '4px', fontWeight: 'bold' }}>Applied this time<br /><span style={{ fontWeight: 'normal' }}>المبلغ المطبق</span></td>
                <td style={{ border: '1px solid #888', padding: '4px' }}><input type="text" value={appliedAmount} onChange={e => setAppliedAmount(e.target.value)} style={{ width: '100%', fontSize: '11px', border: '1px solid #888', borderRadius: '3px', padding: '2px' }} /></td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #888', padding: '4px', fontWeight: 'bold' }}>Payment Type<br /><span style={{ fontWeight: 'normal' }}>نوع الدفعات</span></td>
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
                    value={tableFields[5]?.value || date}
                    onChange={e => {
                      const newFields = [...tableFields];
                      if (newFields[5]) {
                        newFields[5].value = e.target.value;
                      } else {
                        newFields[5] = { label: "Time to Deliver وقت التسليم", value: e.target.value, type: "text" };
                      }
                      setTableFields(newFields);
                    }}
                    style={{ fontSize: '11px', border: '1px solid #888', borderRadius: '3px', padding: '2px', width: '100%' }}
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
        </div>
        
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