
module.exports = function override(config, env) {
    // console.log(config.plugins, env);
    config.plugins.forEach((plugin, index) => {
        if (constructor.name === 'GenerateSW')
        {
            console.log(index, plugin.constructor.name);
        }
    })
    return config;
}