import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { POFormHeader } from "@/components/POForm/POFormHeader";
import { PODetailsSection } from "@/components/POForm/PODetailsSection";
import { BilingualInput } from "@/components/POForm/BillingualInput";
import { CustomizableTable } from "@/components/POForm/CustomizableTable";
import { CostCenterTable } from "@/components/POForm/CostCenterTable";
import { ApprovalSection } from "@/components/POForm/ApprovalSection";
import { POFormFooter } from "@/components/POForm/POFormFooter";
import { POData, TableField } from "@/types/po";
import { Save, ArrowLeft } from "lucide-react";

const defaultTableFields: TableField[] = [
  { label: "Beneficiary Name المستفيد", value: "", type: "text" },
  { label: "Amount المبلغ", value: "", type: "text" },
  { label: "Payment Method طريقة الدفع", value: "", type: "text" },
  { label: "Payment Type نوع الدفع", value: "", type: "text" },
  { label: "Time to Deliver وقت التسليم", value: "", type: "text" }
];

const POForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [poNumber, setPONumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState("MAINTENANCE DEPARTMENT");
  const [department, setDepartment] = useState("");
  const [purposeEnglish, setPurposeEnglish] = useState("");
  const [purposeArabic, setPurposeArabic] = useState("");
  
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

  const updateApproval = (role: string, field: string, value: string) => {
    setApprovals(prev => ({
      ...prev,
      [role]: {
        ...prev[role as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    if (!poNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "PO Number is required",
        variant: "destructive"
      });
      return;
    }

    const poData: Partial<POData> = {
      poNumber,
      date,
      location,
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
      status: 'draft',
      tags: []
    };

    // Save to localStorage for now
    const savedPOs = JSON.parse(localStorage.getItem('pos') || '[]');
    const newPO = {
      ...poData,
      id: Date.now().toString(),
    };
    savedPOs.push(newPO);
    localStorage.setItem('pos', JSON.stringify(savedPOs));

    toast({
      title: "Success",
      description: "PO saved successfully",
    });

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <Button 
            onClick={handleSave}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save PO
          </Button>
        </div>

        {/* Main form content */}
        <div className="bg-white rounded-lg shadow-sm border border-form-border p-8">
          <POFormHeader 
            poNumber={poNumber}
            setPONumber={setPONumber}
          />

          <PODetailsSection
            location={location}
            setLocation={setLocation}
            department={department}
            setDepartment={setDepartment}
            date={date}
            setDate={setDate}
          />

          <BilingualInput
            englishValue={purposeEnglish}
            arabicValue={purposeArabic}
            onEnglishChange={setPurposeEnglish}
            onArabicChange={setPurposeArabic}
            label="PURPOSE"
            placeholder="Describe the purpose of this payment order"
          />

          <div className="my-8">
            <CustomizableTable
              fields={tableFields}
              onChange={setTableFields}
            />
          </div>

          <CostCenterTable
            costCenter={costCenter}
            setCostCenter={setCostCenter}
            totalBudget={totalBudget}
            setTotalBudget={setTotalBudget}
            totalConsumed={totalConsumed}
            setTotalConsumed={setTotalConsumed}
            appliedAmount={appliedAmount}
            setAppliedAmount={setAppliedAmount}
            leftOver={leftOver}
            setLeftOver={setLeftOver}
          />

          <ApprovalSection
            approvals={approvals}
            updateApproval={updateApproval}
          />

          <POFormFooter />
        </div>
      </div>
    </div>
  );
};

export default POForm;