import { useState, useEffect } from "react";
import OTPVerificationPage from "@/components/ui/OTPVerificationPage";
import AccountTypePicker, { AccountType } from "./AccountTypePicker";
import { MainDashboard } from "./MainDashboard";

// Map account types and user names to WhatsApp numbers
const accountPhoneNumbers: Record<string, string> = {
  finance: "+966536107050",
  "Fayad Adel": "+966508089930",
  "Mohammed Ayed": "+966505940265",
  "Sultan Ibrahim": "+966551647115",
  "E.khatib": "+966543147489",
  "Imad Abdel Halim": "+966556041887",
};

const Index = () => {
  // OTP bypass toggle
  const [bypassOtp, setBypassOtp] = useState<boolean>(false);
  // Account type logic
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  
  useEffect(() => {
    const saved = localStorage.getItem("accountType");
    if (["hr", "finance", "ceo", "project_manager", "engineers", "project_management"].includes(saved || "")) {
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
    else if (type === "ceo") userName = currentEngineer;
    else if (type === "project_manager") userName = currentProjectManager;
    else if (type === "finance") userName = "Finance";
    
    if (bypassOtp) {
      setAccountType(type);
      localStorage.setItem("accountType", type);
      setPendingAccountType(null);
      setPendingUserName("");
      setShowOTPPage(false);
    } else {
      setPendingAccountType(type);
      setPendingUserName(userName);
      setShowOTPPage(true);
    }
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

  // HR, Engineers, and Project Management account names
  const hrNames = ["Fayad Adel", "Mohammed Ayed", "Sultan Ibrahim"];
  const engineerNames = ["E.khatib"];
  const projectManagementNames = ["Imad Abdel Halim"];
  const currentHR = localStorage.getItem('hrName') || hrNames[0];
  const currentEngineer = localStorage.getItem('engineerName') || engineerNames[0];
  const currentProjectManager = localStorage.getItem('projectManagerName') || projectManagementNames[0];

  // Render account picker if not selected
  const shouldShowAccountPicker = !accountType;

  return (
    <div>
      {/* Show OTP verification if needed */}
      {showOTPPage && pendingAccountType ? (
        (() => {
          // Get phone number for the pending account
          let phone = "";
          if (pendingAccountType === "finance") phone = accountPhoneNumbers["finance"];
          else if (pendingAccountType === "hr") phone = accountPhoneNumbers[currentHR] || "";
          else if (pendingAccountType === "ceo") phone = accountPhoneNumbers[currentEngineer] || "";
          else if (pendingAccountType === "project_manager") phone = accountPhoneNumbers[currentProjectManager] || "";
          
          return (
            <OTPVerificationPage
              userName={pendingUserName}
              phoneNumber={phone}
              onVerified={handleOTPVerified}
              onCancel={() => { setShowOTPPage(false); setPendingAccountType(null); setPendingUserName(""); }}
            />
          );
        })()
      ) : shouldShowAccountPicker ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <label style={{ marginRight: 8 }}>
              <input
                type="checkbox"
                checked={bypassOtp}
                onChange={e => setBypassOtp(e.target.checked)}
                style={{ marginRight: 4 }}
              />
              Bypass OTP (dev mode)
            </label>
          </div>
          <AccountTypePicker onPick={handlePickAccountType} />
        </div>
      ) : (
        <MainDashboard
          accountType={accountType!}
          currentHR={currentHR}
          currentEngineer={currentEngineer}
          currentProjectManager={currentProjectManager}
          onSwitchAccount={() => {
            setAccountType(null);
            localStorage.removeItem("accountType");
          }}
          bypassOtp={bypassOtp}
        />
      )}
    </div>
  );
};

export default Index;