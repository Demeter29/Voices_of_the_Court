import { ipcMain, ipcRenderer } from 'electron';
import { Config } from '../shared/Config';

let enableAllCheckbox: HTMLInputElement = document.querySelector("#enable-interactions")!;
let openaiApiKeyInput: HTMLInputElement = document.querySelector("#api-key")!;
let openaiApiSaveButton: HTMLButtonElement = document.querySelector("#api-key-save")!;
let modelSelect: HTMLSelectElement = document.querySelector("#model-select")!;
let relationModifierCheckbox: HTMLInputElement = document.querySelector("#relation-modifier")!;
let goldExchangeCheckbox: HTMLInputElement = document.querySelector("#gold-exchange")!;

let interactionMenuDiv: HTMLDivElement = document.querySelector(".interactionMenu")!;
let containerDiv: HTMLDivElement = document.querySelector(".container")!;

/*
try{
    let conf = readInteractionConfigs();
    enableAllCheckbox.checked = conf.enableAll
    openaiApiKeyInput.value = readOpenAIConfig().api_key;
    modelSelect.value = conf.model
    relationModifierCheckbox.checked = conf.relationModifier
    goldExchangeCheckbox.checked = conf.goldExchange
    
    if(!enableAllCheckbox.checked){
        toggleInteractionCheckboxes(true)
    }
}catch(err){

}
*/

enableAllCheckbox.addEventListener("change", ()=>{
    if(enableAllCheckbox.checked){
        toggleInteractionCheckboxes(false)
    }else{
        toggleInteractionCheckboxes(true)
    }
})

containerDiv.addEventListener('change', ()=>{
    let conf = {
        "enableAll": enableAllCheckbox.checked,
        "model": modelSelect.value,
        "relationModifier": relationModifierCheckbox.checked,
        "goldExchange": goldExchangeCheckbox.checked,
    }
    //writeInteractionConfigs(conf)
})


function toggleInteractionCheckboxes(isDisabled: boolean){
    openaiApiKeyInput.disabled = isDisabled
    openaiApiSaveButton.disabled = isDisabled
    modelSelect.disabled = isDisabled
    relationModifierCheckbox.disabled = isDisabled
    goldExchangeCheckbox.disabled = isDisabled

    if(isDisabled){
        interactionMenuDiv.style.opacity = "0.5";
    }
    else{
        interactionMenuDiv.style.opacity = "1";
    }
}








