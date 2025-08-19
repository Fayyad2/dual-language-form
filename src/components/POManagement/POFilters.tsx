import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface POFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  availableTags: string[];
}

export const POFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  selectedTags,
  setSelectedTags,
  availableTags
}: POFiltersProps) => {
  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSelectedTags([]);
  };

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by PO number, beneficiary, status, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        <Button variant="outline" onClick={clearAllFilters}>
          Clear All
        </Button>
      </div>

      {/* Tags */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Filter by tags:</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => selectedTags.includes(tag) ? removeTag(tag) : addTag(tag)}
              >
                {tag}
                {selectedTags.includes(tag) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters */}
      {(selectedTags.length > 0 || statusFilter !== "all" || searchTerm) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Active filters:</span>
          {searchTerm && (
            <Badge variant="secondary">
              Search: "{searchTerm}"
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => setSearchTerm("")}
              />
            </Badge>
          )}
          {statusFilter !== "all" && (
            <Badge variant="secondary">
              Status: {statusFilter}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => setStatusFilter("all")}
              />
            </Badge>
          )}
          {selectedTags.map(tag => (
            <Badge key={tag} variant="secondary">
              Tag: {tag}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};