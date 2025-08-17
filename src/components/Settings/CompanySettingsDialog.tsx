import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompanySettings, getCompanySettings, saveCompanySettings } from "@/utils/poUtils";
import { useToast } from "@/hooks/use-toast";

interface CompanySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettingsChange: () => void;
}

export const CompanySettingsDialog = ({ 
  open, 
  onOpenChange,
  onSettingsChange 
}: CompanySettingsDialogProps) => {
  const [settings, setSettings] = useState<CompanySettings>(getCompanySettings());
  const { toast } = useToast();

  const handleSave = () => {
    saveCompanySettings(settings);
    onSettingsChange();
    onOpenChange(false);
    toast({
      title: "Settings Saved",
      description: "Company settings have been updated successfully."
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSettings(prev => ({ ...prev, logoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Company Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="companyNameEn">Company Name (English)</Label>
            <Input
              id="companyNameEn"
              value={settings.companyNameEn}
              onChange={(e) => setSettings(prev => ({ ...prev, companyNameEn: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="companyNameAr">Company Name (Arabic)</Label>
            <Input
              id="companyNameAr"
              value={settings.companyNameAr}
              onChange={(e) => setSettings(prev => ({ ...prev, companyNameAr: e.target.value }))}
              dir="rtl"
            />
          </div>
          
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={settings.address}
              onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={settings.phone}
              onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="logo">Company Logo</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="mt-1"
            />
            {settings.logoUrl && (
              <div className="mt-2">
                <img 
                  src={settings.logoUrl} 
                  alt="Company logo preview" 
                  className="h-16 w-auto border rounded"
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};