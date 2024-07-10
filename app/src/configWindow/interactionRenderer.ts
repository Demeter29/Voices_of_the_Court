import { ipcMain, ipcRenderer, dialog} from 'electron';
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


//init
toggleApiSelector();
toggleInteractions();

enableInteractions.addEventListener('change', () =>{
    
    toggleInteractions();
})

useConnectionAPI.addEventListener('change', () =>{
    
    toggleApiSelector();
})


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





let config = new Config();

let disabledInteractions = config.disabledInteractions;

loadInteractions();

refreshInteractionsButton.addEventListener('click', ()=>{
    loadInteractions();
})

async function loadInteractions(){

    let fileNames = fs.readdirSync('./public/actions').filter(file => path.extname(file) === '.js');
    

    interactionsDiv.innerHTML = '';

    for(const fileName of fileNames){

        
        let file  = require(`../../public/actions/${fileName}`);
        
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
                disabledInteractions = disabledInteractions.filter(e => e !== file.signature);
            }
            console.log(disabledInteractions)
            ipcRenderer.send('config-change', "disabledInteractions", disabledInteractions);
        });
        
        
    }
}



