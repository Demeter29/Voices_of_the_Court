import { ipcRenderer} from 'electron';
import fs, { createReadStream } from 'fs';
import path from 'path';

//@ts-ignore
let enableActions: HTMLElement = document.querySelector("#enable-actions").checkbox;
let actions: HTMLElement = document.querySelector("#actions")!;
//@ts-ignore
let useConnectionAPI: HTMLElement = document.querySelector("#use-connection-api")!.checkbox;
let apiSelector: HTMLElement = document.querySelector("#api-selector")!;

let actionsDiv: HTMLDivElement = document.querySelector("#actions-group")!;
let actionDescriptorDiv: HTMLDivElement = document.querySelector("#action-descriptor")!;

let refreshactionsButton: HTMLButtonElement = document.querySelector("#refresh-actions")!;

let config;
let disabledActions:string[];
let actionsPath: string;

document.getElementById("container")!.style.display = "block";
init();

async function init(){
    config = await ipcRenderer.invoke('get-config');

    
     disabledActions= config!.disabledActions;

    loadactions();

    refreshactionsButton.addEventListener('click', ()=>{
        loadactions();
    })

    let userDataPath = await ipcRenderer.invoke('get-userdata-path');
    
    actionsPath = path.join(userDataPath, 'scripts', 'actions');


        //init
    toggleApiSelector();
    toggleActions();

    enableActions.addEventListener('change', () =>{
        
        toggleActions();
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

function toggleActions(){
    //@ts-ignore
    if(!enableActions.checked){
        actions.style.opacity = "0.5";
        actions.style.pointerEvents = "none";
    }
    else{
        actions.style.opacity = "1";
        actions.style.pointerEvents = "auto";
    }
}


//interaction selects







async function loadactions(){

    actionsDiv.replaceChildren();

    await sleep(250)
    let standardFileNames = fs.readdirSync(path.join(actionsPath, 'standard')).filter(file => path.extname(file) === '.js'); 
    let customFileNames = fs.readdirSync(path.join(actionsPath, 'custom')).filter(file => path.extname(file) === '.js'); 
    

    

    for(const fileName of standardFileNames){   
        let file  = require(path.join(actionsPath, 'standard', fileName));
        
        let element = document.createElement("div");

        let isChecked = !disabledActions.includes(file.signature);

        element.innerHTML = `
        <input type="checkbox" id="${file.signature}" ${isChecked? "checked" : ""}>
        <label>${file.signature}</label>
        `

        actionsDiv.appendChild(element);

        element.addEventListener("change", (e: any)=>{
            //@ts-ignore
            if(element.querySelector(`#${file.signature}`)!.checked == false){
                console.log("dsa")
                if(!disabledActions.includes(file.signature)){
                    disabledActions.push(file.signature);
                }
            }
            else{
                //@ts-ignore
                disabledActions = disabledActions.filter(e => e !== file.signature);
            }
            console.log(disabledActions)
            ipcRenderer.send('config-change', "disabledActions", disabledActions);
        });

        let creatorString = "";
        if(file.creator){
            creatorString = `<li class="action-item"><b>Made by:</b> ${file.creator}</li>`;
        }
        
        element.addEventListener("mouseenter", (e: any)=>{
            actionDescriptorDiv.innerHTML = `
            <h3>${file.signature}</h3>
            <ul>
                <li class="action-item"><b>Description:</b> ${file.description}</li>
                ${creatorString}
            </ul>
            `;
        });
    }

    for(const fileName of customFileNames){   
        let file  = require(path.join(actionsPath, 'custom', fileName));
        
        let element = document.createElement("div");

        let isChecked = !disabledActions.includes(file.signature);

        element.innerHTML = `
        <input type="checkbox" id="${file.signature}" ${isChecked? "checked" : ""}>
        <label>${file.signature}</label>
        `

        actionsDiv.appendChild(element);

        element.addEventListener("change", (e: any)=>{
            //@ts-ignore
            if(element.querySelector(`#${file.signature}`)!.checked == false){
                console.log("dsa")
                if(!disabledActions.includes(file.signature)){
                    disabledActions.push(file.signature);
                }
            }
            else{
                //@ts-ignore
                disabledActions = disabledActions.filter(e => e !== file.signature);
            }
            console.log(disabledActions)
            ipcRenderer.send('config-change', "disabledActions", disabledActions);
        });     
    }
}



function sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }