var { GenerateSW } = require('workbox-webpack-plugin');
const fs = require("fs")
var find = require('find');
var path = require('path');
const hasha = require('hasha');

const hashaOptions = {
    algorithm: "sha1"
}

sha1FromFile = filepath => hasha.fromFileSync(filepath, hashaOptions);
sha1FromString = string => hasha(string, hashaOptions);

module.exports = function override(config, env)
{
    config.plugins.forEach((plugin) =>
    {
        if (env === "production" && plugin.constructor.name === GenerateSW.name) {

            const publicDirectoryPath = path.join(__dirname, 'public');
            const exclude = ['index.html', 'manifest.json', 'robots.txt', 'favicon.ico'];
            find.fileSync(publicDirectoryPath).filter(file => file.match(/app-precache-[a-f0-9]+\.js/)).forEach(file => { fs.unlinkSync(file) })

            const precache = find.fileSync(publicDirectoryPath).filter(file => !(exclude.includes(path.relative(publicDirectoryPath, file)))).map(file =>
            {
                const url = './' + path.relative(publicDirectoryPath, file).replace(/\\/g, '/');
                const revision = sha1FromFile(file);
                return { url, revision };
            });
            const appPrecacheJS = `self.__precacheManifest = (self.__precacheManifest || []).concat(${JSON.stringify(precache, null, 4)});`

            const contentHash = sha1FromString(appPrecacheJS);
            const fileName = `app-precache-${contentHash}.js`
            fs.writeFileSync(path.join(publicDirectoryPath, fileName), appPrecacheJS);
            plugin.config.importScripts.push(`/${fileName}`)

        }
    });
    return config;
}