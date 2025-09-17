import React from "react";
import { ApprovalsTable } from "./ApprovalsTable";
import { ChevronRight } from "lucide-react";

interface CloseableApprovalsSectionProps {
  pos: any[];
  accountType: string;
  currentHR: string;
  currentEngineer: string;
  currentProjectManager?: string;
  onApprove: (poId: string, approver: string) => void;
}

export function CloseableApprovalsSection({ pos, accountType, currentHR, currentEngineer, currentProjectManager, onApprove }: CloseableApprovalsSectionProps) {
  const [open, setOpen] = React.useState(true);
  const [search, setSearch] = React.useState("");

  // Filter POs by number or purpose (Arabic or English)
  const filteredPOs = pos.filter(po => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return (
      (po.poNumber || "").toLowerCase().includes(s) ||
      (po.purposeArabic || "").toLowerCase().includes(s) ||
      (po.purposeEnglish || "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="bg-white rounded-lg border border-form-border shadow">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <button
            className="transition-transform duration-300 focus:outline-none"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Collapse Approvals' : 'Expand Approvals'}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <ChevronRight
              className={`h-5 w-5 text-blue-600 transition-transform duration-300 ${open ? 'rotate-90' : ''}`}
            />
          </button>
          <h2 className="text-lg font-bold">Approvals</h2>
        </div>
        <input
          type="text"
          className="input border px-2 py-1 rounded text-sm w-48 focus:outline-none focus:ring focus:border-blue-400 transition"
          placeholder="Search by number or purpose..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div
        style={{
          overflow: 'hidden',
          transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',
          maxHeight: open ? 1000 : 0,
        }}
      >
        {open && (
          <div className="p-2">
            <ApprovalsTable
              pos={filteredPOs}
              accountType={accountType}
              currentHR={currentHR}
              currentEngineer={currentEngineer}
              onApprove={onApprove}
            />
          </div>
        )}
      </div>
    </div>
  );
}
