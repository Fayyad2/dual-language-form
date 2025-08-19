import React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";



interface PrintAttachmentsButtonProps {
  attachments: File[];
  attachmentURLs: string[];
}


export const PrintAttachmentsButton: React.FC<PrintAttachmentsButtonProps> = ({ attachments, attachmentURLs }) => {
  const handlePrintAttachments = () => {
    if (!attachments.length) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Prepare data for the new window
    const filesData = attachments.map((file, idx) => ({
      name: file.name,
      type: file.type,
      url: attachmentURLs[idx],
    }));

    // HTML and script for the new window
    printWindow.document.write(`
      <html>
      <head>
        <title>Combined Attachments PDF</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
        <style>
          body { background: #f9f9f9; color: #222; font-family: sans-serif; text-align: center; }
          #print-btn { margin: 32px auto; padding: 12px 32px; font-size: 18px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
          #status { margin: 24px; font-size: 18px; color: #2563eb; }
        </style>
      </head>
      <body>
        <div id="status">Preparing combined PDF...</div>
        <button id="print-btn" style="display:none">Print Combined PDF</button>
        <iframe id="pdf-frame" style="width:90vw;height:90vh;display:none;border:1px solid #ccc;"></iframe>
        <script>
        const files = ${JSON.stringify(filesData)};
        const { jsPDF } = window.jspdf;
        async function fetchAsDataURL(url) {
          const res = await fetch(url);
          const blob = await res.blob();
          return new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        }
        async function addPdfToDoc(doc, url) {
          // Use PDF.js to get each page as image and add to jsPDF
          const pdf = await window['pdfjsLib'].getDocument(url).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            if (doc.getNumberOfPages() > 0) doc.addPage();
            doc.addImage(imgData, 'JPEG', 10, 10, 190, 277); // fit to A4
          }
        }
        async function addImageToDoc(doc, dataUrl) {
          if (doc.getNumberOfPages() > 0) doc.addPage();
          doc.addImage(dataUrl, 'JPEG', 10, 10, 190, 277);
        }
        async function combineAndShow() {
          const doc = new jsPDF({ unit: 'mm', format: 'a4' });
          let first = true;
          for (const file of files) {
            if (!first) doc.addPage();
            first = false;
            if (file.type.startsWith('image/')) {
              const dataUrl = await fetchAsDataURL(file.url);
              await addImageToDoc(doc, dataUrl);
            } else if (file.type === 'application/pdf') {
              await addPdfToDoc(doc, file.url);
            }
          }
          // Show PDF in iframe
          const pdfBlob = doc.output('blob');
          const pdfUrl = URL.createObjectURL(pdfBlob);
          document.getElementById('pdf-frame').src = pdfUrl;
          document.getElementById('pdf-frame').style.display = 'block';
          document.getElementById('print-btn').style.display = 'inline-block';
          document.getElementById('status').innerText = 'Ready to print!';
          document.getElementById('print-btn').onclick = () => {
            const iframe = document.getElementById('pdf-frame');
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          };
        }
        window.onload = combineAndShow;
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  };

  return (
    <Button onClick={handlePrintAttachments} variant="outline" className="flex items-center gap-2" style={{ marginLeft: 8 }}>
      <Printer className="h-4 w-4" />
      Print Attachments Only
    </Button>
  );
};
