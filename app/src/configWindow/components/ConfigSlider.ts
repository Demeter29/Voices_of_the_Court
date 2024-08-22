import { ipcMain, ipcRenderer } from 'electron';
import { Config } from '../../shared/Config';
import fs from 'fs';
import path from 'path';

const template = document.createElement("template");

function defineTemplate(label: string, min: number, max: number, step: number){
    return `
    <link rel="stylesheet" href="../../public/configWindow/launcher.css">
    <style>
    </style>
    <div>
        <label for="awd">${label}</label><br>
        <input type="range" id="slider"  min=${min} max=${max} step=${step}>
        <input type="number" id="number" min=${min} max=${max} />
    </div>
    
    `

    
}

    

class ConfigSlider extends HTMLElement{
    label: string;
    confID: string;
    shadow: any;
    slider: any;
    number: any;
    min: number;
    max: number;
    step: number;

    constructor(){
        super();
        this.label = this.getAttribute("label")!;
        this.confID = this.getAttribute("confID")!;
        this.min =  parseInt(this.getAttribute("min")!);
        this.max = parseInt(this.getAttribute("max")!);
        this.step = parseFloat(this.getAttribute("step")!);

        this.shadow = this.attachShadow({mode: "open"});
        template.innerHTML = defineTemplate(this.label, this.min, this.max, this.step);
        this.shadow.append(template.content.cloneNode(true));
        this.slider = this.shadow.querySelector('#slider');
        this.number = this.shadow.querySelector("#number");

        

    }


    static get observedAttributes(){
        return ["confID", "label", "min", "max", "step"]
    }

    connectedCallback(){
        const confID: string = this.confID;

        let config = new Config();

        //@ts-ignore
        this.slider.value = config[confID];
        //@ts-ignore
        this.number.value = config[confID];

        this.slider.addEventListener("input", (e: any) => {
            this.number.value = this.slider.value;
        })

        this.slider.addEventListener("change", (e: any) => {
            console.log(confID)

            this.number.value = this.slider.value;

            ipcRenderer.send('config-change', confID, parseFloat(this.number.value));
        });

        this.number.addEventListener("change", (e: any) => {
            console.log(confID)

            this.slider.value = this.number.value;

            ipcRenderer.send('config-change', confID, parseFloat(this.number.value));
        });
    }
}




customElements.define("config-slider", ConfigSlider);