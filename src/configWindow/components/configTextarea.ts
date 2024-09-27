import { ipcMain, ipcRenderer } from 'electron';
import { Config } from '../../shared/Config';
import fs from 'fs';
import path from 'path';

const template = document.createElement("template");

function defineTemplate(rows: number, cols: number, placeholder: string){
    return `
    <link rel="stylesheet" href="../../public/configWindow/config.css">
    <style>
    </style>
    <textarea id="prompt" rows="${rows}" cols="${cols}" placeholder="${placeholder}">
        
    </textarea>
    
    `

    
}

    

class ConfigTextarea extends HTMLElement{
    confID: string;
    shadow: any;
    textarea: HTMLTextAreaElement;
    rows: number;
    cols: number;
    placeholder: string

    constructor(){
        super();
        this.confID = this.getAttribute("confID")!;
        this.rows =  parseInt(this.getAttribute("rows")!);
        this.cols = parseInt(this.getAttribute("cols")!);
        this.placeholder = this.getAttribute("placeholder")!;

        this.shadow = this.attachShadow({mode: "open"});
        template.innerHTML = defineTemplate(this.rows, this.cols, this.placeholder);
        this.shadow.append(template.content.cloneNode(true));
        this.textarea = this.shadow.querySelector('#prompt');

        

    }


    static get observedAttributes(){
        return ["confID", "rows", "cols", "placeholder"]
    }

    async connectedCallback(){
        const confID: string = this.confID;

        let config = await ipcRenderer.invoke('get-config');

        //@ts-ignore
        this.textarea.value = config[confID];

        this.textarea.addEventListener("change", (e: any) => {
            console.log(confID)

            ipcRenderer.send('config-change', confID, this.textarea.value);
        });
    }
}




customElements.define("config-textarea", ConfigTextarea);