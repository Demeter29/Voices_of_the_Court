import { ipcRenderer} from 'electron';
import os from 'os';
import fs from 'fs';
import path from 'path';

let runPathButton: HTMLSelectElement = document.querySelector("#run-path-button")!;
let runPathInput: HTMLSelectElement = document.querySelector("#run-path-input")!;

let config;

document.getElementById("container")!.style.display = "block";

init();

async function init(){
    //@ts-ignore
    
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










