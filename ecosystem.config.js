module.exports = {
    apps: [
        {
            name: 'API',
            instances: 0,
            autorestart: true,
            watch: false,
            // max_memory_restart: '1.8G',
            env_production: {
                ENVIRONMENT: 'production',
            },
        },
    ],
};
