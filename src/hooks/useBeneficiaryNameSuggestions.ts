import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Fetches unique Beneficiary Names from previous POs, with debug logging and localStorage fallback
export function useBeneficiaryNameSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    async function fetchSuggestions() {
      // Fetch all meta fields from pos table
      const { data, error } = await supabase
        .from("pos")
        .select("customFields");
      let freq: Record<string, number> = {};
      if (!error && data) {
        // Extract all Beneficiary Names from customFields JSON
        data.forEach((row: any) => {
          if (!row.customFields) return;
          let fieldsObj: any = null;
          try {
            fieldsObj = typeof row.customFields === 'string' ? JSON.parse(row.customFields) : row.customFields;
          } catch (e) {
            return;
          }
          const val = fieldsObj?.["Beneficiary Name المستفيد"]?.trim();
          if (val) freq[val] = (freq[val] || 0) + 1;
        });
        const sorted = Object.entries(freq)
          .sort((a, b) => b[1] - a[1])
          .map(([val]) => val);
        console.log('[BeneficiaryNameSuggestions] Supabase suggestions:', sorted);
        if (sorted.length > 0) {
          setSuggestions(sorted);
          return;
        }
      }
      // Fallback to localStorage if no suggestions from Supabase
      try {
        const localPOs = JSON.parse(localStorage.getItem('pos') || '[]');
        freq = {};
        localPOs.forEach((po: any) => {
          if (!po.customFields) return;
          const val = po.customFields["Beneficiary Name المستفيد"]?.trim();
          if (val) freq[val] = (freq[val] || 0) + 1;
        });
        const localSorted = Object.entries(freq)
          .sort((a, b) => b[1] - a[1])
          .map(([val]) => val);
        console.log('[BeneficiaryNameSuggestions] localStorage suggestions:', localSorted);
        setSuggestions(localSorted);
      } catch (e) {
        setSuggestions([]);
      }
    }
    fetchSuggestions();
  }, []);

  return suggestions;
}
