import { GameData } from '../../shared/GameData.js';
import  {OpenAI}  from 'openai';
import { Config } from '../../shared/Config.js';
import { ApiConnection } from '../../shared/apiConnection.js';
import { checkInteractions } from './checkInteractions.js';
import { buildTextPrompt, buildChatPrompt, buildSummarizeTextPrompt, buildSummarizeChatPrompt } from './promptBuilder.js';
import { cleanMessageContent } from './messageCleaner.js';
import { summarize } from './summarize.js';
import fs from 'fs';
import path from 'path';

import {Message, MessageChunk, Setting, ResponseObject, ErrorMessage, Summary, Interaction} from '../ts/conversation_interfaces.js';
import { RunFileManager } from '../RunFileManager.js';

export class Conversation{
    gameData: GameData;
    messages: Message[];
    config: Config;
    runFileManager: RunFileManager;
    textGenApiConnection: ApiConnection;
    summarizationApiConnection: ApiConnection;
    interactionApiConnection: ApiConnection;
    setting: Setting;
    description: string;
    interactions: Interaction[];
    exampleMessages: Message[];
    summaries: Summary[];
    textgenParameters: Object;
    
    constructor(gameData: GameData, config: Config){
        this.gameData = gameData;
        this.messages = [];
        this.config = config;
        this.runFileManager = new RunFileManager(config.userFolderPath);
        this.runFileManager.clear();

        this.textgenParameters = {temperature: config.temperature, frequency_penalty: config.frequency_penalty, presence_penalty: config.presence_penalty, top_p: config.top_p};

        delete require.cache[require.resolve(`../../../public/scripts/description/${config.selectedDescScript}`)];
        this.description = require(`../../../public/scripts/description/${config.selectedDescScript}`)(gameData.date, gameData.scene, gameData.location, gameData.characters.get(gameData.playerID), gameData.characters.get(gameData.aiID)); 

        delete require.cache[require.resolve(`../../../public/scripts/example messages/${config.selectedExMsgScript}`)];
        this.exampleMessages= require(`../../../public/scripts/example messages/${config.selectedExMsgScript}`)(gameData.date, gameData.scene, gameData.location, gameData.characters.get(gameData.playerID), gameData.characters.get(gameData.aiID));

        if (!fs.existsSync(`./public/conversation_summaries/${this.gameData.playerID}`)){
            fs.mkdirSync(`./public/conversation_summaries/${this.gameData.playerID}`);
        }
        
        if(fs.existsSync(`./public/conversation_summaries/${this.gameData.playerID}/${this.gameData.aiID}.json`)){
            this.summaries = JSON.parse(fs.readFileSync(`./public/conversation_summaries/${this.gameData.playerID}/${this.gameData.aiID}.json`, 'utf8'));
        }
        else{
            this.summaries = [];
            fs.writeFileSync(`./public/conversation_summaries/${this.gameData.playerID}/${this.gameData.aiID}.json`, JSON.stringify(this.summaries, null, '\t'));
        }

    
        this.interactions = [];
        this.loadInteractions();


        

        this.setting = require(`../../../public/settings/openrouter/mistral.json`);

        this.textGenApiConnection = new ApiConnection(config.textGenerationApiConnection);

        if(this.config.summarizationUseTextGenApi){
            this.summarizationApiConnection = this.textGenApiConnection;
        }
        else{
            this.summarizationApiConnection = new ApiConnection(config.summarizationApiConnection);
        }
        
        if(this.config.interactionUseTextGenApi){;
            this.interactionApiConnection = this.textGenApiConnection;
        }
        else{
            this.interactionApiConnection = new ApiConnection(config.interactionApiConnection);
        }
    }

    pushMessage(message: Message): void{           
        this.messages.push(message);
    }

    async generateNewAIMessage(streamRelay: (arg1: MessageChunk)=> void): Promise<ResponseObject>{
        let responseMessage: Message;

        console.log("Text Gen:");
        if(this.textGenApiConnection.isChat()){
            

            responseMessage= {
                role: "assistant",
                name: this.gameData.aiName,
                content: await this.textGenApiConnection.complete(buildChatPrompt(this), this.config.stream, {
                    stop: [this.gameData.playerName+":", this.gameData.aiName+":", "you:", "user:"],
                    max_tokens: this.config.maxTokens,
                    ...this.textgenParameters,
                },
                streamRelay)
            };  
            
        }
        else{

            responseMessage = {
                role: "assistant",
                name: this.gameData.aiName,
                content: await this.textGenApiConnection.complete(buildTextPrompt(this), this.config.stream, {
                    stop: [this.gameData.playerName+":", this.gameData.playerName+":", "you:", "user:"],
                    ...this.textgenParameters
                },
                streamRelay)
            };
    
        }

        if(this.config.cleanMessages){
            responseMessage.content = cleanMessageContent(responseMessage.content);
        }

        this.pushMessage(responseMessage);

        let responseObject: ResponseObject = {
            message: responseMessage,
            interactions: await checkInteractions(this)
        }

        console.log(responseObject.interactions)

        return responseObject;
    }

    async summarize(){
        this.runFileManager.write("trigger_event = talk_event.9002");
        setTimeout(()=>{
            this.runFileManager.clear();
        }, 500);

        let summary = {
            date: this.gameData.date,
            content: await summarize(this)
        }

        this.summaries.unshift(summary)

        fs.writeFileSync(`./public/conversation_summaries/${this.gameData.playerID}/${this.gameData.aiID}.json`, JSON.stringify(this.summaries, null, '\t'));
    }

    updateConfig(config: Config){
        console.log("config updated!")
        this.config = config;
        this.runFileManager = new RunFileManager(config.userFolderPath);

        this.textgenParameters = {temperature: config.temperature, frequency_penalty: config.frequency_penalty, presence_penalty: config.presence_penalty, top_p: config.top_p};

        this.loadInteractions();
        
        this.setting = require(`../../../public/settings/openrouter/mistral.json`);

        this.textGenApiConnection = new ApiConnection(config.textGenerationApiConnection);

        if(this.config.summarizationUseTextGenApi){
            this.summarizationApiConnection = this.textGenApiConnection;
        }
        else{
            this.summarizationApiConnection = new ApiConnection(config.summarizationApiConnection);
        }
        
        if(this.config.interactionUseTextGenApi){;
            this.interactionApiConnection = this.textGenApiConnection;
        }
        else{
            this.interactionApiConnection = new ApiConnection(config.interactionApiConnection);
        }


    }

    async loadInteractions(){
        this.interactions = [];

        let actionFiles = fs.readdirSync(`./public/actions/`).filter(file => path.extname(file) === ".js");

        for(const file of actionFiles) {
            console.log(file)

            if(this.config.disabledInteractions.includes(path.basename(file).split(".")[0])){
                console.log(file)
                continue;
            }
    
            this.interactions.push(require(`../../../public/actions/${file}`));
            console.log(`added interaction: `+file)
        }
    }

}