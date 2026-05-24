const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function uploadFile(buffer, filename, mimetype, bucket = 'uploads') {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: mimetype,
      upsert: true
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename);

  return urlData.publicUrl;
}

module.exports = { uploadFile, supabase };
