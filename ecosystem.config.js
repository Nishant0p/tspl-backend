module.exports = {
  apps: [
    {
      name: 'tspl-admin-backend',
      script: 'index.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
