import { supabase } from "@/integrations/supabase/client";

// Upload a file to Supabase Storage and return the public URL
export async function uploadAttachment(file: File, poId: string) {
  const filePath = `${poId}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from("attachments")
    .upload(filePath, file, { upsert: true });
  if (error) throw error;
  // Get public URL
  const { data: urlData } = supabase.storage.from("attachments").getPublicUrl(filePath);
  return urlData.publicUrl;
}
