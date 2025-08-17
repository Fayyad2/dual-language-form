import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintButtonProps {
  onClick: () => void;
}

export const PrintButton = ({ onClick }: PrintButtonProps) => {
  return (
    <Button 
      onClick={onClick}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Printer className="h-4 w-4" />
      Print PO
    </Button>
  );
};