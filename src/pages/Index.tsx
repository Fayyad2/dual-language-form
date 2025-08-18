import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { POCard } from "@/components/POManagement/POCard";
import { POFilters } from "@/components/POManagement/POFilters";
import { POData } from "@/types/po";
import { Plus, FileText, Settings } from "lucide-react";
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

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [pos, setPOs] = useState<POData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Load POs from localStorage
  useEffect(() => {
    const savedPOs = JSON.parse(localStorage.getItem('pos') || '[]');
    setPOs(savedPOs);
  }, []);

  // Get all available tags
  const availableTags = Array.from(
    new Set(pos.flatMap(po => po.tags || []))
  );

  // Filter POs
  const filteredPOs = pos.filter(po => {
    const matchesSearch = 
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (po.customFields?.["Beneficiary Name المستفيد"] || "")
        .toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.purposeEnglish.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.purposeArabic.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => po.tags?.includes(tag));
    
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

  const handleDelete = (id: string) => {
    const updatedPOs = pos.filter(po => po.id !== id);
    setPOs(updatedPOs);
    localStorage.setItem('pos', JSON.stringify(updatedPOs));
    
    toast({
      title: "PO Deleted",
      description: "Payment order has been deleted successfully",
    });
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

  // Load settings/defaults from localStorage
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem("settings") || "{}");
    setCompanyLogo(savedSettings.companyLogo || "");
    setCompanyNameEn(savedSettings.companyNameEn || "Northern Mountain Contracting Co.");
    setCompanyNameAr(savedSettings.companyNameAr || "شركة الجبل الشمالي للمقاولات");
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

  return (
    <div className="min-h-screen bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
            <Button 
              onClick={() => navigate('/po-form')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {language === "ar" ? "إنشاء أمر دفع جديد" : "New Payment Order"}
            </Button>
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
                    {/* ...existing PO Defaults form... */}
                    <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSaveSettings(); }}>
                      {/* ...existing code... */}
                    </form>
                  </TabsContent>
                  <TabsContent value="preferences">
                    {/* ...existing Preferences form... */}
                    <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSaveSettings(); }}>
                      {/* ...existing code... */}
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
                <POCard
                  key={po.id}
                  po={po}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
