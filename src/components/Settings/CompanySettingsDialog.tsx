import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

  // Location options state
  const [locationOptions, setLocationOptions] = useState<string[]>(settings.locationOptions || [
    "MAINTENANCE DEPARTMENT",
    "PROJECTS DEPARTMENT",
    "HR DEPARTMENT",
    "FINANCE DEPARTMENT",
    "OTHER"
  ]);
  const [newOption, setNewOption] = useState("");

  const handleAddOption = () => {
    if (newOption.trim() && !locationOptions.includes(newOption.trim())) {
      setLocationOptions([...locationOptions, newOption.trim()]);
      setNewOption("");
    }
  };
  const handleDeleteOption = (opt: string) => {
    setLocationOptions(locationOptions.filter(o => o !== opt));
  };

  // Save location options to settings
  const handleSaveAll = () => {
    saveCompanySettings({ ...settings, locationOptions });
    onSettingsChange();
    onOpenChange(false);
    toast({
      title: "Settings Saved",
      description: "Company settings have been updated successfully."
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Company Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="w-full flex">
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>
          <TabsContent value="company">
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
          </TabsContent>
          <TabsContent value="options">
            <div className="space-y-4">
              <Label>Location Options</Label>
              <div className="flex gap-2 mb-2">
                <Input value={newOption} onChange={e => setNewOption(e.target.value)} placeholder="Add new location option" />
                <Button onClick={handleAddOption}>Add</Button>
              </div>
              <ul className="space-y-2">
                {locationOptions.map(opt => (
                  <li key={opt} className="flex items-center justify-between border rounded px-2 py-1">
                    <span>{opt}</span>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteOption(opt)}>Delete</Button>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveAll}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};