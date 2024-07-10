import { ipcMain, ipcRenderer } from 'electron';
import { Config } from '../../shared/Config';
import fs from 'fs';
import path from 'path';
import { ApiConnection, apiConnectionTestResult } from '../../shared/apiConnection';

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

    

class ApiSelector extends HTMLElement{
    label: string;
    confID: string;
    shadow: any;
    typeSelector
    checkbox: any;
    config: Config;

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

        this.config = new Config();

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

        //@ts-ignore
        this.typeSelector.value = this.config[confID].type;
        this.displaySelectedApiBox();

        //@ts-ignore
        if(this.config[confID].type == "openai"){
            //@ts-ignore
            this.openaiKeyInput.value = this.config[confID].key;
            //@ts-ignore
            this.openaiModelSelect.value =  this.config[confID].model;
        }
        //@ts-ignore
        else if(this.config[confID].type == "ooba"){
            //@ts-ignore
            this.oobaUrlInput.value = this.config[confID].key;
        }
        //@ts-ignore
        else if(this.config[confID].type == "openrouter"){
            //@ts-ignore
            this.openrouterKeyInput.value = this.config[confID].key;
            //@ts-ignore
            this.openrouterModelInput.value = this.config[confID].model;
            //@ts-ignore
        }
        //@ts-ignore
        this.openrouterInstructModeCheckbox.checked = this.config[confID].forceInstruct;

        this.typeSelector.addEventListener("change", (e: any) => {
            console.log(confID)

            this.displaySelectedApiBox();

            switch(this.typeSelector.value){
                case 'openai': 
                    this.saveOpenaiConfig();
                break;
                case 'ooba': 
                    this.saveOobaConfig();
                break;
                case 'openrouter': 
                    this.saveOpenrouterConfig();
                break;
            }

        });

        this.openaiDiv.addEventListener("change", (e:any) =>{
            this.saveOpenaiConfig();
        })

        this.oobaDiv.addEventListener("change", (e:any) =>{
            this.saveOobaConfig();
        })

        this.openrouterDiv.addEventListener("change", (e:any) =>{
            this.saveOpenrouterConfig();
        })

        this.testConnectionButton.addEventListener('click', async (e:any) =>{
            //@ts-ignore
            let con = new ApiConnection(this.config[this.confID]);

            this.testConnectionSpan.innerText = "...";
            this.testConnectionSpan.style.color = "white";

            con.testConnection().then( (result) =>{

                console.log(result)

                if(result.success){
                    this.testConnectionSpan.innerText = "Connection valid!";
                    this.testConnectionSpan.style.color = "green";
                }
                else{
                    this.testConnectionSpan.innerText = result.errorMessage!;
                    this.testConnectionSpan.style.color = "red";
                }
                
            });
        })

        
        
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

    saveOpenaiConfig(){
        const newConf = {
            type: "openai",
            baseUrl: "https://api.openai.com/v1",
            key: this.openaiKeyInput.value,
            model: this.openaiModelSelect.value,
            forceInstruct: this.openrouterInstructModeCheckbox.checked
        }

        ipcRenderer.send('config-change', this.confID, newConf);
        //@ts-ignore
        this.config[this.confID] = newConf;
    }
    

    //OOBA DIV
    saveOobaConfig(){
        const newConf = {
            type: "ooba",
            baseUrl: this.oobaUrlInput.value,
            key: "11111111111111111111",
            model: "string",
            forceInstruct: this.openrouterInstructModeCheckbox.checked
        }

        ipcRenderer.send('config-change', this.confID, newConf);
        //@ts-ignore
        this.config[this.confID] = newConf;
    }
    

    //OPENROUTER DIV
    saveOpenrouterConfig(){
        const newConf = {
            type: "openrouter",
            baseUrl: "https://openrouter.ai/api/v1",
            key: this.openrouterKeyInput.value,
            model: this.openrouterModelInput.value,
            forceInstruct: this.openrouterInstructModeCheckbox.checked
        }
        ipcRenderer.send('config-change', this.confID, newConf);
        //@ts-ignore
        this.config[this.confID] = newConf;
    }   
    
}




customElements.define("config-api-selector", ApiSelector);