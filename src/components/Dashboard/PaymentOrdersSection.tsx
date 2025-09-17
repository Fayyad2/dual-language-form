import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Plus, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { POCard } from "@/components/POManagement/POCard"
import { ApprovalsTable } from "@/components/POManagement/ApprovalsTable"
import { CloseableApprovalsSection } from "@/components/POManagement/CloseableApprovalsSection"
import { POFilters } from "@/components/POManagement/POFilters"
import { POData } from "@/types/po"
import { fetchAllPOsFromSupabase, deletePOFromSupabase, updatePOInSupabase } from '@/utils/poSupabase'
import { exportPOsToExcel } from "@/utils/excelExport"
import { AccountType } from "@/pages/AccountTypePicker"

interface PaymentOrdersSectionProps {
  accountType: AccountType;
  currentHR: string;
  currentEngineer: string;
  currentProjectManager: string;
  language: string;
}

export function PaymentOrdersSection({ 
  accountType, 
  currentHR, 
  currentEngineer, 
  currentProjectManager, 
  language 
}: PaymentOrdersSectionProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [pos, setPOs] = useState<POData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [approvalLoading, setApprovalLoading] = useState<string | null>(null)

  // Load POs from Supabase
  useEffect(() => {
    fetchAllPOsFromSupabase()
      .then(data => {
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
        }))
        setPOs(mapped)
      })
      .catch(() => setPOs([]))
  }, [])

  // Get all available tags
  const availableTags = Array.from(
    new Set(pos.flatMap(po => po.tags || []))
  )

  // Filter POs
  const filteredPOs = pos.filter(po => {
    // Finance can only see POs that are fully approved by all approvers (before finance)
    if (accountType === "finance") {
      const allApproved =
        (po.fayad_approval ?? false) &&
        (po.ayed_approval ?? false) &&
        (po.sultan_approval ?? false) &&
        (po.ekhatib_approval ?? false)
      if (!allApproved || po.status !== "pending") return false
    }
    const matchesSearch = 
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (po.customFields?.["Beneficiary Name المستفيد"] || "")
        .toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.purposeEnglish.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.purposeArabic.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || po.status === statusFilter
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => po.tags?.includes(tag))
    return matchesSearch && matchesStatus && matchesTags
  })

  // Sort by PO number
  const sortedPOs = filteredPOs.sort((a, b) => {
    const aNum = parseInt(a.poNumber) || 0
    const bNum = parseInt(b.poNumber) || 0
    return aNum - bNum
  })

  const handleEdit = (po: POData) => {
    navigate('/po-form', { state: { po } })
  }

  const handleView = (po: POData) => {
    navigate('/po-view', { state: { po } })
  }

  const handleDelete = async (id: string) => {
    try {
      await deletePOFromSupabase(id)
      const updatedPOs = pos.filter(po => po.id !== id)
      setPOs(updatedPOs)
      toast({
        title: "PO Deleted",
        description: "Payment order has been deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete PO from Supabase",
        variant: "destructive",
      })
    }
  }

  // Approve handler for ApprovalsTable
  const handlePOApproval = async (poId: string, approver: string) => {
    setApprovalLoading(poId + approver)
    try {
      const po = pos.find(p => p.id === poId)
      if (!po) { setApprovalLoading(null); return }
      
      const columnMap: Record<string, string> = {
        fayad_approval: "Fayad Approval",
        ayed_approval: "Ayed Approval",
        sultan_approval: "Sultan Approval",
        ekhatib_approval: "E.khatib Approval",
        finance_approval: "Finance Approval"
      }
      const column = columnMap[approver] || approver
      const update: any = {}
      update[column] = true
      
      await updatePOInSupabase(poId, update)
      setPOs(pos => pos.map(p => p.id === poId ? { ...p, [approver]: true } : p))
      setApprovalLoading(null)
      toast({
        title: "Signed successfully",
        description: "Thank you!",
        duration: 3000,
      })
    } catch (e) {
      setApprovalLoading(null)
      toast({ title: "Error", description: "Failed to sign. Please try again.", variant: "destructive" })
    }
  }

  const isFinance = accountType === "finance"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Payment Orders</h2>
          <p className="text-muted-foreground">
            Manage and track payment orders
          </p>
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
            <FileText className="h-4 w-4" />
            {language === "ar" ? "تصدير إلى إكسل" : "Export to Excel"}
          </Button>
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

      {/* Approvals Section for HR/Engineers */}
      {!isFinance && (
        <CloseableApprovalsSection
          pos={sortedPOs.filter(po => 
            po.status === "pending" && 
            ((accountType === "hr" && (!po.fayad_approval || !po.ayed_approval || !po.sultan_approval)) ||
             (accountType === "ceo" && !po.ekhatib_approval) ||
             (accountType === "project_manager" && !po.ekhatib_approval))
          )}
          accountType={accountType}
          currentHR={currentHR}
          currentEngineer={currentEngineer}
          currentProjectManager={currentProjectManager}
          onApprove={handlePOApproval}
        />
      )}

      {/* PO Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedPOs.map((po) => (
          <POCard
            key={po.id}
            po={po}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {sortedPOs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            {language === "ar" ? "لا توجد أوامر دفع" : "No payment orders found"}
          </h3>
          <p className="text-muted-foreground">
            {language === "ar" 
              ? "قم بإنشاء أمر دفع جديد للبدء" 
              : "Create a new payment order to get started"}
          </p>
        </div>
      )}
    </div>
  )
}