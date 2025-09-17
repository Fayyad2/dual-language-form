import { useState, useEffect } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { EmployeesDashboard } from "@/components/Dashboard/EmployeesDashboard"
import { PaymentOrdersSection } from "@/components/Dashboard/PaymentOrdersSection"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AccountType } from "./AccountTypePicker"
import nmcLogo from "@/assets/nmc-logo.png"

interface MainDashboardProps {
  accountType: AccountType;
  currentHR: string;
  currentEngineer: string;
  currentProjectManager: string;
  onSwitchAccount: () => void;
  bypassOtp: boolean;
}

export function MainDashboard({
  accountType,
  currentHR,
  currentEngineer,
  currentProjectManager,
  onSwitchAccount,
  bypassOtp
}: MainDashboardProps) {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false)

  // Load settings/defaults from localStorage
  const [companyLogo, setCompanyLogo] = useState("")
  const [companyNameEn, setCompanyNameEn] = useState("")
  const [companyNameAr, setCompanyNameAr] = useState("")
  const [locationEn, setLocationEn] = useState("")
  const [locationAr, setLocationAr] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [language, setLanguage] = useState("en")
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem("settings") || "{}")
    setCompanyLogo(savedSettings.companyLogo || "")
    setCompanyNameEn(savedSettings.companyNameEn || "Northern Mountains Contracting Co.")
    setCompanyNameAr(savedSettings.companyNameAr || "شركة الجبال الشمالية للمقاولات")
    setLocationEn(savedSettings.locationEn || "Riyadh – KSA")
    setLocationAr(savedSettings.locationAr || "المملكة العربية السعودية – الرياض")
    setPhoneNumber(savedSettings.phoneNumber || "Phone: 011-2397939")
    setLanguage(savedSettings.language || "en")
    setTheme(savedSettings.theme || "light")
  }, [])

  // Apply dark theme to html element
  useEffect(() => {
    const html = document.documentElement
    if (theme === "dark") {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }
  }, [theme])

  const getCurrentUserName = () => {
    switch (accountType) {
      case 'hr': return currentHR
      case 'ceo': return currentEngineer
      case 'project_manager': return currentProjectManager
      case 'finance': return 'Finance'
      default: return 'User'
    }
  }

  const renderMainContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">Dashboard Overview</h2>
              <p className="text-muted-foreground">
                Welcome to your HR management dashboard
              </p>
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-card p-6 rounded-lg border">
                <div className="text-2xl font-bold text-primary">24</div>
                <div className="text-sm text-muted-foreground">Active POs</div>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <div className="text-2xl font-bold text-orange-500">8</div>
                <div className="text-sm text-muted-foreground">Pending Approvals</div>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <div className="text-2xl font-bold text-green-500">156</div>
                <div className="text-sm text-muted-foreground">Completed This Month</div>
              </div>
              <div className="bg-card p-6 rounded-lg border">
                <div className="text-2xl font-bold text-blue-500">6</div>
                <div className="text-sm text-muted-foreground">Active Employees</div>
              </div>
            </div>
            {/* Recent Activity placeholder */}
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span>New PO #1024 created by {currentHR}</span>
                  <span className="text-sm text-muted-foreground">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span>PO #1023 approved by Finance</span>
                  <span className="text-sm text-muted-foreground">4 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span>Employee report generated for {currentEngineer}</span>
                  <span className="text-sm text-muted-foreground">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        )
      case "employees":
        return <EmployeesDashboard />
      case "payment-orders":
        return (
          <PaymentOrdersSection
            accountType={accountType}
            currentHR={currentHR}
            currentEngineer={currentEngineer}
            currentProjectManager={currentProjectManager}
            language={language}
          />
        )
      case "reports":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">Reports & Analytics</h2>
              <p className="text-muted-foreground">
                Generate and view reports
              </p>
            </div>
            <div className="bg-card p-12 text-center rounded-lg border">
              <h3 className="text-xl font-semibold text-muted-foreground">Reports Coming Soon</h3>
              <p className="text-muted-foreground mt-2">
                Advanced reporting features will be available here
              </p>
            </div>
          </div>
        )
      case "calendar":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">Calendar</h2>
              <p className="text-muted-foreground">
                Schedule and manage events
              </p>
            </div>
            <div className="bg-card p-12 text-center rounded-lg border">
              <h3 className="text-xl font-semibold text-muted-foreground">Calendar Coming Soon</h3>
              <p className="text-muted-foreground mt-2">
                Calendar integration will be available here
              </p>
            </div>
          </div>
        )
      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">Settings</h2>
              <p className="text-muted-foreground">
                Manage system settings and preferences
              </p>
            </div>
            <div className="bg-card p-12 text-center rounded-lg border">
              <h3 className="text-xl font-semibold text-muted-foreground">Settings Coming Soon</h3>
              <p className="text-muted-foreground mt-2">
                Settings panel will be available here
              </p>
            </div>
          </div>
        )
      default:
        return <div>Section not found</div>
    }
  }

  return (
    <div className="min-h-screen bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          
          <main className="flex-1 flex flex-col">
            {/* Header */}
            <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
              <div className="flex items-center justify-between h-full px-6">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <div className="flex items-center gap-3">
                    <img 
                      src={companyLogo || nmcLogo} 
                      alt="Company Logo" 
                      className="h-8 w-auto"
                    />
                    <div>
                      <h1 className="text-lg font-semibold">
                        {language === "ar" ? companyNameAr : companyNameEn}
                      </h1>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* User info with switch account */}
                  <button
                    className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                    onClick={() => setSwitchDialogOpen(true)}
                  >
                    <User className="h-4 w-4" />
                    <span className="font-medium">{getCurrentUserName()}</span>
                  </button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 p-6">
              {renderMainContent()}
            </div>
          </main>
        </div>

        {/* Switch Account Dialog */}
        <Dialog open={switchDialogOpen} onOpenChange={setSwitchDialogOpen}>
          <DialogContent className="max-w-xs w-full">
            <DialogHeader>
              <DialogTitle>Switch Account</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSwitchDialogOpen(false)
                  onSwitchAccount()
                }}
              >
                Switch Account Type
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarProvider>
    </div>
  )
}