import { app } from 'electron';
import { GameData } from '../../shared/GameData.js';
import  {OpenAI}  from 'openai';
import { Config } from '../../shared/Config.js';
import { ApiConnection, Connection, Parameters } from '../../shared/apiConnection.js';
import { checkInteractions } from './checkInteractions.js';
import { convertChatToText, buildChatPrompt, buildSummarizeTextPrompt, buildSummarizeChatPrompt , buildResummarizeChatPrompt} from './promptBuilder.js';
import { cleanMessageContent } from './messageCleaner.js';
import { summarize } from './summarize.js';
import fs from 'fs';
import path from 'path';

import {Message, MessageChunk, ResponseObject, ErrorMessage, Summary, Interaction, InteractionResponse} from '../ts/conversation_interfaces.js';
import { RunFileManager } from '../RunFileManager.js';
const contextLimits = require("../../../public/contextLimits.json");

const userDataPath = path.join(app.getPath('userData'), 'votc_data');

export class Conversation{
    isOpen: boolean;
    gameData: GameData;
    messages: Message[];
    config: Config;
    runFileManager: RunFileManager;
    textGenApiConnection: ApiConnection;
    summarizationApiConnection: ApiConnection;
    interactionApiConnection: ApiConnection;
    description: string;
    interactions: Interaction[];
    exampleMessages: Message[];
    summaries: Summary[];
    currentSummary: string;
    
    constructor(gameData: GameData, config: Config){
        this.isOpen = true;
        this.gameData = gameData;
        this.messages = [];
        this.currentSummary = "";

        this.summaries = [];
        if (!fs.existsSync(path.join(userDataPath, 'conversation_summaries'))){
            fs.mkdirSync(path.join(userDataPath, 'conversation_summaries'));
        }

        if (!fs.existsSync(path.join(userDataPath, 'conversation_summaries', this.gameData.playerID.toString()))){
            fs.mkdirSync(path.join(userDataPath, 'conversation_summaries', this.gameData.playerID.toString()));
        }
        
        if(fs.existsSync(path.join(userDataPath, 'conversation_summaries', this.gameData.playerID.toString(), this.gameData.aiID.toString()+".json"))){
            this.summaries = JSON.parse(fs.readFileSync(path.join(userDataPath, 'conversation_summaries', this.gameData.playerID.toString(), this.gameData.aiID.toString()+".json"), 'utf8'));
        }
        else{
            this.summaries = [];
            fs.writeFileSync(path.join(userDataPath, 'conversation_summaries', this.gameData.playerID.toString(), this.gameData.aiID.toString()+".json"), JSON.stringify(this.summaries, null, '\t'));
        }

        this.config = config;

        //TODO: wtf
        this.runFileManager = new RunFileManager(config.userFolderPath);
        this.description = "";
        this.interactions = [];
        this.exampleMessages = [],

        //TODO:::!!!
        this.textGenApiConnection = new ApiConnection(this.config.textGenerationApiConnectionConfig.connection, this.config.textGenerationApiConnectionConfig.parameters);

        if(this.config.summarizationUseTextGenApi){
            this.summarizationApiConnection = new ApiConnection(this.config.textGenerationApiConnectionConfig.connection, this.config.summarizationApiConnectionConfig.parameters);;
        }
        else{
            this.summarizationApiConnection = new ApiConnection(this.config.summarizationApiConnectionConfig.connection, this.config.summarizationApiConnectionConfig.parameters);
        }
        
        if(this.config.interactionUseTextGenApi){;
            this.interactionApiConnection = new ApiConnection(this.config.textGenerationApiConnectionConfig.connection, this.config.interactionApiConnectionConfig.parameters);;
        }
        else{
            this.interactionApiConnection = new ApiConnection(this.config.interactionApiConnectionConfig.connection, this.config.interactionApiConnectionConfig.parameters);
        }
        
        this.loadConfig();
    }

    pushMessage(message: Message): void{           
        this.messages.push(message);
    }

    async generateNewAIMessage(streamRelay: (arg1: MessageChunk)=> void): Promise<ResponseObject>{
        
        let responseMessage: Message;

        let currentTokens = this.textGenApiConnection.calculateTokensFromChat(buildChatPrompt(this));
        console.log(`current tokens: ${currentTokens}`);

        if(currentTokens > this.textGenApiConnection.context){
            console.log(`Context limit hit, resummarizing conversation! limit:${this.textGenApiConnection.context}`);
            await this.resummarize();
        }


        if(this.textGenApiConnection.isChat()){
            

            responseMessage= {
                role: "assistant",
                name: this.gameData.aiName,
                content: await this.textGenApiConnection.complete(buildChatPrompt(this), this.config.stream, {
                    //stop: [this.gameData.playerName+":", this.gameData.aiName+":", "you:", "user:"],
                    max_tokens: this.config.maxTokens,
                },
                streamRelay)
            };  
            
        }
        //instruct
        else{

            responseMessage = {
                role: "assistant",
                name: this.gameData.aiName,
                content: await this.textGenApiConnection.complete(convertChatToText(buildChatPrompt(this), this.config.inputSequence, this.config.outputSequence), this.config.stream, {
                    stop: [this.config.inputSequence, this.config.outputSequence],
                    max_tokens: this.config.maxTokens,
                },
                streamRelay)
            };
    
        }

        if(this.config.cleanMessages){
            responseMessage.content = cleanMessageContent(responseMessage.content);
        }

        this.pushMessage(responseMessage);

        let collectedInteractions: InteractionResponse[];
        if(this.config.interactionsEnableAll){
            collectedInteractions = await checkInteractions(this);
        }
        else{
            collectedInteractions = [];
        }

        let responseObject: ResponseObject = {
            message: responseMessage,
            interactions: collectedInteractions
        }

        console.log(responseObject.interactions)

        return responseObject;
    }

