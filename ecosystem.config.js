module.exports = {
  apps: [
    {
      name: "autoschool-server",
      script: "dist/index.js",
      cwd: "/var/www/autoschool/server",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      error_file: "/var/log/pm2/autoschool-server-error.log",
      out_file: "/var/log/pm2/autoschool-server-out.log",
      log_file: "/var/log/pm2/autoschool-server.log",
      time: true,
    },
    {
      name: "autoschool-client",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 5000",
      cwd: "/var/www/autoschool/client",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      error_file: "/var/log/pm2/autoschool-client-error.log",
      out_file: "/var/log/pm2/autoschool-client-out.log",
      log_file: "/var/log/pm2/autoschool-client.log",
      time: true,
    },
  ],
};
