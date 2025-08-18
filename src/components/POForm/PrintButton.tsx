import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";

  interface PrintButtonProps {
    printRef?: React.RefObject<HTMLDivElement>;
    onClick?: () => void;
  }
  
  export const PrintButton: React.FC<PrintButtonProps> = ({ printRef, onClick }) => {
    const handlePrint = useReactToPrint({
      contentRef: printRef,
  documentTitle: "PO Form",
    });
  
    return (
      <Button 
        onClick={printRef ? handlePrint : onClick}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        Print PO
      </Button>
    );
  };