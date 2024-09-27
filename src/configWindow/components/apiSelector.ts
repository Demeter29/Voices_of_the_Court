import { ipcMain, ipcRenderer } from 'electron';
import { Config } from '../../shared/Config';
import fs from 'fs';
import path from 'path';
import { ApiConnection, apiConnectionTestResult } from '../../shared/apiConnection';

const template = document.createElement("template");

function defineTemplate(label: string){
    return `
    <link rel="stylesheet" href="../../public/configWindow/config.css">
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
    
    <div class="border">
        <div id="openai-menu">
            <h2>OpenAI</h2>

            <div class="input-group">
            <label for="api-key">API Key</label>
            <br>
            <input type="text" id="openai-key">
            </div>
        
            <div class="input-group">
            <label for="openai-model-select">Model</label>
            <select id="openai-model-select">
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Recommended)</option>
                <option value="gpt-4o">GPT-4-o</option>
            </select>
            </div>
        </div>

        <div id="ooba-menu">
            <h2>Text-Gen-WebUI (Ooba)</h2>

            <div class="input-group">
            <label for="ooba-url">Server URL</label>
            <br>
            <input type="text" id="ooba-url">
            <br>
            </div>
        
        </div>

        <div id="openrouter-menu">
            <h2>OpenRouter</h2>

            <div class="input-group">
            <label for="api-key">API Key</label>
            <br>
            <input type="text" id="openrouter-key">
            </div>
        
            <div class="input-group">
            <label for="openrouter-model">Model</label>
            <input type="text" id="openrouter-model">
            <a href="https://openrouter.ai/models" target="_blank">Browse models..</a>
            </div>

            <div class="input-group">
            <input type="checkbox" id="openrouter-instruct-mode">
            <label for="openrouter-instruct-mode">Force Instruct mode</label>
            </div>
        </div>

        <hr>
        <input type="checkbox" id="overwrite-context"/>
        <label>Overwrite context size</label> <br>
        <input type="number" id="custom-context" min="0" style="width: 10%;"/>
    </div>

  <button type="button" id="connection-test-button">Test Connection</button> <span id="connection-test-span"></span>`
}

    

class ApiSelector extends HTMLElement{
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

    overwriteContextCheckbox: HTMLInputElement;
    customContextNumber: HTMLInputElement;


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

        this.overwriteContextCheckbox = this.shadow.querySelector("#overwrite-context")!;
        this.customContextNumber = this.shadow.querySelector("#custom-context")!;
    }


    static get observedAttributes(){
        return ["name", "confID", "label"]
    }

    async connectedCallback(){
        const confID: string = this.confID;

        let config = await ipcRenderer.invoke('get-config');

        let apiConfig = config[confID].connection;

        //@ts-ignore
        this.typeSelector.value = apiConfig.type;
        this.displaySelectedApiBox();

        //@ts-ignore
        if(apiConfig.type == "openai"){
            //@ts-ignore
            this.openaiKeyInput.value = apiConfig.key;
            //@ts-ignore
            this.openaiModelSelect.value =  apiConfig.model;
        }
        //@ts-ignore
        else if(apiConfig.type == "ooba"){
            //@ts-ignore
            this.oobaUrlInput.value = apiConfig.key;
        }
        //@ts-ignore
        else if(apiConfig.type == "openrouter"){
            //@ts-ignore
            this.openrouterKeyInput.value = apiConfig.key;
            //@ts-ignore
            this.openrouterModelInput.value = apiConfig.model;
            //@ts-ignore
        }
        //@ts-ignore
        this.openrouterInstructModeCheckbox.checked = apiConfig.forceInstruct;

        this.overwriteContextCheckbox.checked = apiConfig.overwriteContext;
        this.customContextNumber.value = apiConfig.customContext;

        

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
            config = await ipcRenderer.invoke('get-config');
            let con = new ApiConnection(config[this.confID].connection, config[this.confID].parameters);

            this.testConnectionSpan.innerText = "...";
            this.testConnectionSpan.style.color = "white";


            con.testConnection().then( (result) =>{

                console.log(result)

                if(result.success){
                    this.testConnectionSpan.style.color = "green";

                    if(result.overwriteWarning){
                        this.testConnectionSpan.innerText = "Connection valid! Warning: context size couldn't be detected, overwrite context size will be used! (even if disabled!)";
                    }else{
                        this.testConnectionSpan.innerText = "Connection valid!";
                    }
                    


                }
                else{
                    this.testConnectionSpan.innerText = result.errorMessage!;
                    this.testConnectionSpan.style.color = "red";
                }
                
            });
        })

        this.toggleCustomContext();

        this.overwriteContextCheckbox.addEventListener('change', ()=>{
            this.toggleCustomContext();

            ipcRenderer.send('config-change-nested-nested', this.confID, "connection", "overwriteContext", this.overwriteContextCheckbox.checked);
        });

        this.customContextNumber.addEventListener('change', ()=>{
            ipcRenderer.send('config-change-nested-nested', this.confID, "connection", "customContext", this.customContextNumber.value);
        })

         
        
    }

    toggleCustomContext(){
        if(this.overwriteContextCheckbox.checked){
            this.customContextNumber.style.opacity = "1";
            this.customContextNumber.disabled = false;
        }
        else{
            this.customContextNumber.style.opacity = "0.5";
            this.customContextNumber.disabled = true;
        }
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
            forceInstruct: this.openrouterInstructModeCheckbox.checked,
            overwriteContext: this.overwriteContextCheckbox.checked,
            customContext: this.customContextNumber.value
        }

        //ipcRenderer.send('config-change', this.confID, newConf);
        ipcRenderer.send('config-change-nested', this.confID, "connection", newConf);
        //@ts-ignore
    }
    

    //OOBA DIV
    saveOobaConfig(){
        const newConf = {
            type: "ooba",
            baseUrl: this.oobaUrlInput.value,
            key: "11111111111111111111",
            model: "string",
            forceInstruct: this.openrouterInstructModeCheckbox.checked,
            overwriteContext: this.overwriteContextCheckbox.checked,
            customContext: this.customContextNumber.value
        }

        //ipcRenderer.send('config-change', this.confID, newConf);
        ipcRenderer.send('config-change-nested', this.confID, "connection", newConf);
        //@ts-ignore
    }
    

    //OPENROUTER DIV
    saveOpenrouterConfig(){
        const newConf = {
            type: "openrouter",
            baseUrl: "https://openrouter.ai/api/v1",
            key: this.openrouterKeyInput.value,
            model: this.openrouterModelInput.value,
            forceInstruct: this.openrouterInstructModeCheckbox.checked,
            overwriteContext: this.overwriteContextCheckbox.checked,
            customContext: this.customContextNumber.value
        }
        //ipcRenderer.send('config-change', this.confID, newConf);
        ipcRenderer.send('config-change-nested', this.confID, "connection", newConf);
        //@ts-ignore
    }   
    
}




customElements.define("config-api-selector", ApiSelector);