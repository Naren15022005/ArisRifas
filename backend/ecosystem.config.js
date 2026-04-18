module.exports = {
  apps: [
    {
      name: 'rifas',
      script: 'dist/src/main.js',
      cwd: __dirname,
      exec_mode: 'fork',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
