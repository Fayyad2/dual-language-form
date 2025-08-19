
import { POData } from "@/types/po";

export async function exportPOsToExcel(pos: POData[]) {
  const XLSX = await import("xlsx");
  // For finance, export all visible POs (already filtered in dashboard)
  const data = pos.map(po => {
    let transactionNumber = "";
    if (po.meta) {
      try {
        const meta = JSON.parse(po.meta);
        if (meta.transactionNumber) transactionNumber = meta.transactionNumber;
      } catch {}
    }
    return {
      "PO#NO": po.poNumber,
      "رقم المعاملة": transactionNumber,
      "Date": po.date,
      "Purpose": po.purposeEnglish,
      "Amount": po.amount,
      "Beneficiary": po.beneficiaryName || (po.customFields && po.customFields["Beneficiary Name المستفيد"]) || "",
      "Status": po.status
    };
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "PO Report");
  XLSX.writeFile(wb, "PO_Report.xlsx");
}
