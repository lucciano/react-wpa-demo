const fs = require("fs")
const path = require("path")
const hasha = require('hasha');


const hashaOptions = {
	algorithm: "sha1"
}

sha1FromFile = filepath => hasha.fromFileSync(filepath, hashaOptions);
sha1FromString = string => hasha(string, hashaOptions);

const getAllFiles = function (dirPath, arrayOfFiles)
{
    files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function (file)
    {
        const fileName = path.join(dirPath, file);
        if (fs.statSync(fileName).isDirectory()) {
            arrayOfFiles = getAllFiles(fileName, arrayOfFiles)
        } else {
            arrayOfFiles.push(fileName)
        }
    })

    return arrayOfFiles
}

module.exports = function override(config, env)
{
    config.plugins.forEach((plugin) =>
    {
        if (env === "production" && plugin.constructor.name === 'GenerateSW') {

            const publicDirectoryPath = path.join(__dirname, 'public');

            const exclude = ['index.html', 'manifest.json', 'robots.txt', 'favicon.ico'];
            const precache = getAllFiles(publicDirectoryPath).filter(file => !(exclude.includes(path.relative(publicDirectoryPath, file)))).map(file => 
            {
                // console.log(path.relative(publicDirectoryPath, file), !(exclude.includes(path.relative(publicDirectoryPath, file))));
                const url = '/' + path.relative(publicDirectoryPath, file).replace(/\\/g, '/'); 
                const revision = sha1FromFile(file);
                return {url, revision};
            });
            const appPrecacheJS = `self.__precacheManifest = (self.__precacheManifest || []).concat(${JSON.stringify(precache, null, 4)});`
            getAllFiles(publicDirectoryPath).filter(file => file.match(/app-precache-[a-f0-9]+\.js/)).forEach(file => {fs.unlinkSync(file)})
            const contentHash = sha1FromString(appPrecacheJS);
            const fileName = `app-precache-${contentHash}.js`
            fs.writeFileSync(path.join(publicDirectoryPath, fileName), appPrecacheJS);
            plugin.config.importScripts.push(`/${fileName}`);

        }
    })
    return config;
}