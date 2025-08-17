import nmcLogo from "@/assets/nmc-logo.png";

interface POFormHeaderProps {
  poNumber: string;
  setPONumber: (value: string) => void;
}

export const POFormHeader = ({ poNumber, setPONumber }: POFormHeaderProps) => {
  return (
    <div className="border-b border-form-border pb-6 mb-6">
      {/* Top Section */}
      <div className="flex justify-between items-start mb-6">
        {/* Left Side - Company Info */}
        <div className="text-right" dir="rtl">
          <h2 className="text-lg font-bold text-corporate-blue mb-2">
            شركة الجبل الشمالي للمقاولات
          </h2>
          <h3 className="text-base font-semibold text-foreground mb-2">
            Northern Mountain Contracting Co.
          </h3>
          <div className="text-sm text-corporate-gray space-y-1">
            <p>المملكة العربية السعودية – الرياض</p>
            <p>Riyadh – KSA</p>
            <p>Phone: 011-2397939</p>
          </div>
        </div>

        {/* Right Side - Logo and Title */}
        <div className="text-center">
          <img 
            src={nmcLogo} 
            alt="Northern Mountain Contracting Logo" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-xl font-bold text-form-header mb-2">
            HR PAYMENT ORDER
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">PO:</span>
            <input
              type="text"
              value={poNumber}
              onChange={(e) => setPONumber(e.target.value)}
              className="border border-form-border rounded px-2 py-1 text-sm w-32 text-center"
              placeholder="Enter PO#"
            />
          </div>
        </div>
      </div>
    </div>
  );
};