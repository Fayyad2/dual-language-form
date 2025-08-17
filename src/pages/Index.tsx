import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { POCard } from "@/components/POManagement/POCard";
import { POFilters } from "@/components/POManagement/POFilters";
import { POData } from "@/types/po";
import { Plus, FileText } from "lucide-react";
import nmcLogo from "@/assets/nmc-logo.png";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [pos, setPOs] = useState<POData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Load POs from localStorage
  useEffect(() => {
    const savedPOs = JSON.parse(localStorage.getItem('pos') || '[]');
    setPOs(savedPOs);
  }, []);

  // Get all available tags
  const availableTags = Array.from(
    new Set(pos.flatMap(po => po.tags || []))
  );

  // Filter POs
  const filteredPOs = pos.filter(po => {
    const matchesSearch = 
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (po.customFields?.["Beneficiary Name المستفيد"] || "")
        .toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.purposeEnglish.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.purposeArabic.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => po.tags?.includes(tag));
    
    return matchesSearch && matchesStatus && matchesTags;
  });

  // Sort by PO number
  const sortedPOs = filteredPOs.sort((a, b) => {
    const aNum = parseInt(a.poNumber) || 0;
    const bNum = parseInt(b.poNumber) || 0;
    return aNum - bNum;
  });

  const handleEdit = (po: POData) => {
    // Navigate to edit form (implement later)
    toast({
      title: "Edit PO",
      description: `Editing PO #${po.poNumber}`,
    });
  };

  const handleView = (po: POData) => {
    // Navigate to view form (implement later)
    toast({
      title: "View PO",
      description: `Viewing PO #${po.poNumber}`,
    });
  };

  const handleDelete = (id: string) => {
    const updatedPOs = pos.filter(po => po.id !== id);
    setPOs(updatedPOs);
    localStorage.setItem('pos', JSON.stringify(updatedPOs));
    
    toast({
      title: "PO Deleted",
      description: "Payment order has been deleted successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img 
              src={nmcLogo} 
              alt="Northern Mountain Contracting Logo" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-3xl font-bold text-corporate-blue">
                HR Payment Orders
              </h1>
              <p className="text-muted-foreground">
                Northern Mountain Contracting Co.
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/po-form')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Payment Order
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-form-border">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-corporate-blue" />
              <div>
                <p className="text-2xl font-bold">{pos.length}</p>
                <p className="text-sm text-muted-foreground">Total POs</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-form-border">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div>
                <p className="text-2xl font-bold">
                  {pos.filter(po => po.status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-form-border">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <div>
                <p className="text-2xl font-bold">
                  {pos.filter(po => po.status === 'approved').length}
                </p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-form-border">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-500"></div>
              <div>
                <p className="text-2xl font-bold">
                  {pos.filter(po => po.status === 'draft').length}
                </p>
                <p className="text-sm text-muted-foreground">Drafts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <POFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          availableTags={availableTags}
        />

        {/* PO Grid */}
        <div className="mt-6">
          {sortedPOs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payment Orders Found</h3>
              <p className="text-muted-foreground mb-4">
                {pos.length === 0 
                  ? "Get started by creating your first payment order"
                  : "Try adjusting your search criteria"
                }
              </p>
              {pos.length === 0 && (
                <Button onClick={() => navigate('/po-form')}>
                  Create First PO
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPOs.map(po => (
                <POCard
                  key={po.id}
                  po={po}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
