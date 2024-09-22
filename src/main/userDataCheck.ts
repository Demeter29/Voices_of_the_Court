//this file checks the app's userdata folder.

import { app, BrowserWindow, clipboard, ipcMain, dialog, ipcRenderer, autoUpdater } from "electron";
import path from 'path';
import { existsSync } from "original-fs";
import fs from 'fs';

export async function checkUserData(){
    const userPath = path.join(app.getPath('userData'), "votc_data");

    if(!existsSync(userPath)){
        console.log('userdata votc folder not found!')
        fs.cpSync(path.join(process.cwd(), "default_userdata"), userPath, {recursive: true});
        console.log('userdata votc default folder created!');

        return;
    }

    //folder already exist:

    //validate config
    const configPath = path.join(userPath, "configs", "config.json");
    const defaultConfigPath = path.join(userPath, "configs", "default_config.json");

    if(existsSync(configPath)){
        const config = JSON.parse(fs.readFileSync(configPath).toString());
        const defaultConfig = JSON.parse(fs.readFileSync(defaultConfigPath).toString());
        const configKeys = Object.keys(config);
        const defaultConfigKeys = Object.keys(defaultConfig);

        console.log(JSON.stringify(configKeys));
        console.log(JSON.stringify(defaultConfigKeys))
        if(JSON.stringify(configKeys) !== JSON.stringify(defaultConfigKeys)){

            console.log("userdata config file didn't match default config file. deleting config file");
            fs.unlinkSync(configPath);
        }
    }

    //validate conv summaries

    //validate script files
    const defaultScriptsPath = path.join(process.cwd(), "default_userdata", "scripts");
    const userDataScriptsPath= path.join(userPath, "scripts");

    fs.cp(path.join(defaultScriptsPath, 'actions', 'standard'), path.join(userDataScriptsPath, 'actions', 'standard'), {recursive: true}, (err) => {
        if(err) throw err;
    });

    fs.cp(path.join(defaultScriptsPath, 'prompts', 'description', 'standard'), path.join(userDataScriptsPath, 'prompts', 'description', 'standard'), {recursive: true}, (err) => {
        if(err) throw err;
    });

    fs.cp(path.join(defaultScriptsPath, 'prompts', 'example messages', 'standard'), path.join(userDataScriptsPath, 'prompts', 'example messages', 'standard'), {recursive: true}, (err) => {
        if(err) throw err;
    });

    return true;


}