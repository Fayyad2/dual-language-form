import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApprovalsTableProps {
  pos: any[];
  accountType: string;
  currentHR: string;
  currentEngineer: string;
  onApprove: (poId: string, approver: string) => void;
}

const approvers = [
  { key: "fayad_approval", label: "Fayad Approval", name: "Fayad Adel" },
  { key: "ayed_approval", label: "Ayed Approval", name: "Mohammed Ayed" },
  { key: "sultan_approval", label: "Sultan Approval", name: "Sultan Ibrahim" },
  { key: "ekhatib_approval", label: "E.khatib Approval", name: "E.khatib" },
];

export const ApprovalsTable: React.FC<ApprovalsTableProps> = ({ pos, accountType, currentHR, currentEngineer, onApprove }) => {
  // For each PO, show a row with checkboxes/checkmarks for each approver
  return (
    <div className="overflow-x-auto mt-8">
      <h2 className="text-xl font-bold mb-2">Approvals</h2>
      <table className="min-w-full border text-sm bg-white rounded-lg">
        <thead>
          <tr>
            <th className="border px-2 py-1">PO Number</th>
            <th className="border px-2 py-1">Purpose (Arabic)</th>
            <th className="border px-2 py-1">Amount</th>
            {approvers.map(a => (
              <th key={a.key} className="border px-2 py-1">{a.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pos.map(po => (
            <tr
              key={po.id}
              className="transition-colors hover:bg-blue-50"
            >
              <td className="border px-2 py-1">{po.poNumber}</td>
              <td className="border px-2 py-1">{po.purposeArabic}</td>
              <td className="border px-2 py-1">{po.amount}</td>
              {approvers.map(a => {
                // Only allow the logged-in user to check their own column
                const approved = po[a.key];
                let canApprove = false;
                if (a.key === "fayad_approval" && accountType === "hr" && currentHR === "Fayad Adel") canApprove = true;
                if (a.key === "ayed_approval" && accountType === "hr" && currentHR === "Mohammed Ayed") canApprove = true;
                if (a.key === "sultan_approval" && accountType === "hr" && currentHR === "Sultan Ibrahim") canApprove = true;
                if (a.key === "ekhatib_approval" && accountType === "engineers" && currentEngineer === "E.khatib") canApprove = true;
                return (
                  <td key={a.key} className="border px-2 py-1 text-center">
                    {approved ? (
                      <Check className="inline h-5 w-5 text-green-600" />
                    ) : canApprove ? (
                      <Button size="icon" variant="ghost" onClick={() => onApprove(po.id, a.key)}>
                        <span className="inline-block w-5 h-5 border rounded-full border-gray-400"></span>
                      </Button>
                    ) : (
                      <span className="inline-block w-5 h-5"></span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
