import { ipcRenderer} from 'electron';

let appVersionSpan: HTMLElement = document.querySelector("#app-version")!;
let updateButton: HTMLElement = document.querySelector("#update-button")!;
let clearSummariesButton: HTMLElement = document.querySelector("#clear-summaries")!;

document.getElementById("container")!.style.display = "block";

appVersionSpan.innerText = "Current app version: "+require('../../package.json').version;

updateButton.addEventListener('click', ()=>{
    ipcRenderer.send('update-app');
})

clearSummariesButton.addEventListener('click', ()=>{
    ipcRenderer.send('clear-summaries');
})
