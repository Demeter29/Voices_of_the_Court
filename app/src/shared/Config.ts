import fs from 'fs';
import { ApiConnection } from './apiConnection';

interface openaiParameters {
    max_tokens: number,
    temperature: number,
    frequency_penalty: number,
    presence_penalty: number,
    top_p: number
}

interface openRouterParameters {
    max_tokens: number,
    temperature: number;
    frequency_penalty: number;
    presence_penalty: number;
    repetition_penalty: number;
    top_k: number;
    top_p: number;
    min_p: number,
    min_k: number;

}

//docs: https://github.com/oobabooga/text-generation-webui/wiki/03-%E2%80%90-Parameters-Tab
interface oobaParameters {
    max_new_tokens: number;
    temperature: number,
    top_p: number,
    //min_p
    top_k: number,
    //repetition_penalty
    //presence_penalty
    //frequency_penalty
    repetition_penalty_range: number,
    typical_p: number,
    tfs: number,
    top_a: number,
    epsilon_cutoff: number,
    eta_cutoff: number,
    //guidance_scale
    //Negative prompt
    penalty_alpha: number,
    mirostat_mode: number,
    mirostat_tau: number,
    mirostat_eta: number,
    //dynamic_temperature
    //temperature_last
    do_sample: boolean,
    //Seed
    encoder_repetition_penalty: number,
    no_repeat_ngram_size: number,
    min_length: number,
    num_beams: number,
    length_penalty: number,
    early_stopping: boolean,
}



export class Config{
    userFolderPath: string;

    stream: boolean;
    maxTokens: number;
    newTokens: number;

    selectedDescScript: string;
    selectedExMsgScript: string;

    textGenerationApiConnection: ApiConnection;
    summarizationApiConnection: ApiConnection;
    interactionApiConnection: ApiConnection;

    summarizationUseTextGenApi: boolean;
    interactionUseTextGenApi: boolean;

    interactionsEnableAll: boolean;
    disabledInteractions: string[];
    interactionsModel: string;
    interactionsRelations: boolean;


    cleanMessages: boolean;
    descInsertDepth: number;
    debugMode: boolean;

    mainPrompt: string;
    summarizePrompt: string;
    nsfwPrompt: string;
    jailbreakPrompt: string;
    nsfwPromptEnable: boolean;
    jailbreakPromptEnable: boolean;

    constructor(){
        const obj = JSON.parse(fs.readFileSync('./configs/config.json').toString());

        this.userFolderPath = obj.userFolderPath;
        this.stream = obj.stream;
        this.maxTokens = obj.maxTokens;
        this.newTokens = obj.newTokens;
        this.selectedDescScript = obj.selectedDescScript;
        this.selectedExMsgScript = obj.selectedExMsgScript;

        this.textGenerationApiConnection = new ApiConnection(obj.textGenerationApiConnection);
        this.summarizationApiConnection = new ApiConnection(obj.summarizationApiConnection);
        this.interactionApiConnection = new ApiConnection(obj.interactionApiConnection);

        this.summarizationUseTextGenApi = obj.summarizationUseTextGenApi;
        this.interactionUseTextGenApi = obj.interactionUseTextGenApi;

        this.interactionsEnableAll = obj.interactionsEnableAll;
        this.disabledInteractions = obj.disabledInteractions;
        this.interactionsModel = obj.interactionsModel;
        this.interactionsRelations = obj.interactionsRelations;

        this.cleanMessages = obj.cleanMessages;
        this.descInsertDepth = obj.descInsertDepth;
        this.debugMode = obj.debugMode;

        this.mainPrompt =  obj.mainPrompt;
        this.summarizePrompt =  obj.summarizePrompt;
        this.nsfwPrompt =  obj.nsfwPrompt;
        this.jailbreakPrompt =  obj.jailbreakPrompt;
        this.nsfwPromptEnable = obj.nsfwPromptEnable;
        this.jailbreakPromptEnable = obj.jailbreakPromptEnable;
    }

    export(){
        fs.writeFileSync('./configs/config.json', JSON.stringify(this, null, '\t'))
    }

}



/*

// Connection
export function readConnectionConfig(){ 
    return JSON.parse(fs.readFileSync('./configs/connection.config.json').toString())
};

export function writeConnectionConfig(config: Object){
    fs.writeFileSync('./configs/connection.config.json', JSON.stringify(config))
}

//Interactions

export function readInteractionConfigs(){
    return JSON.parse(fs.readFileSync('./configs/interactions.config.json').toString())
}

export function writeInteractionConfigs(config : Object){
    fs.writeFileSync('./configs/interactions.config.json', JSON.stringify(config))
}

//OpenAi

export function readOpenAIConfig(){
    return JSON.parse(fs.readFileSync('./configs/openai.config.json').toString())
}

export function writeOpenAIConfig(config: Object){
    fs.writeFileSync('./configs/openai.config.json', JSON.stringify(config))
}

export function resetOpenAIConfig(){
    let defParams = JSON.parse(fs.readFileSync('./configs/default/default_parameters.openai.config.json').toString());
    //console.log(defParams)
    let conf = readOpenAIConfig();
    conf.parameters = defParams;
    fs.writeFileSync('./configs/openai.config.json', JSON.stringify(conf))
}

export function writeOAIApiKeyToConfig(apiKey: string){
    let oaiConf = readOpenAIConfig();
    oaiConf.api_key = apiKey;
    fs.writeFileSync('./configs/openai.config.json', JSON.stringify(oaiConf))
}

export function writeOAIModelToConfig(model: string){
    let oaiConf = readOpenAIConfig();
    oaiConf.model = model;
    fs.writeFileSync('./configs/openai.config.json', JSON.stringify(oaiConf))
}

// Ooba

export function readOobaConfig(){
    return JSON.parse(fs.readFileSync('./configs/ooba.config.json').toString())
}

export function writeOobaConfig(config: Object){
    fs.writeFileSync('./configs/ooba.config.json', JSON.stringify(config))
}

*/



