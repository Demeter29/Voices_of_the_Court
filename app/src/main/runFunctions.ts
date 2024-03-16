import { Config } from "../shared/Config";
import { ipcMain, ipcRenderer } from 'electron';
import fs from 'fs';

let config: Config;

export function writeToRun(text: string){
    config = new Config();
    fs.writeFileSync(config.runPath+'\\gpt_kings.txt', text);
}

export function clearRun(){
    config = new Config();
    fs.writeFileSync(config.runPath+'\\gpt_kings.txt', "");
}

