import { ipcMain, ipcRenderer } from 'electron';
import { Config } from '../../shared/Config';
import fs from 'fs';
import path from 'path';

const template = document.createElement("template");

function defineTemplate(label: string){
    return `
    <link rel="stylesheet" href="../../public/configWindow/launcher.css">
    <style>
    </style>
    <input type="checkbox" name="awd" id="checkbox">
    <label for="awd">${label}</label>`
}

    

class ConfigCheckbox extends HTMLElement{
    label: string;
    confID: string;
    shadow: any;
    checkbox: any;

    constructor(){
        super();
        this.label = this.getAttribute("label")!;
        this.confID = this.getAttribute("confID")!;

        this.shadow = this.attachShadow({mode: "open"});
        template.innerHTML = defineTemplate(this.label);
        this.shadow.append(template.content.cloneNode(true));
        this.checkbox = this.shadow.querySelector("input");

        

    }


    static get observedAttributes(){
        return ["name", "confID", "label"]
    }

    async connectedCallback(){
        const confID: string = this.confID;

        let config = await ipcRenderer.invoke('get-config');

        //@ts-ignore
        this.checkbox.checked = config[confID];

        this.checkbox.addEventListener("change", (e: any) => {
            console.log(confID)

            ipcRenderer.send('config-change', confID, this.checkbox.checked);
        });
    }
}




customElements.define("config-checkbox", ConfigCheckbox);