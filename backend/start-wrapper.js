process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION', err && err.stack ? err.stack : err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION', reason && reason.stack ? reason.stack : reason);
  process.exit(1);
});

try {
  // Require modules used by the wrapper diagnostics and migration runner.
  const fs = require('fs');
  const path = require('path');
  const { exec } = require('child_process');
  const dns = require('dns').promises;
  const net = require('net');

  const expected = path.join(__dirname, 'dist', 'src', 'main.js');

  async function checkDatabaseConnectivity() {
    const raw = process.env.DATABASE_URL || '';
    if (!raw) {
      console.warn('STARTWRAPPER: DATABASE_URL not set; skipping DB connectivity checks.');
      return;
    }
    try {
      const url = new URL(raw);
      const host = url.hostname;
      const port = url.port || (url.protocol === 'postgres:' ? '5432' : '3306');
      console.log(`STARTWRAPPER: checking DB host=${host} port=${port}`);
      try {
        const addr = await dns.lookup(host);
        console.log('STARTWRAPPER: DNS lookup result:', addr);
      } catch (dnsErr) {
        console.error('STARTWRAPPER: DNS lookup failed for', host, dnsErr && dnsErr.message ? dnsErr.message : dnsErr);
      }
      await new Promise((resolve, reject) => {
        const sock = new net.Socket();
        const timeout = 5000;
        let settled = false;
        sock.setTimeout(timeout);
        sock.once('error', (err) => {
          if (settled) return;
          settled = true;
          sock.destroy();
          reject(err);
        });
        sock.once('timeout', () => {
          if (settled) return;
          settled = true;
          sock.destroy();
          reject(new Error('TCP connection timed out'));
        });
        sock.connect(parseInt(port, 10), host, () => {
          if (settled) return;
          settled = true;
          sock.end();
          resolve();
        });
      });
      console.log('STARTWRAPPER: TCP connect to DB succeeded');
    } catch (err) {
      console.error('STARTWRAPPER: DB connectivity check failed:', err && err.stack ? err.stack : err);
    }
  }

  function runMigrations() {
    return new Promise((resolve, reject) => {
      const cmd = 'npx prisma migrate deploy --schema=./prisma/schema.prisma';
      console.log('STARTWRAPPER: running migrations ->', cmd);
      const child = exec(cmd, { cwd: __dirname, env: process.env }, (error, stdout, stderr) => {
        console.log('STARTWRAPPER: migrate stdout:\n', stdout);
        if (stderr) console.error('STARTWRAPPER: migrate stderr:\n', stderr);
        if (error) return reject(error);
        resolve();
      });
      // forward output while running
      child.stdout && child.stdout.pipe(process.stdout);
      child.stderr && child.stderr.pipe(process.stderr);
    });
  }

  (async () => {
    // Check DB connectivity first so logs show DNS/TCP failures clearly.
    await checkDatabaseConnectivity();

    // Attempt to run migrations (will surface Prisma errors in logs).
    try {
      await runMigrations();
      console.log('STARTWRAPPER: migrations applied successfully (or none were pending).');
    } catch (mErr) {
      console.error('STARTWRAPPER: migrations failed:', mErr && mErr.stack ? mErr.stack : mErr);
      // Let process exit with non-zero so Render exposes the failure; do not continue to start the app.
      process.exit(1);
    }

    // After migrations succeeded, require the compiled Nest app and start it.
    if (!fs.existsSync(expected)) {
      console.error('STARTWRAPPER ERROR: expected compiled file not found:', expected);
      console.error('Listing backend directory contents for debugging:');
      try {
        const list = fs.readdirSync(__dirname);
        console.error(list);
        const distExists = fs.existsSync(path.join(__dirname, 'dist'));
        if (distExists) {
          console.error('dist directory contents:');
          console.error(fs.readdirSync(path.join(__dirname, 'dist')));
        }
      } catch (lsErr) {
        console.error('Error listing backend dir:', lsErr && lsErr.stack ? lsErr.stack : lsErr);
      }
      console.error('Ensure `backend/dist` is present in the repository or configure Render to build the backend.');
      process.exit(1);
    }
    require(expected);
    console.log('Started main.js (wrapper)');
  })();
} catch (err) {
  console.error('STARTWRAPPER ERROR', err && err.stack ? err.stack : err);
  process.exit(1);
}
