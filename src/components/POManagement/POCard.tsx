import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { POData } from "@/types/po";
import { Edit, Eye, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface POCardProps {
  po: POData;
  onEdit: (po: POData) => void;
  onView: (po: POData) => void;
  onDelete: (id: string) => void;
}

export const POCard = ({ po, onEdit, onView, onDelete }: POCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const [language, setLanguage] = useState("en");
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem("settings") || "{}");
    setLanguage(savedSettings.language || "en");
  }, []);
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-corporate-blue">
            {language === "ar" ? `أمر دفع رقم ${po.poNumber}` : `PO #${po.poNumber}`}
          </CardTitle>
          <Badge className={`${getStatusColor(po.status)} border-0`}>
            {language === "ar" ?
              (po.status === "draft" ? "مسودة" :
                po.status === "pending" ? "قيد الانتظار" :
                po.status === "approved" ? "تمت الموافقة" :
                po.status === "completed" ? "مكتمل" : po.status)
              : (po.status || '').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          <p><span className="font-medium">{language === "ar" ? "التاريخ:" : "Date:"}</span> {new Date(po.date).toLocaleDateString()}</p>
          <p><span className="font-medium">{language === "ar" ? "الموقع:" : "Location:"}</span> {po.location}</p>
          <p><span className="font-medium">{language === "ar" ? "بواسطة:" : "by:"}</span> {po.creator || '-'}</p>
          {po.customFields?.["Beneficiary Name المستفيد"] && (
            <p><span className="font-medium">{language === "ar" ? "المستفيد:" : "Beneficiary:"}</span> {po.customFields["Beneficiary Name المستفيد"]}</p>
          )}
          {po.customFields?.["Amount المبلغ"] && (
            <p><span className="font-medium">{language === "ar" ? "المبلغ:" : "Amount:"}</span> {po.customFields["Amount المبلغ"]}</p>
          )}
        </div>
        {po.tags && po.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {po.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(po)}
            className="flex items-center gap-1"
          >
            <Eye className="h-3 w-3" />
            {language === "ar" ? "عرض" : "View"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(po)}
            className="flex items-center gap-1"
          >
            <Edit className="h-3 w-3" />
            {language === "ar" ? "تعديل" : "Edit"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(po.id)}
            className="flex items-center gap-1 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
            {language === "ar" ? "حذف" : "Delete"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};