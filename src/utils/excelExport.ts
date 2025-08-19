
import { POData } from "@/types/po";

export async function exportPOsToExcel(pos: POData[]) {
  const XLSX = await import("xlsx");
  // Only include pending and approved
  const filtered = pos.filter(po => po.status === "pending" || po.status === "approved");
  const data = filtered.map(po => ({
    "PO#NO": po.poNumber,
    "رقم المعاملة": "", // Empty for now
    "Date": po.date,
    "Purpose": po.purposeEnglish,
    "Amount": po.amount,
    "Beneficiary": po.beneficiaryName || po.customFields["Beneficiary Name المستفيد"] || "",
    "Status": po.status === "pending" ? "Pending" : "Approved"
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "PO Report");
  XLSX.writeFile(wb, "PO_Report.xlsx");
}
