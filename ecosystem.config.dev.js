/* eslint no-use-before-define: 0 */
module.exports = {
    apps: [
        {
            name: 'app',
            script: './src/app.ts',
            instances: 1,
            exec_mode: 'cluster',
            env: {
                ENVIRONMENT: 'development',
            },
            // wait_ready: true,
            // listen_timeout: 50000,
        },
    ],
};
