import { ipcMain, ipcRenderer, dialog} from 'electron';
import { Config } from '../shared/Config';
import  {OpenAI}  from "openai";
import { ApiConnection } from '../shared/apiConnection';


let runPathButton: HTMLSelectElement = document.querySelector("#run-path-button")!;
let runPathInput: HTMLSelectElement = document.querySelector("#run-path-input")!;

let config = new Config();

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