    async resummarize(){
        let tokensToSummarize = this.textGenApiConnection.context * (this.config.percentOfContextToSummarize / 100)
        console.log(`context: ${this.textGenApiConnection.context} percent to summarize: ${this.config.percentOfContextToSummarize} tokens to summarize: ${tokensToSummarize}`)
            let tokenSum = 0;
            let messagesToSummarize: Message[] = [];

            while(tokenSum < tokensToSummarize && this.messages.length > 0){
                let msg = this.messages.shift()!;
                tokenSum += this.textGenApiConnection.calculateTokensFromMessage(msg);
                console.log("to remove:")
                console.log(msg)
                messagesToSummarize.push(msg);
            }

            if(messagesToSummarize.length > 0){ //prevent infinite loops
                console.log("current summary: "+this.currentSummary)
                this.currentSummary = await this.summarizationApiConnection.complete(buildResummarizeChatPrompt(this, messagesToSummarize), false, {});
                console.log("after current summary: "+this.currentSummary)
            }
    }

    async summarize(){
        this.isOpen = false;
        this.runFileManager.write("trigger_event = talk_event.9002");
        setTimeout(()=>{
            this.runFileManager.clear();
        }, 500);

        if(this.messages.length < 6){
            console.log("Not enough messages for summarization, no summary have been saved from this conversation!");
            return;
        }

        let summary = {
            date: this.gameData.date,
            content: await summarize(this)
        }

        this.summaries.unshift(summary)

        fs.writeFileSync(path.join(userDataPath, 'conversation_summaries', this.gameData.playerID.toString(), this.gameData.aiID.toString()+".json"), JSON.stringify(this.summaries, null, '\t'));
    }

    updateConfig(config: Config){
        console.log("config updated!")
        this.loadConfig();
    }

    loadConfig(){

        console.log(this.config.toSafeConfig());

        this.runFileManager = new RunFileManager(this.config.userFolderPath);
        this.runFileManager.clear();

        this.description = "";
        this.exampleMessages = [];

        const descriptionPath = path.join(userDataPath, 'scripts', 'prompts', 'description', this.config.selectedDescScript)
        try{
            delete require.cache[require.resolve(path.join(descriptionPath))];
            this.description = require(path.join(descriptionPath))(this.gameData.date, this.gameData.scene, this.gameData.location, this.gameData.characters.get(this.gameData.playerID), this.gameData.characters.get(this.gameData.aiID)); 
        }catch(err){
            throw new Error("description script error, your used description script file is not valid! error message:\n"+err);
        }
        const exampleMessagesPath = path.join(userDataPath, 'scripts', 'prompts', 'example messages', this.config.selectedExMsgScript);
        try{
            delete require.cache[require.resolve(path.join(exampleMessagesPath))];
            this.exampleMessages= require(path.join(exampleMessagesPath))(this.gameData.date, this.gameData.scene, this.gameData.location, this.gameData.characters.get(this.gameData.playerID), this.gameData.characters.get(this.gameData.aiID));
        }catch(err){
            throw new Error("example messages script error, your used example messages file is not valid! error message:\n"+err);
        }
    
        this.loadInteractions();

        this.textGenApiConnection = new ApiConnection(this.config.textGenerationApiConnectionConfig.connection, this.config.textGenerationApiConnectionConfig.parameters);

        if(this.config.summarizationUseTextGenApi){
            this.summarizationApiConnection = new ApiConnection(this.config.textGenerationApiConnectionConfig.connection, this.config.summarizationApiConnectionConfig.parameters);;
        }
        else{
            this.summarizationApiConnection = new ApiConnection(this.config.summarizationApiConnectionConfig.connection, this.config.summarizationApiConnectionConfig.parameters);
        }
        
        if(this.config.interactionUseTextGenApi){;
            this.interactionApiConnection = new ApiConnection(this.config.textGenerationApiConnectionConfig.connection, this.config.interactionApiConnectionConfig.parameters);;
        }
        else{
            this.interactionApiConnection = new ApiConnection(this.config.interactionApiConnectionConfig.connection, this.config.interactionApiConnectionConfig.parameters);
        }
       
    }

    async loadInteractions(){
        this.interactions = [];

        const actionsPath = path.join(userDataPath, 'scripts', 'actions');
        let standardActionFiles = fs.readdirSync(path.join(actionsPath, 'standard')).filter(file => path.extname(file) === ".js");
        let customActionFiles = fs.readdirSync(path.join(actionsPath, 'custom')).filter(file => path.extname(file) === ".js");

        for(const file of standardActionFiles) {

            if(this.config.disabledInteractions.includes(path.basename(file).split(".")[0])){
                continue;
            }
    
            this.interactions.push(require(path.join(actionsPath, 'standard', file)));
            console.log(`loaded standard interaction: `+file)
        }

        for(const file of customActionFiles) {

            if(this.config.disabledInteractions.includes(path.basename(file).split(".")[0])){
                continue;
            }
    
            this.interactions.push(require(path.join(actionsPath, 'custom', file)));
            console.log(`loaded custom interaction: `+file)
        }
    }

}