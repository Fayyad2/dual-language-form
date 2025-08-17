import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CostCenterTableProps {
  costCenter: string;
  setCostCenter: (value: string) => void;
  totalBudget: string;
  setTotalBudget: (value: string) => void;
  totalConsumed: string;
  setTotalConsumed: (value: string) => void;
  appliedAmount: string;
  setAppliedAmount: (value: string) => void;
  leftOver: string;
  setLeftOver: (value: string) => void;
}

export const CostCenterTable = ({
  costCenter,
  setCostCenter,
  totalBudget,
  setTotalBudget,
  totalConsumed,
  setTotalConsumed,
  appliedAmount,
  setAppliedAmount,
  leftOver,
  setLeftOver
}: CostCenterTableProps) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Cost Center Details</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-table-border">
            <thead>
              <tr className="bg-table-header">
                <th className="border border-table-border px-4 py-2 text-left font-medium">
                  Field (Arabic/English)
                </th>
                <th className="border border-table-border px-4 py-2 text-left font-medium">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-muted/50">
                <td className="border border-table-border px-4 py-3 font-medium">
                  Cost Center مركز التكلفة
                </td>
                <td className="border border-table-border px-4 py-2">
                  <Input
                    value={costCenter}
                    onChange={(e) => setCostCenter(e.target.value)}
                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                    placeholder="Enter cost center"
                  />
                </td>
              </tr>
              
              <tr className="hover:bg-muted/50">
                <td className="border border-table-border px-4 py-3 font-medium">
                  Total Budget الميزانية الكلية
                </td>
                <td className="border border-table-border px-4 py-2">
                  <Input
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                    placeholder="Enter total budget"
                  />
                </td>
              </tr>
              
              <tr className="hover:bg-muted/50">
                <td className="border border-table-border px-4 py-3 font-medium">
                  Total Consumed الاستهلاك
                </td>
                <td className="border border-table-border px-4 py-2">
                  <Input
                    value={totalConsumed}
                    onChange={(e) => setTotalConsumed(e.target.value)}
                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                    placeholder="Enter total consumed"
                  />
                </td>
              </tr>
              
              <tr className="hover:bg-muted/50">
                <td className="border border-table-border px-4 py-3 font-medium">
                  Applied this time المبلغ المطبق
                </td>
                <td className="border border-table-border px-4 py-2">
                  <Input
                    value={appliedAmount}
                    onChange={(e) => setAppliedAmount(e.target.value)}
                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                    placeholder="Enter applied amount"
                  />
                </td>
              </tr>
              
              <tr className="hover:bg-muted/50">
                <td className="border border-table-border px-4 py-3 font-medium">
                  Left Over المتبقي
                </td>
                <td className="border border-table-border px-4 py-2">
                  <Input
                    value={leftOver}
                    onChange={(e) => setLeftOver(e.target.value)}
                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                    placeholder="Enter left over amount"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};