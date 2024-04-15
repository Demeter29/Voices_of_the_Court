import { ipcMain, ipcRenderer, dialog} from 'electron';
import { Config } from '../shared/Config';
import  {OpenAI}  from "openai";
import { ApiConnection } from '../shared/apiConnection';

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

let testConnectionButton: HTMLButtonElement = document.querySelector("#connection-test-button")!;
let testConnectionSpan: HTMLButtonElement = document.querySelector("#connection-test-span")!;

let runPathButton: HTMLSelectElement = document.querySelector("#run-path-button")!;
let runPathInput: HTMLSelectElement = document.querySelector("#run-path-input")!;

let config = new Config();


apiSelector.value = config.textGenerationApiConnection.type;

displaySelectedApiBox();


switch(apiSelector.value){
    case "openrouter":
        openrouterKeyInput.value = config.textGenerationApiConnection.key;
        openrouterModelInput.value = config.textGenerationApiConnection.model;
        openrouterInstructModeCheckbox.checked = config.textGenerationApiConnection.forceInstruct;
        break;
    case "openai":
        openaiKeyInput.value = config.textGenerationApiConnection.key;
        openaiModelSelect.value = config.textGenerationApiConnection.model;
        break;
    case "ooba":
        oobaUrlInput.value = config.textGenerationApiConnection.baseUrl;
        break;
    default:
        //TODO ERROR
}

runPathInput.value = config.userFolderPath;

apiSelector.addEventListener("change", displaySelectedApiBox)



document.addEventListener('change', () =>{
    
    switch(apiSelector.value){
        case "openrouter":
            config.textGenerationApiConnection = new ApiConnection({
                type: "openrouter",
                baseUrl: "https://openrouter.ai/api/v1",
                key: openrouterKeyInput.value,
                model: openrouterModelInput.value,
                forceInstruct: openrouterInstructModeCheckbox.checked
            })
            break;
        case "openai":
            config.textGenerationApiConnection = new ApiConnection({
                type: "openai",
                baseUrl: "https://api.openai.com/v1",
                key: openaiKeyInput.value,
                model: openaiModelSelect.value,
                forceInstruct: false
            })
            break;
        case "ooba":
            config.textGenerationApiConnection = new ApiConnection({
                type: "ooba",
                baseUrl: oobaUrlInput.value,
                key: "111111111111111111111111",
                model: "string",
                forceInstruct: false
            })
            break;
        default:
            //TODO ERROR
    }

    console.log(config.textGenerationApiConnection)
    config.userFolderPath =  runPathInput.value;

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

testConnectionButton.addEventListener('click', async ()=>{
    console.log("letsgo")
    let apiConnection = new ApiConnection(config.textGenerationApiConnection);

    let result = await apiConnection.testConnection()
    if(result.success){
        testConnectionSpan.innerText = "Connection success!";
        testConnectionSpan.classList.remove("error-message");
        testConnectionSpan.classList.add("success-message");
    }
    else{
        testConnectionSpan.innerText = "Connection failed! \n"+result.errorMessage;
        testConnectionSpan.classList.remove("success-message");
        testConnectionSpan.classList.add("error-message");
    }
})



runPathButton.addEventListener("click", async ()=>{
    ipcRenderer.send('select-user-folder');
})

ipcRenderer.on('select-user-folder-success', (event, path) =>{
    if(!path || path == "") return;

    runPathInput.value = path;

})










