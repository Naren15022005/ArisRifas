const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment');
  process.exit(2);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');
const BUCKET = process.env.SUPABASE_UPLOAD_BUCKET || 'uploads';

async function uploadFile(filePath, key) {
  const fileStream = fs.createReadStream(filePath);
  const stat = fs.statSync(filePath);
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(key, fileStream, { upsert: true, contentType: getContentType(key) });
  if (error) throw error;
  const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
  return publicUrl;
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

async function run() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.error('Uploads directory not found:', UPLOADS_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(UPLOADS_DIR).filter(f => fs.statSync(path.join(UPLOADS_DIR, f)).isFile());
  if (!files.length) {
    console.log('No files to upload in', UPLOADS_DIR);
    process.exit(0);
  }

  console.log(`Uploading ${files.length} files to Supabase bucket '${BUCKET}'...`);
  for (const file of files) {
    const filePath = path.join(UPLOADS_DIR, file);
    const key = file; // store at root of bucket
    try {
      const publicUrl = await uploadFile(filePath, key);
      console.log('Uploaded', file, '->', publicUrl);

      // Update DB rows that reference this file (by filename match)
      // handle cases where imageUrl contains the filename or ends with filename
      const updateResult = await prisma.raffle.updateMany({
        where: {
          OR: [
            { imageUrl: { contains: file } },
            { imageUrl: { endsWith: file } }
          ]
        },
        data: { imageUrl: publicUrl }
      });
      console.log(`DB updated for ${file}: matched ${updateResult.count} rows`);
    } catch (err) {
      console.error('Failed to upload', file, err && err.message ? err.message : err);
    }
  }

  await prisma.$disconnect();
  console.log('Done.');
}

run().catch(err => {
  console.error('Error in upload-to-supabase:', err && err.stack ? err.stack : err);
  process.exit(1);
});
