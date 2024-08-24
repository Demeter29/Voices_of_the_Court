import fs from 'fs';
import { ApiConnection } from './apiConnection';
/*
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
    early_stop_ping: boolean,
}

*/

export class Config{
    userFolderPath: string;

    stream: boolean;
    context: number;
    maxTokens: number;
    newTokens: number;
    maxMemoryTokens: number;

    temperature: number;
    frequency_penalty: number;
    presence_penalty: number;
    top_p: number;

    selectedDescScript: string;
    selectedExMsgScript: string;

    inputSequence: string;
    outputSequence: string;

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
        this.context = obj.context;
        this.maxTokens = obj.maxTokens;
        this.newTokens = obj.newTokens;
        this.maxMemoryTokens = obj.maxMemoryTokens;

        this.temperature = obj.temperature;
        this.frequency_penalty = obj.frequency_penalty;
        this.presence_penalty = obj.presence_penalty;
        this.top_p = obj.top_p;

        this.selectedDescScript = obj.selectedDescScript;
        this.selectedExMsgScript = obj.selectedExMsgScript;

        this.inputSequence = obj.inputSequence;
        this.outputSequence = obj.outputSequence;

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

    toSafeConfig(): Config{
        let output: Config = JSON.parse(JSON.stringify(this));
        output.textGenerationApiConnection.key= "<hidden>";
        output.interactionApiConnection.key = "<hidden>";
        output.summarizationApiConnection.key = "<hidden>";
        output.textGenerationApiConnection.baseUrl= "<hidden>";
        output.interactionApiConnection.baseUrl = "<hidden>";
        output.summarizationApiConnection.baseUrl = "<hidden>";

        return output;
    }

}


