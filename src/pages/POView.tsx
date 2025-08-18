import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { POData } from "@/types/po";
import { ArrowLeft, Printer, Edit } from "lucide-react";
import { useRef, useEffect, useState } from "react";

const POView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const po: POData = location.state?.po;
  const printRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState("en");
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem("settings") || "{}");
    setLanguage(savedSettings.language || "en");
  }, []);

  if (!po) {
    return <div className="p-8">No PO data found.</div>;
  }

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const win = window.open('', '', 'height=700,width=900');
      win?.document.write('<html><head><title>Print PO</title></head><body>' + printContents + '</body></html>');
      win?.document.close();
      win?.focus();
      win?.print();
      win?.close();
    }
  };

  const handleEdit = () => {
    navigate('/po-form', { state: { po } });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6" dir={language === "ar" ? "rtl" : "ltr"}>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/")} variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {language === "ar" ? "خروج" : "Leave"}
            </Button>
            <Button onClick={handleEdit} variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              {language === "ar" ? "تعديل" : "Edit"}
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              {language === "ar" ? "طباعة" : "Print"}
            </Button>
          </div>
        </div>
        {/* PO details - read only */}
        <div ref={printRef} className="bg-white border rounded p-6">
          <h2 className="text-2xl font-bold mb-2">PO #{po.poNumber}</h2>
          <div className="mb-2"><strong>Date:</strong> {new Date(po.date).toLocaleDateString()}</div>
          <div className="mb-2"><strong>Location:</strong> {po.location}</div>
          <div className="mb-2"><strong>Status:</strong> {po.status}</div>
          <div className="mb-2"><strong>Beneficiary:</strong> {po.customFields?.["Beneficiary Name المستفيد"]}</div>
          <div className="mb-2"><strong>Amount:</strong> {po.customFields?.["Amount المبلغ"]}</div>
          <div className="mb-2"><strong>Purpose (English):</strong> {po.purposeEnglish}</div>
          <div className="mb-2"><strong>Purpose (Arabic):</strong> {po.purposeArabic}</div>
        </div>
      </div>
    </div>
  );
};

export default POView;
