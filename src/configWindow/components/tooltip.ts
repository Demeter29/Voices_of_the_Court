import { Config } from '../../shared/Config';

const template = document.createElement("template");

function defineTemplate(side:string){
    return `
    <link rel="stylesheet" href="../../public/configWindow/config.css"/>
    <style>
    </style>
    <div class="tooltip tooltip-${side}"> <img src="../../public/assets/tooltip2.png" height="15" wdith="15">
        <span class="tooltiptext tooltiptext-${side}"><slot></slot></span>
    </div>
    `
}

    

class Tooltip extends HTMLElement{
    shadow: any;
    side: string;

    constructor(){
        super();
        this.side = this.getAttribute("side")!;
        this.shadow = this.attachShadow({mode: "open"});
        template.innerHTML = defineTemplate(this.side);
        this.shadow.append(template.content.cloneNode(true));

        

    }


    static get observedAttributes(){
        return ["side"]
    }

    connectedCallback(){
        
    }
}




customElements.define("tooltip-text", Tooltip);