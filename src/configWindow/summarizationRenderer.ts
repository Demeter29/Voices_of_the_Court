import { ipcRenderer} from 'electron';

//@ts-ignore
let useConnectionAPI: HTMLElement = document.querySelector("#use-connection-api")!.checkbox;

let apiSelector: HTMLElement = document.querySelector("#api-selector")!;


//init
document.getElementById("container")!.style.display = "block";

init();

async function init(){
    let config = await ipcRenderer.invoke('get-config');

    toggleApiSelector();

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