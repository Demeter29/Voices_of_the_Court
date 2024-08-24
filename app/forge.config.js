var fs = require('fs');

module.exports = {
  packagerConfig: {
     icon: './public/assets/icon.ico'
    //"asar":true
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  hooks: {
    packageAfterExtract: async (forgeConfig, buildPath, electronVersion, platform, arch) => {
      fs.cpSync('./configs', buildPath+"/configs", {recursive: true});
      fs.cpSync('./public', buildPath+"/public", {recursive: true});

      fs.rm(buildPath+"/resources/app/configs", { recursive: true, force: true }, err =>{});
      fs.rm(buildPath+"/resources/app/public", { recursive: true, force: true }, err =>{});

    }
  }


};
