import { ipcMain, ipcRenderer , app} from "electron";
import { Config } from "../shared/Config";
import fs from 'fs';
import path from 'path';

let descScriptSelect: any = document.querySelector("#description-script-select")!;
let exMessagesScriptSelect: any = document.querySelector("#example-messages-script-select")!;

let scriptSelectorsDiv: HTMLDivElement = document.querySelector("#script-selectors")!;

let suffixPromptCheckbox: any = document.querySelector("#suffix-prompt-checkbox")!;
let suffixPromptTextarea: any = document.querySelector("#suffix-prompt-textarea")!;

//init




init();

async function init(){

    let config = await ipcRenderer.invoke('get-config');

    const userDataPath = await ipcRenderer.invoke('get-userdata-path');
    populateSelectWithFileNames(descScriptSelect, path.join(userDataPath, 'scripts', 'prompts', 'description'), '.js');
    descScriptSelect.value = config.selectedDescScript;

    populateSelectWithFileNames(exMessagesScriptSelect,  path.join(userDataPath, 'scripts', 'prompts', 'example messages'), '.js');
    exMessagesScriptSelect.value = config.selectedExMsgScript;

    togglePrompt(suffixPromptCheckbox.checkbox, suffixPromptTextarea.textarea);

    //events

    descScriptSelect.addEventListener('change', () =>{

        ipcRenderer.send('config-change', "selectedDescScript", descScriptSelect.value);
    })

    exMessagesScriptSelect.addEventListener('change', () =>{

        ipcRenderer.send('config-change', "selectedExMsgScript", exMessagesScriptSelect.value);
    })




    suffixPromptCheckbox.checkbox.addEventListener('change', () =>{
        togglePrompt(suffixPromptCheckbox.checkbox, suffixPromptTextarea.textarea);
    })
}



//functions

function togglePrompt(checkbox: HTMLInputElement, textarea: HTMLTextAreaElement){
    
    if(checkbox.checked){
        textarea.style.opacity = "1";
        textarea.disabled = false;
    }
    else{
        textarea.style.opacity = "0.5";
        textarea.disabled = true;
    }
}

function populateSelectWithFileNames(selectElement: HTMLSelectElement, folderPath: string, fileExtension: string, ): void {
    let standardFiles = fs.readdirSync(path.join(folderPath, 'standard')).filter(file => path.extname(file) === fileExtension);
    let customFiles = fs.readdirSync(path.join(folderPath, 'custom')).filter(file => path.extname(file) === fileExtension);

    for(const file of standardFiles) {
        var el = document.createElement("option");
        el.textContent = path.parse(file).name;
        el.value = path.join('standard', file);
        selectElement.appendChild(el);
    }

    for(const file of customFiles) {
        var el = document.createElement("option");
        el.textContent = path.parse(file).name;
        el.value = path.join('custom', file);
        selectElement.appendChild(el);
    }

}