module.exports = {
  apps: [
    {
      name: 'malamal-frontend',

      script: 'pnpm',
      args: 'start',

      cwd: '/var/www/MalaMal_Frontend',

      instances: 1,
      exec_mode: 'fork',

      autorestart: true,
      watch: false,

      max_memory_restart: '1G',

      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
