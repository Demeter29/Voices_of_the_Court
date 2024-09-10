import { ipcMain, ipcRenderer, shell } from 'electron';
import { Config } from '../../shared/Config';
import fs from 'fs';
import path from 'path';

const template = document.createElement("template");

function defineTemplate(path: string){
    return `
    <link rel="stylesheet" href="../../public/configWindow/launcher.css">
    <style>
    </style>
    <button type="button">Open folder</button>
    `
}

    

class openFolderButton extends HTMLElement{
    path: string;
    shadow: any;
    button: any;

    constructor(){
        super();
        this.path = this.getAttribute("path")!;

        this.shadow = this.attachShadow({mode: "open"});
        template.innerHTML = defineTemplate(this.path);
        this.shadow.append(template.content.cloneNode(true));
        this.button = this.shadow.querySelector("button");

        

    }


    static get observedAttributes(){
        return ["name", "confID", "path",]
    }

    connectedCallback(){

        this.button.addEventListener("click", (e: any) => {
            

            //ipcRenderer.send('open-folder', this.path);
            shell.openPath(path.resolve(this.path))
        });
    }
}




customElements.define("open-folder-button", openFolderButton);