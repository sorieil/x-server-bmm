module.exports = {
    apps: [
        {
            name: 'API',
            script: './src/app.ts',
            instances: 0,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
        },
    ],
};
