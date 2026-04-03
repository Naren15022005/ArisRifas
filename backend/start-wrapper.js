process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION', err && err.stack ? err.stack : err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION', reason && reason.stack ? reason.stack : reason);
  process.exit(1);
});
try {
  // Require the compiled NestJS main file which starts the server.
  const fs = require('fs');
  const path = require('path');
  const expected = path.join(__dirname, 'dist', 'src', 'main.js');
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
} catch (err) {
  console.error('STARTWRAPPER ERROR', err && err.stack ? err.stack : err);
  process.exit(1);
}
