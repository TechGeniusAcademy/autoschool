module.exports = {
  apps: [
    {
      name: "autoschool-server",
      script: "dist/index.js",
      cwd: "/var/www/autoschool/server",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
    {
      name: "autoschool-client",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 5000",
      cwd: "/var/www/autoschool/client",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};
