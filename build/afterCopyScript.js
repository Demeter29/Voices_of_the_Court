var fs = require("fs");

module.exports = (forgeConfig, buildPath, electronVersion, platform, arch) => {
    //fs.unlinkSync(buildPath+"/configs");
    fs.rm(buildPath+"/default_userdata", { recursive: true, force: true }, err =>{});
}