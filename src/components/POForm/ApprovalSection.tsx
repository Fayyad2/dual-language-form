import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ApprovalSectionProps {
  approvals: {
    hrOfficer: { signed: boolean; signature?: string; comments?: string };
    projectsManager: { signed: boolean; signature?: string; comments?: string };
    managingDirector: { signed: boolean; signature?: string; comments?: string };
    financeManagement: { signed: boolean; signature?: string; comments?: string };
  };
  updateApproval: (role: string, field: string, value: string) => void;
}

export const ApprovalSection = ({ approvals, updateApproval }: ApprovalSectionProps) => {
  const approvalRoles = [
    { key: 'hrOfficer', label: 'HR Officer موظف الموارد البشرية' },
    { key: 'projectsManager', label: 'Projects Manager مدير المشاريع' },
    { key: 'managingDirector', label: 'Managing Director المدير العام' },
    { key: 'financeManagement', label: 'Finance Management الإدارة المالية' }
  ];

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Approvals</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="approval-table compact-table w-full border-collapse border border-table-border">
            <thead>
              <tr className="bg-table-header">
                <th className="border border-table-border px-4 py-2 text-left font-medium">
                  Position
                </th>
                <th className="border border-table-border px-4 py-2 text-left font-medium">
                  Signature
                </th>
                <th className="border border-table-border px-4 py-2 text-left font-medium">
                  Comments
                </th>
              </tr>
            </thead>
            <tbody>
              {approvalRoles.map(({ key, label }) => (
                <tr key={key} className="hover:bg-muted/50">
                  <td className="border border-table-border px-4 py-3 font-medium">
                    {label}
                  </td>
                  <td className="border border-table-border px-4 py-2">
                    <Input
                      value={approvals[key as keyof typeof approvals]?.signature || ''}
                      onChange={(e) => updateApproval(key, 'signature', e.target.value)}
                      className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                      placeholder="Digital signature or name"
                    />
                  </td>
                  <td className="border border-table-border px-4 py-2">
                    <Textarea
                      value={approvals[key as keyof typeof approvals]?.comments || ''}
                      onChange={(e) => updateApproval(key, 'comments', e.target.value)}
                      className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 min-h-[60px] resize-none"
                      placeholder="Comments"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};