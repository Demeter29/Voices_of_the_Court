var fs = require("fs");

module.exports = (forgeConfig, buildPath, electronVersion, platform, arch) => {
    fs.cpSync('./default_userdata', buildPath+"/default_userdata", {recursive: true});
}