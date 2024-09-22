import fs from 'fs';
import { Parameters, ApiConnection } from './apiConnection';
import path from 'path';
import { IpcRenderer, app, ipcRenderer} from 'electron';

       

export interface ApiConnectionConfig{
    type: string; //openrouter, openai, ooba
    baseUrl: string;
    key: string;
    model: string;
    forceInstruct: boolean ;//only used by openrouter
    
    parameters: Parameters;
}

export class Config{
    userFolderPath: string;

    stream: boolean;
    context: number;
    maxTokens: number;
    maxMemoryTokens: number;
    percentOfContextToSummarize: number;

    overwriteContext: boolean;
    customContext: number;

    selectedDescScript: string;
    selectedExMsgScript: string;

    inputSequence: string;
    outputSequence: string;

    textGenerationApiConnectionConfig: ApiConnectionConfig;
    summarizationApiConnectionConfig: ApiConnectionConfig;
    interactionApiConnectionConfig: ApiConnectionConfig;

    summarizationUseTextGenApi: boolean;
    interactionUseTextGenApi: boolean;

    interactionsEnableAll: boolean;
    disabledInteractions: string[];

    cleanMessages: boolean;
    debugMode: boolean;

    summariesInsertDepth: number;
    memoriesInsertDepth: number;
    descInsertDepth: number;

    mainPrompt: string;
    summarizePrompt: string;
    suffixPrompt: string;
    enableSuffixPrompt: boolean;

    constructor(configPath: string){  
        const obj = JSON.parse(fs.readFileSync(configPath).toString());
       
        this.userFolderPath = obj.userFolderPath;
        this.stream = obj.stream;
        this.context = obj.context;
        this.maxTokens = obj.maxTokens;
        this.maxMemoryTokens = obj.maxMemoryTokens;
        this.percentOfContextToSummarize = obj.percentOfContextToSummarize;

        this.overwriteContext = obj.overwriteContext;
        this.customContext =  obj.customContext,


        this.selectedDescScript = obj.selectedDescScript;
        this.selectedExMsgScript = obj.selectedExMsgScript;

        this.inputSequence = obj.inputSequence;
        this.outputSequence = obj.outputSequence;

        this.textGenerationApiConnectionConfig = obj.textGenerationApiConnectionConfig;
        this.summarizationApiConnectionConfig = obj.summarizationApiConnectionConfig;
        this.interactionApiConnectionConfig = obj.interactionApiConnectionConfig;

        this.summarizationUseTextGenApi = obj.summarizationUseTextGenApi;
        this.interactionUseTextGenApi = obj.interactionUseTextGenApi;

        this.interactionsEnableAll = obj.interactionsEnableAll;
        this.disabledInteractions = obj.disabledInteractions;

        this.cleanMessages = obj.cleanMessages;
        
        this.debugMode = obj.debugMode;

        this.summariesInsertDepth = obj.summariesInsertDepth;
        this.memoriesInsertDepth = obj.memoriesInsertDepth;
        this.descInsertDepth = obj.descInsertDepth;

        this.mainPrompt =  obj.mainPrompt;
        this.summarizePrompt =  obj.summarizePrompt;
        this.suffixPrompt =  obj.suffixPrompt;
        this.enableSuffixPrompt =  obj.enableSuffixPrompt;
        
    }

    export(){
        fs.writeFileSync(path.join(app.getPath('userData'), 'votc_data', 'configs', 'config.json'), JSON.stringify(this, null, '\t'))
    }

    toSafeConfig(): Config{
        //pass by value
        let output: Config = JSON.parse(JSON.stringify(this));
        output.textGenerationApiConnectionConfig.key= "<hidden>";
        output.interactionApiConnectionConfig.key = "<hidden>";
        output.summarizationApiConnectionConfig.key = "<hidden>";
        output.textGenerationApiConnectionConfig.baseUrl= "<hidden>";
        output.interactionApiConnectionConfig.baseUrl = "<hidden>";
        output.summarizationApiConnectionConfig.baseUrl = "<hidden>";

        return output;
    }

}


