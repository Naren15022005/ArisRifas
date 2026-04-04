const dns = require('dns').promises;
const url = require('url');
const net = require('net');
const https = require('https');
const path = require('path');
const fs = require('fs');

// prefer .env.local if present, fallback to .env
const envLocal = path.join(__dirname, '..', '.env.local');
const envDefault = path.join(__dirname, '..', '.env');
const envPath = fs.existsSync(envLocal) ? envLocal : envDefault;
require('dotenv').config({ path: envPath });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

function logOk(msg) { console.log('[OK] ', msg); }
function logErr(msg) { console.error('[ERR]', msg); }

async function check() {
  console.log('Checking Supabase-related environment...');
  if (!SUPABASE_URL) logErr('SUPABASE_URL not set'); else logOk('SUPABASE_URL set');
  if (!SUPABASE_SERVICE_ROLE_KEY) logErr('SUPABASE_SERVICE_ROLE_KEY not set'); else logOk('SUPABASE_SERVICE_ROLE_KEY set');
  if (!DATABASE_URL) logErr('DATABASE_URL not set'); else logOk('DATABASE_URL set');

  if (SUPABASE_URL) {
    try {
      const parsed = new url.URL(SUPABASE_URL);
      const host = parsed.hostname;
      console.log('Resolving host:', host);
      const addrs = await dns.lookup(host).catch(e => { throw new Error('DNS lookup failed: ' + e.message); });
      logOk(`DNS -> ${JSON.stringify(addrs)}`);

      const port = 443;
      await new Promise((resolve, reject) => {
        const req = https.request({ method: 'GET', host, port, path: '/', timeout: 5000 }, res => {
          logOk(`HTTP ${res.statusCode} ${res.statusMessage}`);
          resolve();
        });
        req.on('error', e => reject(new Error('HTTP request failed: ' + e.message)));
        req.on('timeout', () => { req.destroy(); reject(new Error('HTTP request timed out')); });
        req.end();
      }).catch(e => { throw e; });

      // try TCP to Postgres default port 5432
      await new Promise((resolve, reject) => {
        const s = new net.Socket();
        s.setTimeout(4000);
        s.once('error', err => { s.destroy(); reject(new Error('TCP connect failed: ' + err.message)); });
        s.once('timeout', () => { s.destroy(); reject(new Error('TCP connect timeout')); });
        s.connect(5432, host, () => { logOk('TCP connect to port 5432 succeeded (may still be blocked by cloud)'); s.end(); resolve(); });
      }).catch(e => { logErr(e.message); });
    } catch (err) {
      logErr(err.message);
    }
  }

  // basic check for DATABASE_URL format
  if (DATABASE_URL) {
    try {
      const parsedDb = new url.URL(DATABASE_URL);
      if (!parsedDb.protocol.startsWith('postgres')) logErr('DATABASE_URL protocol not postgres'); else logOk('DATABASE_URL looks like postgres URL');
    } catch (e) { logErr('DATABASE_URL parse error: ' + e.message); }
  }

  console.log('Done. Use this output to fix your .env values locally (do not share secrets).');
}

check().catch(err => { console.error('Fatal:', err && err.stack ? err.stack : err); process.exit(1); });
