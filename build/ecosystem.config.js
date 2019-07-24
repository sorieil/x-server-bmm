module.exports = {
    apps: [
        {
            name: 'API',
            instances: 1,
            autorestart: true,
            watch: false,
            // max_memory_restart: '1.8G',
            env: {
                ENVIRONMENT: 'development',
            },
        },
    ],
};
