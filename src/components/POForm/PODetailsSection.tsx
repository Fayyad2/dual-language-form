import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PODetailsSectionProps {
  location: string;
  setLocation: (value: string) => void;
  department: string;
  setDepartment: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
}

export const PODetailsSection = ({
  location,
  setLocation,
  department,
  setDepartment,
  date,
  setDate
}: PODetailsSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Location and Department */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="location" className="text-sm font-medium">
            LOCATION
          </Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., MAINTENANCE DEPARTMENT"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="department" className="text-sm font-medium">
            DEPARTMENT
          </Label>
          <Input
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Department name"
            className="mt-1"
          />
        </div>
      </div>

      {/* Date */}
      <div>
        <Label htmlFor="date" className="text-sm font-medium">
          DATE
        </Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1"
        />
      </div>
    </div>
  );
};