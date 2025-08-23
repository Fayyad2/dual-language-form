
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Fetches unique Arabic purposes from the meta JSON field in the pos table
export function usePurposeArabicSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    async function fetchSuggestions() {
      // Fetch all meta fields from pos table
      const { data, error } = await supabase
        .from("pos")
        .select("meta");
      if (!error && data) {
        // Extract all Arabic purposes from meta JSON
        const freq: Record<string, number> = {};
        data.forEach((row: any) => {
          if (!row.meta) return;
          let metaObj: any = null;
          try {
            metaObj = typeof row.meta === 'string' ? JSON.parse(row.meta) : row.meta;
          } catch (e) {
            return;
          }
          const val = metaObj?.purposeArabic?.trim();
          if (val) freq[val] = (freq[val] || 0) + 1;
        });
        const sorted = Object.entries(freq)
          .sort((a, b) => b[1] - a[1])
          .map(([val]) => val);
        setSuggestions(sorted);
      }
    }
    fetchSuggestions();
  }, []);

  return suggestions;
}
