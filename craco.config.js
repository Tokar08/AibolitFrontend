const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = {
    webpack: {
        plugins: [
            new GenerateSW({
                clientsClaim: true,
                skipWaiting: true
            })
        ]
    }
};
