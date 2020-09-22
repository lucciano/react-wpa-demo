const { rewireWorkboxInject, defaultInjectConfig } = require('react-app-rewire-workbox');
const path = require('path');



module.exports = function override(config, env)
{
    config.plugins.forEach((plugin) =>
    {
        if (env === "production" && plugin.constructor.name === 'GenerateSW') {
            plugin.config.importScripts.push('nose.js');
        }
    })
    return config;
}