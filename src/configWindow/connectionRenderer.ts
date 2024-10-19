import { ipcMain, ipcRenderer, dialog} from 'electron';
import { Config } from '../shared/Config';
import  {OpenAI}  from "openai";
import { ApiConnection } from '../shared/apiConnection';
import os from 'os';
import fs from 'fs';
import path from 'path';

let runPathButton: HTMLSelectElement = document.querySelector("#run-path-button")!;
let runPathInput: HTMLSelectElement = document.querySelector("#run-path-input")!;

let config;

//@ts-ignore
document.getElementById("container")?.style.display = "block";

init();

async function init(){
    
    
    config = await ipcRenderer.invoke('get-config');
    console.log(await ipcRenderer.invoke('get-config'))

    console.log(config)
    //init
    let userFolderPath = config!.userFolderPath;

    if(userFolderPath){
        runPathInput.value = userFolderPath;
    }
    else{
        let defaultPath = path.join(os.homedir(), 'Documents', 'Paradox Interactive', 'Crusader Kings III');

        if (fs.existsSync(defaultPath)) {
            runPathInput.value = defaultPath;
            config!.userFolderPath = defaultPath;
            ipcRenderer.send('config-change', "userFolderPath", runPathInput.value);
        }
        
    }



    runPathInput.addEventListener("change", (e: any) => {

        ipcRenderer.send('config-change', "userFolderPath", runPathInput.value);
    });


    runPathButton.addEventListener("click", async ()=>{
        ipcRenderer.send('select-user-folder');
    })

    ipcRenderer.on('select-user-folder-success', (event, path) =>{
        if(!path || path == "") return;

        runPathInput.value = path;
        ipcRenderer.send('config-change', "userFolderPath", runPathInput.value);

    })

}










