module.exports = {
    apps: [
        {
            name: 'app',
            script: './src/app.ts',
            instances: 0,
            exec_mode: 'cluster',
            env: {
                ENVIRONMENT: 'production',
            },
            // wait_ready: true,
            // listen_timeout: 50000,
        },
    ],
};
