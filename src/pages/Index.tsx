import { useState, useEffect } from "react";
import OTPVerificationPage from "@/components/ui/OTPVerificationPage";
  // Map account types and user names to WhatsApp numbers
  const accountPhoneNumbers: Record<string, string> = {
    finance: "+966536107050",
    "Fayad Adel": "+966508089930",
    "Mohammed Ayed": "+966505940265",
    "Sultan Ibrahim": "+966551647115",
    "E.khatib": "+966543147489",
    "Imad Abdel Halim": "+966556041887",
  };
import "./DashboardBubbles.css";
import AccountTypePicker, { AccountType } from "./AccountTypePicker";
import FinanceApprovalBar from "@/components/POManagement/FinanceApprovalBar";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { POCard } from "@/components/POManagement/POCard";
import { ApprovalsTable } from "@/components/POManagement/ApprovalsTable";
import { CloseableApprovalsSection } from "@/components/POManagement/CloseableApprovalsSection";
import { POFilters } from "@/components/POManagement/POFilters";
import { POData } from "@/types/po";
import { fetchAllPOsFromSupabase, deletePOFromSupabase, updatePOInSupabase } from '@/utils/poSupabase';
import { Plus, FileText, Settings, User } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OptionsTab } from "./OptionsTab";
import nmcLogo from "@/assets/nmc-logo.png";
import { exportPOsToExcel } from "@/utils/excelExport";
import { Loader } from '@/components/ui/loader';

