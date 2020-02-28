module.exports = {
    apps: [
        {
            name: 'Bmm-api',
            autorestart: true,
            script: './src/app.ts',
            env: {
                instances: 1,
                watch: true,
            },
            env_production: {
                exec_mode: 'cluster',
                instances: 0,
                max_memory_restart: '7G',
                watch: false,
            },
        },
    ],
};
