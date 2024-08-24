import { GameData } from '../../shared/GameData.js';
import  {OpenAI}  from 'openai';
import { Config } from '../../shared/Config.js';
import { ApiConnection } from '../../shared/apiConnection.js';
import { checkInteractions } from './checkInteractions.js';
import { convertChatToText, buildChatPrompt, buildSummarizeTextPrompt, buildSummarizeChatPrompt } from './promptBuilder.js';
import { cleanMessageContent } from './messageCleaner.js';
import { summarize } from './summarize.js';
import fs from 'fs';
import path from 'path';

import {Message, MessageChunk, Setting, ResponseObject, ErrorMessage, Summary, Interaction} from '../ts/conversation_interfaces.js';
import { RunFileManager } from '../RunFileManager.js';

export class Conversation{
    isOpen: boolean;
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
        this.isOpen = true;
        this.gameData = gameData;
        this.messages = [];
        this.config = config;
        this.runFileManager = new RunFileManager(config.userFolderPath);
        this.runFileManager.clear();

        this.textgenParameters = {temperature: config.temperature, frequency_penalty: config.frequency_penalty, presence_penalty: config.presence_penalty, top_p: config.top_p};


        delete require.cache[require.resolve(process.cwd()+`/custom/scripts/description/${config.selectedDescScript}`)];
        this.description = require(process.cwd()+`/custom/scripts/description/${config.selectedDescScript}`)(gameData.date, gameData.scene, gameData.location, gameData.characters.get(gameData.playerID), gameData.characters.get(gameData.aiID)); 

        delete require.cache[require.resolve(process.cwd()+`/custom/scripts/example messages/${config.selectedExMsgScript}`)];
        this.exampleMessages= require(process.cwd()+`/custom/scripts/example messages/${config.selectedExMsgScript}`)(gameData.date, gameData.scene, gameData.location, gameData.characters.get(gameData.playerID), gameData.characters.get(gameData.aiID));

        if (!fs.existsSync(process.cwd()+`/conversation_summaries`)){
            fs.mkdirSync(process.cwd()+`/conversation_summaries`);
        }

        if (!fs.existsSync(`${process.cwd()}/conversation_summaries/${this.gameData.playerID}`)){
            fs.mkdirSync(`${process.cwd()}/conversation_summaries/${this.gameData.playerID}`);
        }
        
        if(fs.existsSync(`${process.cwd()}/conversation_summaries/${this.gameData.playerID}/${this.gameData.aiID}.json`)){
            this.summaries = JSON.parse(fs.readFileSync(`${process.cwd()}/conversation_summaries/${this.gameData.playerID}/${this.gameData.aiID}.json`, 'utf8'));
        }
        else{
            this.summaries = [];
            fs.writeFileSync(`${process.cwd()}/conversation_summaries/${this.gameData.playerID}/${this.gameData.aiID}.json`, JSON.stringify(this.summaries, null, '\t'));
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

        console.log(this.config.toSafeConfig());
    }

    pushMessage(message: Message): void{           
        this.messages.push(message);
    }

    async generateNewAIMessage(streamRelay: (arg1: MessageChunk)=> void): Promise<ResponseObject>{
        let responseMessage: Message;

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
        //instruct
        else{

            responseMessage = {
                role: "assistant",
                name: this.gameData.aiName,
                content: await this.textGenApiConnection.complete(convertChatToText(buildChatPrompt(this), this.config.inputSequence, this.config.outputSequence), this.config.stream, {
                    stop: [this.config.inputSequence, this.config.outputSequence],
                    max_tokens: this.config.maxTokens,
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
        this.isOpen = false;
        this.runFileManager.write("trigger_event = talk_event.9002");
        setTimeout(()=>{
            this.runFileManager.clear();
        }, 500);

        if(this.messages.length < 2){
            return;
        }

        let summary = {
            date: this.gameData.date,
            content: await summarize(this)
        }

        this.summaries.unshift(summary)

        fs.writeFileSync(`${process.cwd()}/conversation_summaries/${this.gameData.playerID}/${this.gameData.aiID}.json`, JSON.stringify(this.summaries, null, '\t'));
    }

    updateConfig(config: Config){
        console.log("config updated!")
        console.log(config.toSafeConfig());
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

        let actionFiles = fs.readdirSync(`${process.cwd()}/custom/actions/`).filter(file => path.extname(file) === ".js");

        for(const file of actionFiles) {

            if(this.config.disabledInteractions.includes(path.basename(file).split(".")[0])){
                continue;
            }
    
            this.interactions.push(require(`${process.cwd()}/custom/actions/${file}`));
            console.log(`loaded interaction: `+file)
        }
    }

}