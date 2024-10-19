import { ipcRenderer, shell } from 'electron';
import { Config } from '../../shared/Config';
import path from 'path';

const template = document.createElement("template");

function defineTemplate(path: string, label: string){
    return `
    <link rel="stylesheet" href="../../public/configWindow/config.css">
    <style>
    </style>
    <button type="button">${label}</button>
    `
}

    

class openFolderButton extends HTMLElement{
    path: string;
    label: string;
    shadow: any;
    button: any;

    constructor(){
        super();
        this.path = this.getAttribute("path")!;
        this.label = this.getAttribute("label")!;

        this.shadow = this.attachShadow({mode: "open"});
        template.innerHTML = defineTemplate(this.path, this.label);
        this.shadow.append(template.content.cloneNode(true));
        this.button = this.shadow.querySelector("button");

        

    }


    static get observedAttributes(){
        return ["name", "confID", "path", "label"]
    }

    async connectedCallback(){

       let userdataPath = await ipcRenderer.invoke('get-userdata-path');

        this.button.addEventListener("click", (e: any) => {
            
            
            //ipcRenderer.send('open-folder', this.path);
            shell.openPath(path.resolve(path.join(userdataPath, this.path)));
        }); 
    }
}




customElements.define("open-folder-button", openFolderButton);