import { ipcMain, ipcRenderer } from 'electron';
import { Config } from '../shared/Config';
import fs from 'fs';
import path from 'path';

let maxTokensNumber: any = document.querySelector("#max-tokens-number")!;
let newTokensNumber: any = document.querySelector("#new-tokens-number")!;
let streamingCheckbox: any = document.querySelector("#streaming-checkbox")!;
let cleanMessagesCheckbox: any = document.querySelector("#clean-messages-checkbox")!;

let presetSelect: any =document.querySelector("#preset-select")!;

let temperatureSlider: any = document.querySelector("#temperature-slider")!;
let temperatureNumber: any = document.querySelector("#temperature-number")!;

let frequencyPSlider: any = document.querySelector("#frequency-p-slider")!;
let frequencyPNumber: any = document.querySelector("#frequency-p-number")!;

let presencePSlider: any = document.querySelector("#presence-p-slider")!;
let presencePNumber: any = document.querySelector("#presence-p-number")!;

let topPSlider: any = document.querySelector("#top-p-slider")!;
let topPNumber: any = document.querySelector("#top-p-number")!;

//init

let config = new Config();

maxTokensNumber.value = config.maxTokens;
newTokensNumber.value = config.newTokens;
streamingCheckbox.checked = config.stream;
cleanMessagesCheckbox.checked = config.cleanMessages;

populateSelectWithFileNames(presetSelect, `./public/settings/${config.textGenerationApiConnection.type} settings`, '.json');
let preset = require(`../../public/settings/${config.textGenerationApiConnection.type} settings/${presetSelect.value}`);
 
//temperatureSlider.value = temperatureNumber.value = parameters.temperature;
//frequencyPSlider.value = frequencyPNumber.value = parameters.frequency_penalty;
//presencePSlider.value = presencePNumber.value = parameters.presence_penalty;
//topPSlider.value = topPNumber.value = parameters.top_p;

    

temperatureSlider.addEventListener("input", () =>{
    temperatureNumber.textContent = temperatureSlider.value;
});


frequencyPSlider.addEventListener("input", () =>{
    frequencyPNumber.textContent = frequencyPSlider.value;
});


presencePSlider.addEventListener("input", () =>{
    presencePNumber.textContent = presencePSlider.value;
});

topPSlider.addEventListener("input", () =>{
    topPNumber.textContent = topPSlider.value;
});

document.addEventListener('change', ()=>{
    config.maxTokens = maxTokensNumber.value;
    config.newTokens = newTokensNumber.value;
    config.stream = streamingCheckbox.checked;
    config.cleanMessages = cleanMessagesCheckbox.checked;

    ipcRenderer.send('config-change', config);
    config.export();
})

//functions

function populateSelectWithFileNames(selectElement: HTMLSelectElement, folderPath: string, fileExtension: string, ): void {
    let files = fs.readdirSync(folderPath).filter(file => path.extname(file) === fileExtension);

    for(const file of files) {
        var el = document.createElement("option");
        el.textContent = path.parse(file).name;
        el.value = file;
        selectElement.appendChild(el);
    }

}