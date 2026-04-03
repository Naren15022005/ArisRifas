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
  require('./dist/src/main.js');
  console.log('Started main.js (wrapper)');
} catch (err) {
  console.error('STARTWRAPPER ERROR', err && err.stack ? err.stack : err);
  process.exit(1);
}
