var fs = require("fs");

module.exports = (forgeConfig, buildPath, electronVersion, platform, arch) => {
    fs.cpSync('./configs', buildPath+"/configs", {recursive: true});
    fs.cpSync('./custom', buildPath+"/custom", {recursive: true});
    fs.cpSync('./conversation_summaries', buildPath+"/conversations_summaries", {recursive: true});
}