const Index = () => {
  // Account type logic
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem("accountType");
    // Recognize all account types
    if (["hr", "finance", "engineers", "project_management"].includes(saved)) {
      setAccountType(saved as AccountType);
    }
  }, []);
  // OTP modal state
  const [pendingAccountType, setPendingAccountType] = useState<AccountType | null>(null);
  const [pendingUserName, setPendingUserName] = useState<string>("");
  const [showOTPPage, setShowOTPPage] = useState(false);

  const handlePickAccountType = (type: AccountType) => {
    let userName = "";
    if (type === "hr") userName = currentHR;
    else if (type === "engineers") userName = currentEngineer;
    else if (type === "project_management") userName = currentProjectManager;
    else if (type === "finance") userName = "Finance";
    setPendingAccountType(type);
    setPendingUserName(userName);
    setShowOTPPage(true);
  };

  const handleOTPVerified = () => {
    if (pendingAccountType) {
      setAccountType(pendingAccountType);
      localStorage.setItem("accountType", pendingAccountType);
      setPendingAccountType(null);
      setPendingUserName("");
      setShowOTPPage(false);
    }
  };
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [pos, setPOs] = useState<POData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  //today: understand the refunctionality of the PO multi-select features for the cells (the Table PO)
  // Load POs from Supabase
  useEffect(() => {
    fetchAllPOsFromSupabase()
      .then(data => {
        // Map Supabase columns with spaces/caps to internal keys for UI
        const mapped = (data || []).map((item: Record<string, any>) => ({
          id: item.id ?? "",
          poNumber: item.poNumber ?? "",
          date: item.date ?? "",
          location: item.location ?? "",
          purposeEnglish: item.purposeEnglish ?? "",
          purposeArabic: item.purposeArabic ?? "",
          amount: item.amount ?? 0,
          status: item.status ?? "draft",
          tags: item.tags ?? [],
          customFields: item.customFields ?? {},
          meta: item.meta ?? "",
          creator: item.creator ?? "",
          department: item.department ?? "",
          beneficiaryName: item.beneficiaryName ?? "",
          amountWords: item.amountWords ?? "",
          paymentMethod: item.paymentMethod ?? "",
          chequeNumber: item.chequeNumber ?? "",
          chequeDate: item.chequeDate ?? "",
          bankName: item.bankName ?? "",
          iban: item.iban ?? "",
          notes: item.notes ?? "",
          attachments: item.attachments ?? [],
          approvedBy: item.approvedBy ?? "",
          reviewedBy: item.reviewedBy ?? "",
          paymentType: item.paymentType ?? "",
          timeToDeliver: item.timeToDeliver ?? "",
          costCenter: item.costCenter ?? "",
          totalBudget: item.totalBudget ?? 0,
          remainingBudget: item.remainingBudget ?? 0,
          projectName: item.projectName ?? "",
          projectNumber: item.projectNumber ?? "",
          supplierName: item.supplierName ?? "",
          totalConsumed: item.totalConsumed ?? 0,
          appliedAmount: item.appliedAmount ?? 0,
          leftOver: item.leftOver ?? 0,
          fayad_approval: item["Fayad Approval"] ?? false,
          ayed_approval: item["Ayed Approval"] ?? false,
          sultan_approval: item["Sultan Approval"] ?? false,
          ekhatib_approval: item["E.khatib Approval"] ?? false,
          finance_approval: item["Finance Approval"] ?? false,
          transaction_number: item["Transaction number"] ?? "",
        }));
        setPOs(mapped);
      })
      .catch(() => setPOs([]));
  }, []);

  // Get all available tags
  const availableTags = Array.from(
    new Set(pos.flatMap(po => po.tags || []))
  );

  // Filter POs
  const filteredPOs = pos.filter(po => {
    // Finance can only see POs that are fully approved by all approvers (before finance)
    if (accountType === "finance") {
      // All HR/engineer approvals must be true (use correct property names)
      const allApproved =
        (po.fayad_approval ?? false) &&
        (po.ayed_approval ?? false) &&
        (po.sultan_approval ?? false) &&
        (po.ekhatib_approval ?? false);
      if (!allApproved || po.status !== "pending") return false;
    }
    const matchesSearch = 
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (po.customFields?.["Beneficiary Name المستفيد"] || "")
        .toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.purposeEnglish.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.purposeArabic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => po.tags?.includes(tag));
    return matchesSearch && matchesStatus && matchesTags;
  });

  // Sort by PO number
  const sortedPOs = filteredPOs.sort((a, b) => {
    const aNum = parseInt(a.poNumber) || 0;
    const bNum = parseInt(b.poNumber) || 0;
    return aNum - bNum;
  });

  const handleEdit = (po: POData) => {
    navigate('/po-form', { state: { po } });
  };

  const handleView = (po: POData) => {
    navigate('/po-view', { state: { po } });
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePOFromSupabase(id);
      const updatedPOs = pos.filter(po => po.id !== id);
      setPOs(updatedPOs);
      toast({
        title: "PO Deleted",
        description: "Payment order has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete PO from Supabase",
        variant: "destructive",
      });
    }
  };

  // Settings dialog state
  const [openSettings, setOpenSettings] = useState(false);
  // Settings and defaults
  const [companyLogo, setCompanyLogo] = useState("");
  const [companyNameEn, setCompanyNameEn] = useState("");
  const [companyNameAr, setCompanyNameAr] = useState("");
  const [locationEn, setLocationEn] = useState("");
  const [locationAr, setLocationAr] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [defaultPONumber, setDefaultPONumber] = useState("");
  const [defaultDetails, setDefaultDetails] = useState("");
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("light");

  // Apply dark theme to html element
  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [theme]);

  // Load settings/defaults from localStorage
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem("settings") || "{}");
    setCompanyLogo(savedSettings.companyLogo || "");
    setCompanyNameEn(savedSettings.companyNameEn || "Northern Mountains Contracting Co.");
    setCompanyNameAr(savedSettings.companyNameAr || "شركة الجبال الشمالية للمقاولات");
    setLocationEn(savedSettings.locationEn || "Riyadh – KSA");
    setLocationAr(savedSettings.locationAr || "المملكة العربية السعودية – الرياض");
    setPhoneNumber(savedSettings.phoneNumber || "Phone: 011-2397939");
    setDefaultPONumber(savedSettings.defaultPONumber || "");
    setDefaultDetails(savedSettings.defaultDetails || "");
    setLanguage(savedSettings.language || "en");
    setTheme(savedSettings.theme || "light");
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem("settings", JSON.stringify({
      companyLogo,
      companyNameEn,
      companyNameAr,
      locationEn,
      locationAr,
      phoneNumber,
      defaultPONumber,
      defaultDetails,
      language,
      theme,
    }));
    setOpenSettings(false);
    toast({ title: "Settings Saved", description: "Your settings have been updated." });
  };

  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  // HR, Engineers, and Project Management account names
  const hrNames = ["Fayad Adel", "Mohammed Ayed", "Sultan Ibrahim"];
  const engineerNames = ["E.khatib"];
  const projectManagementNames = ["Imad Abdel Halim"];
  const currentHR = localStorage.getItem('hrName') || hrNames[0];
  const currentEngineer = localStorage.getItem('engineerName') || engineerNames[0];
  const currentProjectManager = localStorage.getItem('projectManagerName') || projectManagementNames[0];

  // Always call hooks before any return

  // Render account picker if not selected
  const shouldShowAccountPicker = !accountType;
  // Finance: restrict PO creation, show approve/decline bar
  const isFinance = accountType === "finance";
  // Project Management: same dashboard as engineers
  const isProjectManagement = accountType === "project_management";
  // Approval loading state
  const [approvalLoading, setApprovalLoading] = useState<string | null>(null);
  // Approve handler for ApprovalsTable
  const handlePOApproval = async (poId: string, approver: string) => {
    setApprovalLoading(poId + approver);
    try {
      const po = pos.find(p => p.id === poId);
      if (!po) { setApprovalLoading(null); return; }
      // Map internal key to Supabase column name
      const columnMap: Record<string, string> = {
        fayad_approval: "Fayad Approval",
        ayed_approval: "Ayed Approval",
        sultan_approval: "Sultan Approval",
        ekhatib_approval: "E.khatib Approval",
        finance_approval: "Finance Approval"
      };
      const column = columnMap[approver] || approver;
      const update: any = {};
      update[column] = true;
      console.log('Updating PO:', { id: poId, update });
      await updatePOInSupabase(poId, update);
      setPOs(pos => pos.map(p => p.id === poId ? { ...p, [approver]: true } : p));
      setApprovalLoading(null);
      toast({
        title: "Signed successfully",
        description: "Thank you!",
        duration: 3000,
      });
    } catch (e) {
      setApprovalLoading(null);
      toast({ title: "Error", description: "Failed to sign. Please try again.", variant: "destructive" });
    }
  };
  if (shouldShowAccountPicker || showOTPPage) {
    if (showOTPPage && pendingAccountType) {
      // Get phone number for the pending account
      let phone = "";
      if (pendingAccountType === "finance") phone = accountPhoneNumbers["finance"];
      else if (pendingAccountType === "hr") phone = accountPhoneNumbers[currentHR] || "";
      else if (pendingAccountType === "engineers") phone = accountPhoneNumbers[currentEngineer] || "";
      else if (pendingAccountType === "project_management") phone = accountPhoneNumbers[currentProjectManager] || "";
      return (
        <OTPVerificationPage
          userName={pendingUserName}
          phoneNumber={phone}
          onVerified={handleOTPVerified}
          onCancel={() => { setShowOTPPage(false); setPendingAccountType(null); setPendingUserName(""); }}
        />
      );
    }
    return <AccountTypePicker onPick={handlePickAccountType} />;
  }

  return (
    <div className="min-h-screen bg-background" dir={language === "ar" ? "rtl" : "ltr"} style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Animated blue bubbles background */}
      <div className="dashboard-bg-bubbles">
        <div className="bubble b1"></div>
        <div className="bubble b2"></div>
        <div className="bubble b3"></div>
        <div className="bubble b4"></div>
        <div className="bubble b5"></div>
      </div>
      <div className="max-w-7xl mx-auto p-6" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
  <div className="flex items-center justify-between mb-8 dashboard-header-bg" style={{position:'sticky',top:0,zIndex:10,background:'rgba(255,255,255,0.98)',backdropFilter:'blur(8px)',boxShadow:'0 2px 16px 0 rgba(0,0,32,0.07)',padding:'32px 32px 24px 32px'}}>
          <div className="flex items-center gap-4">
            <img 
              src={companyLogo || nmcLogo} 
              alt="Company Logo" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-3xl font-bold text-corporate-blue">
                HR Payment Orders
              </h1>
              <p className="text-muted-foreground">
                {language === "ar" ? companyNameAr : companyNameEn}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === "ar" ? locationAr : locationEn}
              </p>
              <p className="text-xs text-muted-foreground">{phoneNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isFinance && (
              <Button 
                onClick={() => navigate('/po-form')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {language === "ar" ? "إنشاء أمر دفع جديد" : "New Payment Order"}
              </Button>
            )}
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={async () => await exportPOsToExcel(pos)}
            >
              {language === "ar" ? "تصدير إلى إكسل" : "Export to Excel"}
            </Button>
            {/* User info with pop-up for switching account */}
            <button
              className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              onClick={() => setSwitchDialogOpen(true)}
              style={{ cursor: 'pointer' }}
            >
              <User className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700">
                {accountType === 'hr'
                  ? currentHR
                  : accountType === 'engineers'
                  ? currentEngineer
                  : accountType === 'project_management'
                  ? currentProjectManager
                  : 'Finance'}
              </span>
            </button>
            {/* Switch account dialog */}
            <Dialog open={switchDialogOpen} onOpenChange={setSwitchDialogOpen}>
              <DialogContent className="max-w-xs w-full">
                <DialogHeader>
                  <DialogTitle>Switch Account</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3 mt-2">
                  <Button
                    variant={accountType === 'finance' ? 'default' : 'outline'}
                    onClick={() => {
                      setPendingAccountType('finance');
                      setPendingUserName('Finance');
                      setShowOTPPage(true);
                      setSwitchDialogOpen(false);
                    }}
                  >
                    Finance
                  </Button>
                  <div className="text-xs text-muted-foreground mt-2 mb-1">HR Accounts</div>
                  {hrNames.map(name => (
                    <Button
                      key={name}
                      variant={accountType === 'hr' && currentHR === name ? 'default' : 'outline'}
                      onClick={() => {
                        setPendingAccountType('hr');
                        localStorage.setItem('hrName', name);
                        setPendingUserName(name);
                        setShowOTPPage(true);
                        setSwitchDialogOpen(false);
                      }}
                    >
                      {name}
                    </Button>
                  ))}
                  <div className="text-xs text-muted-foreground mt-2 mb-1">Engineers</div>
                  {engineerNames.map(name => (
                    <Button
                      key={name}
                      variant={accountType === 'engineers' && currentEngineer === name ? 'default' : 'outline'}
                      onClick={() => {
                        setPendingAccountType('engineers');
                        localStorage.setItem('engineerName', name);
                        setPendingUserName(name);
                        setShowOTPPage(true);
                        setSwitchDialogOpen(false);
                      }}
                    >
                      {name}
                    </Button>
                  ))}
                  <div className="text-xs text-muted-foreground mt-2 mb-1">Project Management</div>
                  {projectManagementNames.map(name => (
                    <Button
                      key={name}
                      variant={accountType === 'project_management' && currentProjectManager === name ? 'default' : 'outline'}
                      onClick={() => {
                        setPendingAccountType('project_management');
                        localStorage.setItem('projectManagerName', name);
                        setPendingUserName(name);
                        setShowOTPPage(true);
                        setSwitchDialogOpen(false);
                      }}
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={openSettings} onOpenChange={setOpenSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {language === "ar" ? "الإعدادات" : "Settings"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                  <DialogDescription>
                    Manage your company, PO defaults, and preferences.
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="po-defaults">
                  <TabsList>
                    <TabsTrigger value="po-defaults">PO Defaults</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                    <TabsTrigger value="options">Options</TabsTrigger>
                  </TabsList>
                  <TabsContent value="po-defaults">
                    <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSaveSettings(); }}>
                      <div>
                        <label className="block text-sm font-medium mb-1">{language === "ar" ? "اسم الشركة (إنجليزي)" : "Company Name (EN)"}</label>
                        <input type="text" className="input w-full" value={companyNameEn} onChange={e => setCompanyNameEn(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">{language === "ar" ? "اسم الشركة (عربي)" : "Company Name (AR)"}</label>
                        <input type="text" className="input w-full" value={companyNameAr} onChange={e => setCompanyNameAr(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">{language === "ar" ? "رابط الشعار" : "Logo URL"}</label>
                        <input type="text" className="input w-full" value={companyLogo} onChange={e => setCompanyLogo(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">{language === "ar" ? "العنوان (إنجليزي)" : "Address (EN)"}</label>
                        <input type="text" className="input w-full" value={locationEn} onChange={e => setLocationEn(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">{language === "ar" ? "العنوان (عربي)" : "Address (AR)"}</label>
                        <input type="text" className="input w-full" value={locationAr} onChange={e => setLocationAr(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">{language === "ar" ? "رقم الهاتف" : "Phone Number"}</label>
                        <input type="text" className="input w-full" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">{language === "ar" ? "رقم أمر الدفع الافتراضي" : "Default PO Number"}</label>
                        <input type="text" className="input w-full" value={defaultPONumber} onChange={e => setDefaultPONumber(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">{language === "ar" ? "تفاصيل افتراضية" : "Default Details"}</label>
                        <input type="text" className="input w-full" value={defaultDetails} onChange={e => setDefaultDetails(e.target.value)} />
                      </div>
                      <DialogFooter>
                        <Button type="submit">{language === "ar" ? "حفظ" : "Save"}</Button>
                      </DialogFooter>
                    </form>
                  </TabsContent>
                  <TabsContent value="preferences">
                    <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSaveSettings(); }}>
                      <div>
                        <label className="block text-sm font-medium mb-1">{language === "ar" ? "اللغة" : "Language"}</label>
                        <select className="input w-full" value={language} onChange={e => setLanguage(e.target.value)}>
                          <option value="en">English</option>
                          <option value="ar">العربية</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">{language === "ar" ? "الثيم" : "Theme"}</label>
                        <select className="input w-full" value={theme} onChange={e => setTheme(e.target.value)}>
                          <option value="light">{language === "ar" ? "فاتح" : "Light"}</option>
                          <option value="dark">{language === "ar" ? "داكن" : "Dark"}</option>
                        </select>
                      </div>
                      <DialogFooter>
                        <Button type="submit">{language === "ar" ? "حفظ" : "Save"}</Button>
                      </DialogFooter>
                    </form>
                  </TabsContent>
                  <TabsContent value="options">
                    <OptionsTab />
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-form-border">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-corporate-blue" />
              <div>
                <p className="text-2xl font-bold">{pos.length}</p>
                <p className="text-sm text-muted-foreground">{language === "ar" ? "إجمالي الأوامر" : "Total POs"}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-form-border">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div>
                <p className="text-2xl font-bold">
                  {pos.filter(po => po.status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">{language === "ar" ? "قيد الانتظار" : "Pending"}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-form-border">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <div>
                <p className="text-2xl font-bold">
                  {pos.filter(po => po.status === 'approved').length}
                </p>
                <p className="text-sm text-muted-foreground">{language === "ar" ? "تمت الموافقة" : "Approved"}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-form-border">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-500"></div>
              <div>
                <p className="text-2xl font-bold">
                  {pos.filter(po => po.status === 'draft').length}
                </p>
                <p className="text-sm text-muted-foreground">{language === "ar" ? "مسودات" : "Drafts"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <POFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          availableTags={availableTags}
        />

        {/* PO Grid */}
        <div className="mt-6">
          {sortedPOs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payment Orders Found</h3>
              <p className="text-muted-foreground mb-4">
                {pos.length === 0 
                  ? "Get started by creating your first payment order"
                  : "Try adjusting your search criteria"
                }
              </p>
              {pos.length === 0 && (
                <Button onClick={() => navigate('/po-form')}>
                  Create First PO
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPOs.map(po => (
                <div key={po.id}>
                  <POCard
                    po={po}
                    onEdit={handleEdit}
                    onView={handleView}
                    onDelete={handleDelete}
                  />
                  {/* Finance approval bar for finance users and pending/review POs */}
                  {isFinance && po.status === "pending" && (
                    <FinanceApprovalBar
                      status={po.status}
                      onApprove={async (transactionNumber: string) => {
                        // Approve: set status to 'approved by finance' and save transaction number in meta
                        await fetch('/api/po-approve', { method: 'POST', body: JSON.stringify({ id: po.id, status: 'approved by finance', transactionNumber }) });
                        setPOs(pos => pos.map(p => p.id === po.id ? { ...p, status: 'approved by finance', meta: JSON.stringify({ ...(po.meta ? JSON.parse(po.meta) : {}), transactionNumber }) } : p));
                        toast({ title: 'PO Approved by Finance', description: 'The PO has been approved by finance.' });
                      }}
                      onDecline={async () => {
                        // Decline: set status to 'declined'
                        await fetch('/api/po-approve', { method: 'POST', body: JSON.stringify({ id: po.id, status: 'declined' }) });
                        setPOs(pos => pos.map(p => p.id === po.id ? { ...p, status: 'declined' } : p));
                        toast({ title: 'PO Declined', description: 'The PO has been declined.' });
                      }}
                      onReview={async () => {
                        // Send for review: set status to 'review'
                        await fetch('/api/po-approve', { method: 'POST', body: JSON.stringify({ id: po.id, status: 'review' }) });
                        setPOs(pos => pos.map(p => p.id === po.id ? { ...p, status: 'review' } : p));
                        toast({ title: 'PO Sent for Review', description: 'The PO has been sent back to HR for review.' });
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approvals Table Section (closeable, below PO grid) */}
        <div className="mt-10">
          <CloseableApprovalsSection
            pos={pos}
            accountType={accountType}
            currentHR={currentHR}
            currentEngineer={currentEngineer}
            currentProjectManager={currentProjectManager}
            onApprove={handlePOApproval}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
