var afterExtractScript = require("./build/afterExtractScript.js");
var afterCopyScript = require("./build/afterCopyScript.js");
const path = require('path');

module.exports = {
  packagerConfig: {
     icon: './build/icons/icon.ico',
    //"asar":true
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: { loadingGif: path.join(__dirname, 'build', 'icons', 'installerPic.png')}
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
    packageAfterExtract: (forgeConfig, buildPath, electronVersion, platform, arch) => {
        afterExtractScript(forgeConfig, buildPath, electronVersion, platform, arch);
    },

    packageAfterCopy: (forgeConfig, buildPath, electronVersion, platform, arch) => {
      afterCopyScript(forgeConfig, buildPath, electronVersion, platform, arch);
  },

  }


};
