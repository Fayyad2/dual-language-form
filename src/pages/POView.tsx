import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { POData } from "@/types/po";
import { ArrowLeft, Printer, Edit } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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

  // Parse attachments from meta
  let attachments: string[] = [];
  try {
    if (po.meta) {
      const meta = typeof po.meta === 'string' ? JSON.parse(po.meta) : po.meta;
      attachments = meta.attachments || [];
    }
  } catch (e) {
    attachments = [];
  }

  // Popup state for preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | 'other' | null>(null);

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
        {/* Attachments Section */}
        {attachments.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2">Attachments</h3>
            <div className="flex flex-wrap gap-4">
              {attachments.map((url, idx) => {
                const ext = url.split('.').pop()?.toLowerCase();
                const isImage = /(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(ext || '');
                const isPDF = ext === 'pdf';
                return (
                  <div key={idx} style={{ textAlign: 'center', background: '#fff', border: '1px solid #ddd', borderRadius: 6, padding: 8, minWidth: 120, position: 'relative', boxShadow: '0 1px 4px #0001', cursor: 'pointer' }}
                    onClick={() => {
                      setPreviewUrl(url);
                      setPreviewType(isImage ? 'image' : isPDF ? 'pdf' : 'other');
                    }}
                  >
                    {isImage ? (
                      <img src={url} alt={`Attachment ${idx + 1}`} style={{ maxWidth: 100, maxHeight: 100, border: '1px solid #ccc', borderRadius: 4 }} />
                    ) : isPDF ? (
                      <span style={{ fontSize: 32, display: 'block' }}>📄<br />PDF</span>
                    ) : (
                      <span style={{ fontSize: 32, display: 'block' }}>📎<br />File</span>
                    )}
                    <div style={{ fontSize: 11, marginTop: 4, wordBreak: 'break-all' }}>{url.split('/').pop()}</div>
                  </div>
                );
              })}
            </div>
            {/* Preview Dialog */}
            <Dialog open={!!previewUrl} onOpenChange={open => { if (!open) setPreviewUrl(null); }}>
              <DialogContent style={{ maxWidth: 900, minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {previewType === 'image' && previewUrl && (
                  <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8 }} />
                )}
                {previewType === 'pdf' && previewUrl && (
                  <object data={previewUrl} type="application/pdf" width="100%" height="600px">
                    <a href={previewUrl} target="_blank" rel="noopener noreferrer">Open PDF</a>
                  </object>
                )}
                {previewType === 'other' && previewUrl && (
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 20 }}>Download File</a>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}
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
