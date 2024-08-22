import { ipcMain, ipcRenderer, dialog} from 'electron';
import { Config } from '../shared/Config';
import  {OpenAI}  from "openai";
import { ApiConnection } from '../shared/apiConnection';
import os from 'os';
import fs from 'fs';
import path from 'path';

let runPathButton: HTMLSelectElement = document.querySelector("#run-path-button")!;
let runPathInput: HTMLSelectElement = document.querySelector("#run-path-input")!;

let config = new Config();

//init
let userFolderPath = config.userFolderPath;

if(userFolderPath){
    runPathInput.value = userFolderPath;
}
else{
    let defaultPath = path.join(os.homedir(), 'Documents', 'Paradox Interactive', 'Crusader Kings III');

    if (fs.existsSync(defaultPath)) {
        runPathInput.value = defaultPath;
        config.userFolderPath = defaultPath;
        config.export();
    }
    
}



document.addEventListener('change', () =>{
    
    config.userFolderPath =  runPathInput.value;

    ipcRenderer.send('config-change', config);
    config.export();
})


runPathButton.addEventListener("click", async ()=>{
    ipcRenderer.send('select-user-folder');
})

ipcRenderer.on('select-user-folder-success', (event, path) =>{
    if(!path || path == "") return;

    runPathInput.value = path;

})









