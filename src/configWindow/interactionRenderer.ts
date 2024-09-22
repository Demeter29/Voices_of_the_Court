import { ipcMain, ipcRenderer, dialog, app} from 'electron';
import { Config } from '../shared/Config';
import  {OpenAI}  from "openai";
import { ApiConnection } from '../shared/apiConnection';
import fs from 'fs';
import path from 'path';

//@ts-ignore
let enableInteractions: HTMLElement = document.querySelector("#enable-interactions").checkbox;
let interactions: HTMLElement = document.querySelector("#interactions")!;
//@ts-ignore
let useConnectionAPI: HTMLElement = document.querySelector("#use-connection-api")!.checkbox;
let apiSelector: HTMLElement = document.querySelector("#api-selector")!;

let interactionsDiv: HTMLDivElement = document.querySelector("#interaction-group")!;

let refreshInteractionsButton: HTMLButtonElement = document.querySelector("#refresh-interactions")!;

let config;
let disabledInteractions:string[];
let interactionsPath: string;

init();

async function init(){
    config = await ipcRenderer.invoke('get-config');

    
     disabledInteractions= config!.disabledInteractions;

    loadInteractions();

    refreshInteractionsButton.addEventListener('click', ()=>{
        loadInteractions();
    })

    let userDataPath = await ipcRenderer.invoke('get-userdata-path');
    
    interactionsPath = path.join(userDataPath, 'scripts', 'actions');


        //init
    toggleApiSelector();
    toggleInteractions();

    enableInteractions.addEventListener('change', () =>{
        
        toggleInteractions();
    })

    useConnectionAPI.addEventListener('change', () =>{
        
        toggleApiSelector();
    })

}




function toggleApiSelector(){
    //@ts-ignore
    if(useConnectionAPI.checked){
        apiSelector.style.opacity = "0.5";
        apiSelector.style.pointerEvents = "none";
    }
    else{
        apiSelector.style.opacity = "1";
        apiSelector.style.pointerEvents = "auto";
    }
}

function toggleInteractions(){
    //@ts-ignore
    if(!enableInteractions.checked){
        interactions.style.opacity = "0.5";
        interactions.style.pointerEvents = "none";
    }
    else{
        interactions.style.opacity = "1";
        interactions.style.pointerEvents = "auto";
    }
}


//interaction selects







async function loadInteractions(){

    interactionsDiv.replaceChildren();

    await sleep(250)
    let standardFileNames = fs.readdirSync(path.join(interactionsPath, 'standard')).filter(file => path.extname(file) === '.js'); 
    let customFileNames = fs.readdirSync(path.join(interactionsPath, 'custom')).filter(file => path.extname(file) === '.js'); 
    

    

    for(const fileName of standardFileNames){

        
        let file  = require(path.join(interactionsPath, 'standard', fileName));
        
        let element = document.createElement("div");

        let isChecked = !disabledInteractions.includes(file.signature);

        element.innerHTML = `
        <input type="checkbox" id="${file.signature}" ${isChecked? "checked" : ""}>
        <label>${file.signature}</label>
        `

        interactionsDiv.appendChild(element);

        element.addEventListener("change", (e: any)=>{
            //@ts-ignore
            if(element.querySelector(`#${file.signature}`)!.checked == false){
                console.log("dsa")
                if(!disabledInteractions.includes(file.signature)){
                    disabledInteractions.push(file.signature);
                }
            }
            else{
                //@ts-ignore
                disabledInteractions = disabledInteractions.filter(e => e !== file.signature);
            }
            console.log(disabledInteractions)
            ipcRenderer.send('config-change', "disabledInteractions", disabledInteractions);
        });     
    }

    for(const fileName of customFileNames){

        
        let file  = require(path.join(interactionsPath, 'custom', fileName));
        
        let element = document.createElement("div");

        let isChecked = !disabledInteractions.includes(file.signature);

        element.innerHTML = `
        <input type="checkbox" id="${file.signature}" ${isChecked? "checked" : ""}>
        <label>${file.signature}</label>
        `

        interactionsDiv.appendChild(element);

        element.addEventListener("change", (e: any)=>{
            //@ts-ignore
            if(element.querySelector(`#${file.signature}`)!.checked == false){
                console.log("dsa")
                if(!disabledInteractions.includes(file.signature)){
                    disabledInteractions.push(file.signature);
                }
            }
            else{
                //@ts-ignore
                disabledInteractions = disabledInteractions.filter(e => e !== file.signature);
            }
            console.log(disabledInteractions)
            ipcRenderer.send('config-change', "disabledInteractions", disabledInteractions);
        });     
    }
}



function sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }