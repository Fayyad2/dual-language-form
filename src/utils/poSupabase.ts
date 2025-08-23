export async function deletePOFromSupabase(id: string) {
  const { data, error } = await supabase.from('pos').delete().eq('id', id);
  if (error) throw error;
  return data;
}
import { supabase } from '@/integrations/supabase/client';

export async function addPOToSupabase(po: Record<string, any>) {
  const { data, error } = await supabase.from('pos').insert([po]);
  if (error) throw error;
  return data;
}

export async function updatePOInSupabase(id: string, po: Record<string, any>) {
  // Ensure id is a number for Supabase
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  const { data, error } = await supabase.from('pos').update(po).eq('id', numericId);
  if (error) throw error;
  return data;
}

export async function fetchAllPOsFromSupabase() {
  const { data, error } = await supabase.from('pos').select('*');
  if (error) throw error;
  return data as Record<string, any>[];
}
