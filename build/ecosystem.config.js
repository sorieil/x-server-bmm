module.exports = {
    apps: [
        {
            name: 'API',
            instances: 1,
            autorestart: true,
            script: './src/app.ts',
            watch: false,
            // max_memory_restart: '1.8G',
            env: {
                NODE_ENV: 'development',
            },
        },
    ],
};
