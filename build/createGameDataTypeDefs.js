const fs = require('fs');
const path = require('path');
const { transpileFile } = require("ts-to-jsdoc");

const folderPath = path.join(__dirname, '..', 'src', 'shared', 'gameData');
const gameDataCode = fs.readFileSync(path.join(folderPath, 'GameData.ts'));
const characterCode = fs.readFileSync(path.join(folderPath, 'Character.ts'));

let output = transpileFile({code: gameDataCode}) + transpileFile({code: characterCode})

//remove imports
let lines = output.split("\n");
for(let i=0;i<lines.length;i++){
    if(lines[i].includes('import')){
        lines.splice(i, 1);
        i--
    }
}
output = lines.join('\n');

fs.writeFileSync(path.join(__dirname, '..', 'default_userdata', 'scripts', 'gamedata_typedefs.js'), output);

