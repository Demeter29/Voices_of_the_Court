import { ipcMain, ipcRenderer } from "electron";
import { Config } from "../shared/Config";
import fs from 'fs';
import path from 'path';

let descScriptSelect: any = document.querySelector("#description-script-select")!;
let exMessagesScriptSelect: any = document.querySelector("#example-messages-script-select")!;

let scriptSelectorsDiv: HTMLDivElement = document.querySelector("#script-selectors")!;

let suffixPromptCheckbox: any = document.querySelector("#suffix-prompt-checkbox")!;
let suffixPromptTextarea: any = document.querySelector("#suffix-prompt-textarea")!;

//init

let config = new Config();
togglePrompt(suffixPromptCheckbox.checkbox, suffixPromptTextarea.textarea);

populateSelectWithFileNames(descScriptSelect, './custom/scripts/description', '.js');
descScriptSelect.value = config.selectedDescScript;

populateSelectWithFileNames(exMessagesScriptSelect, './custom/scripts/example messages', '.js');
exMessagesScriptSelect.value = config.selectedExMsgScript;

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
    let files = fs.readdirSync(folderPath).filter(file => path.extname(file) === fileExtension);

    for(const file of files) {
        var el = document.createElement("option");
        el.textContent = path.parse(file).name;
        el.value = file;
        selectElement.appendChild(el);
    }

}