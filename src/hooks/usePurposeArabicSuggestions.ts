


import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getGeminiSuggestions } from "@/utils/gemini";

// Suggestion type for marking AI suggestions
type PurposeSuggestion = { value: string; isAI?: boolean };

// Enhanced: Fetches unique Arabic purposes from meta JSON and adds Gemini AI suggestions (debounced)
export function usePurposeArabicSuggestions(currentInput?: string): PurposeSuggestion[] {
  const [suggestions, setSuggestions] = useState<PurposeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const localHistoryRef = useRef<string[]>([]);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch history from Supabase/localStorage on mount
  useEffect(() => {
    async function fetchSuggestions() {
      // Fetch all meta fields from pos table
      const { data, error } = await supabase
        .from("pos")
        .select("meta");
      let freq: Record<string, number> = {};
      if (!error && data) {
        // Extract all Arabic purposes from meta JSON
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
          .map(([val]) => ({ value: val }));
        localHistoryRef.current = sorted.map(s => s.value);
        setSuggestions(sorted);
      } else {
        setSuggestions([]);
      }
    }
    fetchSuggestions();
  }, []);

  // Debounced Gemini AI suggestions when input changes
  useEffect(() => {
    if (!currentInput || !currentInput.trim()) return;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const aiSuggestions = await getGeminiSuggestions({
          prompt: currentInput,
          history: localHistoryRef.current || [],
        });
        // Merge and deduplicate, marking AI suggestions
        setSuggestions(prev => {
          const prevValues = new Set((prev || []).map(s => s.value));
          const aiMarked = (aiSuggestions || []).filter(s => !prevValues.has(s)).map(s => ({ value: s, isAI: true }));
          // Keep order: prev first, then new AI
          return [...(prev || []), ...aiMarked];
        });
      } catch (e) {
        // Ignore AI errors, keep previous suggestions
      } finally {
        setLoading(false);
      }
    }, 2000); // 2 seconds debounce
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [currentInput]);

  return suggestions;
}
