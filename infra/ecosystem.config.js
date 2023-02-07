module.exports = {
  apps: [
    {
      name: "zingati-server",
      script: "yarn",
      args: "start",
      watch: true,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
