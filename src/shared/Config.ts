import fs from 'fs';
import { Parameters, Connection, ApiConnection } from './apiConnection';
import path from 'path';
import { IpcRenderer, app, ipcRenderer} from 'electron';

       


export interface ApiConnectionConfig{
    connection: Connection;
    parameters: Parameters;
}

export class Config{
    userFolderPath: string;

    stream: boolean;
    maxTokens: number;
    maxMemoryTokens: number;
    percentOfContextToSummarize: number;

    

    selectedDescScript: string;
    selectedExMsgScript: string;

    inputSequence: string;
    outputSequence: string;

    textGenerationApiConnectionConfig: ApiConnectionConfig;
    summarizationApiConnectionConfig: ApiConnectionConfig;
    actionsApiConnectionConfig: ApiConnectionConfig;

    summarizationUseTextGenApi: boolean;
    actionsUseTextGenApi: boolean;

    actionsEnableAll: boolean;
    disabledActions: string[];

    cleanMessages: boolean;
    debugMode: boolean;

    summariesInsertDepth: number;
    memoriesInsertDepth: number;
    descInsertDepth: number;

    mainPrompt: string;
    summarizePrompt: string;
    memoriesPrompt: string;
    suffixPrompt: string;
    enableSuffixPrompt: boolean;

    constructor(configPath: string){  
        const obj = JSON.parse(fs.readFileSync(configPath).toString());

       
        this.userFolderPath = obj.userFolderPath;
        this.stream = obj.stream;
        this.maxTokens = obj.maxTokens;
        this.maxMemoryTokens = obj.maxMemoryTokens;
        this.percentOfContextToSummarize = obj.percentOfContextToSummarize;


        this.selectedDescScript = obj.selectedDescScript;
        this.selectedExMsgScript = obj.selectedExMsgScript;

        this.inputSequence = obj.inputSequence;
        this.outputSequence = obj.outputSequence;

        this.textGenerationApiConnectionConfig = obj.textGenerationApiConnectionConfig;
        this.summarizationApiConnectionConfig = obj.summarizationApiConnectionConfig;
        this.actionsApiConnectionConfig = obj.actionsApiConnectionConfig;

        this.summarizationUseTextGenApi = obj.summarizationUseTextGenApi;
        this.actionsUseTextGenApi = obj.actionsUseTextGenApi;

        this.actionsEnableAll = obj.actionsEnableAll;
        this.disabledActions = obj.disabledActions;

        this.cleanMessages = obj.cleanMessages;
        
        this.debugMode = obj.debugMode;

        this.summariesInsertDepth = obj.summariesInsertDepth;
        this.memoriesInsertDepth = obj.memoriesInsertDepth;
        this.descInsertDepth = obj.descInsertDepth;

        this.mainPrompt =  obj.mainPrompt;
        this.summarizePrompt =  obj.summarizePrompt;
        this.memoriesPrompt = obj.memoriesPrompt;
        this.suffixPrompt =  obj.suffixPrompt;
        this.enableSuffixPrompt =  obj.enableSuffixPrompt;
        
    }

    export(){
        fs.writeFileSync(path.join(app.getPath('userData'), 'votc_data', 'configs', 'config.json'), JSON.stringify(this, null, '\t'))
    }

    toSafeConfig(): Config{
        //pass by value
        let output: Config = JSON.parse(JSON.stringify(this));
        output.textGenerationApiConnectionConfig.connection.key= "<hidden>";
        output.actionsApiConnectionConfig.connection.key = "<hidden>";
        output.summarizationApiConnectionConfig.connection.key = "<hidden>";
        output.textGenerationApiConnectionConfig.connection.baseUrl= "<hidden>";
        output.actionsApiConnectionConfig.connection.baseUrl = "<hidden>";
        output.summarizationApiConnectionConfig.connection.baseUrl = "<hidden>";

        return output;
    }

}


