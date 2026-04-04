import supabase from '../lib/supabaseClient';

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_UPLOAD_BUCKET || 'uploads';

export async function uploadFileToSupabase(file: File | Blob, key: string) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(key, file as any, { upsert: true });

  if (error) throw error;
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return urlData?.publicUrl || null;
}

export async function getPublicUrl(key: string) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return data?.publicUrl || null;
}
