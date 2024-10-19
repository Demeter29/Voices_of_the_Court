//this file checks the app's userdata folder.

import { app} from "electron";
import path from 'path';
import { existsSync } from "original-fs";
import fs from 'fs';

export async function checkUserData(){
    const userPath = path.join(app.getPath('userData'), "votc_data");

    if(!existsSync(userPath)){
        console.log('userdata votc folder not found!')
        fs.cpSync(path.join(__dirname, "..", "..", "default_userdata"), userPath, {recursive: true});
        console.log('userdata votc default folder created!');

        return;
    }

    //folder already exist:

    fs.cpSync(path.join(__dirname, "..", "..", "default_userdata", 'configs', 'default_config.json'), path.join(userPath, 'configs', 'default_config.json'));

    //validate config
    const configPath = path.join(userPath, "configs", "config.json");
    const defaultConfigPath = path.join(userPath, "configs", "default_config.json");

    if(existsSync(configPath)){
        const config = JSON.parse(fs.readFileSync(configPath).toString());
        const defaultConfig = JSON.parse(fs.readFileSync(defaultConfigPath).toString());
        const configKeys = Object.keys(config);
        const defaultConfigKeys = Object.keys(defaultConfig);

        if(JSON.stringify(configKeys) !== JSON.stringify(defaultConfigKeys)){

            console.log("userdata config file didn't match default config file. deleting config file");
            fs.unlinkSync(configPath);
        }
    }

    //validate conv summaries

    //validate script files
    const defaultScriptsPath = path.join(__dirname, "..", "..", "default_userdata", "scripts");
    const userDataScriptsPath= path.join(userPath, "scripts");

    //actions
    if(fs.existsSync(path.join(userDataScriptsPath, 'actions', 'standard'))){
        fs.rmdirSync(path.join(userDataScriptsPath, 'actions', 'standard'), {recursive: true});
    } 
    fs.cp(path.join(defaultScriptsPath, 'actions', 'standard'), path.join(userDataScriptsPath, 'actions', 'standard'), {recursive: true}, (err) => {
        if(err) throw err;
    });

    //description
    if(fs.existsSync(path.join(userDataScriptsPath, 'prompts', 'description', 'standard'))){
        fs.rmdirSync(path.join(userDataScriptsPath, 'prompts', 'description', 'standard'), {recursive: true});
    }
    fs.cp(path.join(defaultScriptsPath, 'prompts', 'description', 'standard'), path.join(userDataScriptsPath, 'prompts', 'description', 'standard'), {recursive: true}, (err) => {
        if(err) throw err;
    });

    //example messages
    if(fs.existsSync(path.join(userDataScriptsPath, 'prompts', 'example messages', 'standard'))){
        fs.rmdirSync(path.join(userDataScriptsPath, 'prompts', 'example messages', 'standard'), {recursive: true});
    }
    fs.cp(path.join(defaultScriptsPath, 'prompts', 'example messages', 'standard'), path.join(userDataScriptsPath, 'prompts', 'example messages', 'standard'), {recursive: true}, (err) => {
        if(err) throw err;
    });

    //copy typedefs

    fs.cp(path.join(defaultScriptsPath, 'gamedata_typedefs.js'), path.join(userDataScriptsPath, 'gamedata_typedefs.js'), {}, (err) => {
        if(err) throw err;
    });

    
    return true;
}