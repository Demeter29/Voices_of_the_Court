var fs = require("fs");

module.exports = (forgeConfig, buildPath, electronVersion, platform, arch) => {
    //fs.unlinkSync(buildPath+"/configs");
    fs.rm(buildPath+"/configs", { recursive: true, force: true }, err =>{});
    fs.rm(buildPath+"/custom", { recursive: true, force: true }, err =>{});
    fs.rm(buildPath+"/conversation_summaries", { recursive: true, force: true }, err =>{});
    fs.rm(buildPath+"/debug.log", {force: true }, err =>{});

}