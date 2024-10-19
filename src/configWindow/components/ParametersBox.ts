import { ipcRenderer } from 'electron';
import { Config } from '../../shared/Config';

const template = document.createElement("template");

function defineTemplate(tempDefault: number, freqPenDefault: number, presPenDefault: number, topPDefault: number, ){
    return `
    <div id="div" class="border">
        <link rel="stylesheet" href="../../public/configWindow/config.css">
        <config-slider id="temp" confID="temperature" label="Temperature"  min="0" max="2" step="0.01" default="${tempDefault}"></config-slider>
        <config-slider id="freqPen" confID="frequency_penalty" label="Frequency Penalty"  min="-2" max="2" step="0.01" default="${freqPenDefault}"></config-slider>
        <config-slider id="presPen" confID="presence_penalty" label="Presence Penalty"  min="-2" max="2" step="0.01" default="${presPenDefault}"></config-slider>
        <config-slider id="topP" confID="top_p" label="top P"  min="0" max="1" step="0.01" default="${topPDefault}"></config-slider>
    </div>
    `
    
}

    

class ParametersBox extends HTMLElement{
    confID: string;
    shadow: any;

    tempDefault: number;
    freqPenDefault: number;
    presPenDefault: number;
    topPDefault: number;

    tempSlider: any;
    freqPenSlider: any;
    presPenSlider: any;
    topPSlider: any;

    div: HTMLDivElement;

    constructor(){
        super();
        this.confID = this.getAttribute("confID")!;

        this.tempDefault = parseFloat(this.getAttribute("tempDefault")!);
        this.freqPenDefault = parseFloat(this.getAttribute("freqPenDefault")!);
        this.presPenDefault = parseFloat(this.getAttribute("presPenDefault")!);
        this.topPDefault = parseFloat(this.getAttribute("topPDefault")!);

        this.shadow = this.attachShadow({mode: "open"});
        template.innerHTML = defineTemplate(this.tempDefault, this.freqPenDefault, this.presPenDefault, this.topPDefault);
        this.shadow.append(template.content.cloneNode(true));

        this.tempSlider = this.shadow.querySelector("#temp");
        this.freqPenSlider = this.shadow.querySelector("#freqPen");
        this.presPenSlider = this.shadow.querySelector("#presPen");
        this.topPSlider = this.shadow.querySelector("#topP");

        this.div = this.shadow.querySelector("#div");

        

    }


    static get observedAttributes(){
        return ["confID", "tempDefault", "freqPenDefault", "presPenDefault", "topPDefault"]
    }

    async connectedCallback(){
        const confID: string = this.confID;

        let config = await ipcRenderer.invoke('get-config');

        //@ts-ignore
        let values = config[confID]["parameters"];

        this.tempSlider.changeValue(values.temperature);
        this.freqPenSlider.changeValue(values.frequency_penalty);
        this.presPenSlider.changeValue(values.presence_penalty);
        this.topPSlider.changeValue(values.top_p);

        //TODO: FIX THIS ABOMINATION
        [this.tempSlider, this.freqPenSlider, this.presPenSlider, this.topPSlider].forEach(element => {
            
            [element.slider, element.number].forEach(el => {
                el.addEventListener("change", (e: any) => {
                    console.log(confID)
    
                    let newParameters = {
                        temperature: parseFloat(this.tempSlider.slider.value),
                        frequency_penalty: parseFloat(this.freqPenSlider.slider.value),
                        presence_penalty: parseFloat(this.presPenSlider.slider.value),
                        top_p: parseFloat(this.topPSlider.slider.value),
                    }
    
                    console.log(newParameters)
    
                    ipcRenderer.send('config-change-nested', confID, "parameters", newParameters);
                });
            })

            element.button.addEventListener("click", (e: any) => {
                console.log(confID)

                let newParameters = {
                    temperature: parseFloat(this.tempSlider.slider.value),
                    frequency_penalty: parseFloat(this.freqPenSlider.slider.value),
                    presence_penalty: parseFloat(this.presPenSlider.slider.value),
                    top_p: parseFloat(this.topPSlider.slider.value),
                }

                console.log(newParameters)

                ipcRenderer.send('config-change-nested', confID, "parameters", newParameters);
            });
        });
    }
}




customElements.define("parameters-box", ParametersBox);