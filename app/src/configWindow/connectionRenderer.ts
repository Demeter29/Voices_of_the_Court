import { ipcMain, ipcRenderer, dialog} from 'electron';
import { Config } from '../shared/Config';
import  {OpenAI}  from "openai";

let apiSelector: HTMLSelectElement = document.querySelector("#connection-api")!;

let openaiDiv: HTMLInputElement = document.querySelector("#openai-menu")!;
let oobaDiv: HTMLInputElement = document.querySelector("#ooba-menu")!;
let openrouterDiv: HTMLInputElement = document.querySelector("#openrouter-menu")!;

let openaiKeyInput: HTMLInputElement = document.querySelector("#openai-key")!;
let openaiSaveButton: HTMLInputElement = document.querySelector("#openai-key-save")!;
let openaiModelSelect: HTMLSelectElement = document.querySelector("#openai-model-select")!;

let oobaUrlInput: HTMLSelectElement = document.querySelector("#ooba-url")!;
let oobaUrlConnectButton: HTMLInputElement = document.querySelector("#ooba-url-connect")!;

let openrouterKeyInput: HTMLSelectElement = document.querySelector("#openrouter-key")!;
let openrouterModelInput: HTMLInputElement = document.querySelector("#openrouter-model")!;
let openrouterInstructModeCheckbox: HTMLInputElement = document.querySelector("#openrouter-instruct-mode")!;

let runPathButton: HTMLSelectElement = document.querySelector("#run-path-button")!;
let runPathInput: HTMLSelectElement = document.querySelector("#run-path-input")!;

let config = new Config();
apiSelector.value = config.selectedApi;

displaySelectedApiBox();

openaiKeyInput.value = config.openaiKey;
openaiModelSelect.value = config.openaiModel;

oobaUrlInput.value = config.oobaServerUrl;

openrouterKeyInput.value = config.openRouterKey;
openrouterModelInput.value = config.openRouterModel;
openrouterInstructModeCheckbox.checked = config.openRouterForceInstruct;

runPathInput.value = config.runPath;

apiSelector.addEventListener("change", displaySelectedApiBox)



document.addEventListener('change', () =>{
    config.selectedApi = apiSelector.value;

    config.openaiKey = openaiKeyInput.value
    config.openaiModel = openaiModelSelect.value;

    config.oobaServerUrl = oobaUrlInput.value;

    config.openRouterKey = openrouterKeyInput.value;
    config.openRouterModel = openrouterModelInput.value;
    config.openRouterForceInstruct = openrouterInstructModeCheckbox.checked;

    config.runPath =  runPathInput.value;

    ipcRenderer.send('config-change', config);
    config.export();
})

function displaySelectedApiBox(){
    switch (apiSelector.value) {
        case 'openai':  
            openaiDiv.style.display = "block";
            oobaDiv.style.display = "none";
            openrouterDiv.style.display = "none";
            break;
        case 'ooba':
            openaiDiv.style.display = "none";
            oobaDiv.style.display = "block";
            openrouterDiv.style.display = "none";
            break;
        case 'openrouter':
            openaiDiv.style.display = "none";
            oobaDiv.style.display = "none";
            openrouterDiv.style.display = "block";
            break;
    }
}



runPathButton.addEventListener("click", async ()=>{
    ipcRenderer.send('select-user-folder');
})

ipcRenderer.on('select-user-folder-success', (event, path) =>{
    if(!path || path == "") return;

    runPathInput.value = path;

})










