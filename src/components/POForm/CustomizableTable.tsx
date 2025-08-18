import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import { TableField } from "@/types/po";

interface CustomizableTableProps {
  fields: TableField[];
  onChange: (fields: TableField[]) => void;
}

const defaultFields: TableField[] = [
  { label: "Beneficiary Name المستفيد", value: "", type: "text" },
  { label: "Amount المبلغ", value: "", type: "text" },
  { label: "Payment Method طريقة الدفع", value: "", type: "text" },
  { label: "Payment Type نوع الدفع", value: "", type: "text" },
  { label: "Time to Deliver وقت التسليم", value: "", type: "text" }
];

export const CustomizableTable = ({ fields, onChange }: CustomizableTableProps) => {
  const [isCustomMode, setIsCustomMode] = useState(false);

  const addField = () => {
    const newField: TableField = {
      label: "New Field",
      value: "",
      type: "text"
    };
    onChange([...fields, newField]);
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    onChange(newFields);
  };

  const updateField = (index: number, updates: Partial<TableField>) => {
    const newFields = fields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    );
    onChange(newFields);
  };

  const resetToDefault = () => {
    onChange(defaultFields);
    setIsCustomMode(false);
  };

  const enableCustomMode = () => {
    setIsCustomMode(true);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">NMC Details Table</CardTitle>
          <div className="flex gap-2 print:hidden">
            {!isCustomMode && (
              <Button 
                onClick={enableCustomMode}
                variant="outline" 
                size="sm"
              >
                Customize Table
              </Button>
            )}
            {isCustomMode && (
              <>
                <Button 
                  onClick={addField}
                  variant="outline" 
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Field
                </Button>
                <Button 
                  onClick={resetToDefault}
                  variant="outline" 
                  size="sm"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset Default
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="compact-table w-full border-collapse border border-table-border">
            <thead>
              <tr className="bg-table-header">
                <th className="border border-table-border px-4 py-2 text-left font-medium">
                  Field
                </th>
                <th className="border border-table-border px-4 py-2 text-left font-medium">
                  Value
                </th>
                {isCustomMode && (
                  <th className="border border-table-border px-4 py-2 text-left font-medium w-20 print:hidden">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={index} className="hover:bg-muted/50">
                  <td className="border border-table-border px-4 py-2">
                    {isCustomMode ? (
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                      />
                    ) : (
                      <span className="font-medium">{field.label}</span>
                    )}
                  </td>
                  <td className="border border-table-border px-4 py-2">
                    <Input
                      value={field.value}
                      onChange={(e) => updateField(index, { value: e.target.value })}
                      className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                      placeholder="Enter value"
                    />
                  </td>
                  {isCustomMode && (
                    <td className="border border-table-border px-4 py-2 print:hidden">
                      <Button
                        onClick={() => removeField(index)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};