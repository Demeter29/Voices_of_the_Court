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
    
    <div class="input-group">
        <label for="connection-api">API</label>
        <select name="connection-api" id="connection-api">
        <option value="openai">OpenAI</option>
        <option value="ooba">Text Gen WebUI (ooba)</option>
        <option value="openrouter">OpenRouter</option>
        <option disabled value="patreon">Patreon (soon!)</option>
        </select> 
    </div>

    <div class="border" id="openai-menu">
        <h2>OpenAI</h2>

        <div class="input-group">
        <label for="api-key">API Key</label>
        <br>
        <input type="text" id="openai-key">
        <button type="button" id="openai-key-save">Save</button>
        </div>
    
        <div class="input-group">
        <label for="openai-model-select">Model</label>
        <select id="openai-model-select">
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Recommended)</option>
            <option value="gpt-4">GPT-4</option>
        </select>
        </div>
    </div>

    <div class="border" id="ooba-menu">
        <h2>Text-Gen-WebUI (Ooba)</h2>

        <div class="input-group">
        <label for="ooba-url">Server URL</label>
        <br>
        <input type="text" id="ooba-url">
        <br>
        <button type="button" id="ooba-url-connect">Connect</button>
        </div>
    
    </div>

    <div class="border" id="openrouter-menu">
        <h2>OpenRouter</h2>

        <div class="input-group">
        <label for="api-key">API Key</label>
        <br>
        <input type="text" id="openrouter-key">
        <button type="button" id="openrouter-key-save">Save</button>
        </div>
    
        <div class="input-group">
        <label for="openrouter-model">Model</label>
        <input type="text" id="openrouter-model">
        <input type="checkbox" id="openrouter-instruct-mode">
        <label for="openrouter-instruct-mode">Force Instruct mode</label>
        </div>

    
    </div>

  <button type="button" id="connection-test-button">Test Connection</button> <span id="connection-test-span"></span>`
}

    

class ApiSelctor extends HTMLElement{
    label: string;
    confID: string;
    shadow: any;
    typeSelector
    checkbox: any;

    openaiDiv: HTMLInputElement
    oobaDiv: HTMLInputElement
    openrouterDiv: HTMLInputElement 

    openaiKeyInput: HTMLInputElement 
    openaiSaveButton: HTMLInputElement 
    openaiModelSelect: HTMLSelectElement 

    oobaUrlInput: HTMLSelectElement 
    oobaUrlConnectButton: HTMLInputElement 

    openrouterKeyInput: HTMLSelectElement 
    openrouterModelInput: HTMLInputElement 
    openrouterInstructModeCheckbox: HTMLInputElement 

    testConnectionButton: HTMLButtonElement 
    testConnectionSpan: HTMLButtonElement 

    runPathButton: HTMLSelectElement 
    runPathInput: HTMLSelectElement

    constructor(){
        super();
        this.label = this.getAttribute("label")!;
        this.confID = this.getAttribute("confID")!;

        this.shadow = this.attachShadow({mode: "open"});
        template.innerHTML = defineTemplate(this.label);
        this.shadow.append(template.content.cloneNode(true));
        this.checkbox = this.shadow.querySelector("input");
        
        this.typeSelector = this.shadow.querySelector("#connection-api")!;

        this.openaiDiv = this.shadow.querySelector("#openai-menu")!;
        this.oobaDiv = this.shadow.querySelector("#ooba-menu")!;
        this.openrouterDiv = this.shadow.querySelector("#openrouter-menu")!;

        this.openaiKeyInput = this.shadow.querySelector("#openai-key")!;
        this.openaiSaveButton = this.shadow.querySelector("#openai-key-save")!;
        this.openaiModelSelect = this.shadow.querySelector("#openai-model-select")!;

        this.oobaUrlInput = this.shadow.querySelector("#ooba-url")!;
        this.oobaUrlConnectButton = this.shadow.querySelector("#ooba-url-connect")!;

        this.openrouterKeyInput = this.shadow.querySelector("#openrouter-key")!;
        this.openrouterModelInput = this.shadow.querySelector("#openrouter-model")!;
        this.openrouterInstructModeCheckbox = this.shadow.querySelector("#openrouter-instruct-mode")!;

        this.testConnectionButton = this.shadow.querySelector("#connection-test-button")!;
        this.testConnectionSpan = this.shadow.querySelector("#connection-test-span")!;

        this.runPathButton = this.shadow.querySelector("#run-path-button")!;
        this.runPathInput = this.shadow.querySelector("#run-path-input")!;
    }


    static get observedAttributes(){
        return ["name", "confID", "label"]
    }

    connectedCallback(){
        const confID: string = this.confID;

        let config = new Config();

        //@ts-ignore
        this.typeSelector.value = config[confID].type;

        this.displaySelectedApiBox();

        this.checkbox.addEventListener("change", (e: any) => {
            console.log(confID)

            ipcRenderer.send('config-change', confID, this.checkbox.checked);
        });
    }

    displaySelectedApiBox(){
        switch (this.typeSelector.value) {
            case 'openai':  
                this.openaiDiv.style.display = "block";
                this.oobaDiv.style.display = "none";
                this.openrouterDiv.style.display = "none";
                break;
            case 'ooba':
                this.openaiDiv.style.display = "none";
                this.oobaDiv.style.display = "block";
                this.openrouterDiv.style.display = "none";
                break;
            case 'openrouter':
                this.openaiDiv.style.display = "none";
                this.oobaDiv.style.display = "none";
                this.openrouterDiv.style.display = "block";
                break;
        }
    }
}




customElements.define("config-api-selector", ApiSelctor);