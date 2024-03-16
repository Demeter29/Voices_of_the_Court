import { GameData } from '../../shared/GameData.js';
import  {OpenAI}  from 'openai';
import { Config } from '../../shared/Config.js';
import { checkInteractions } from './interactions.js';
import { buildTextPrompt, buildChatPrompt, buildSummarizeTextPrompt, buildSummarizeChatPrompt } from './promptBuilder.js';
import { cleanMessageContent } from './messageCleaner.js';
const fs = require('fs');

import {Message, MessageChunk, Setting, ResponseObject, ErrorMessage, Summary} from '../ts/conversation_interfaces.js';

export class Conversation{
    gameData: GameData;
    messages: Message[];
    config: Config;
    openai: OpenAI;
    model: string;
    setting: Setting;
    description: string;
    exampleMessages: Message[];
    summaries: Summary[];
    
    constructor(gameData: GameData, config: Config){
        this.gameData = gameData;
        this.messages = [];
        this.config = config 

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

        console.log(this.summaries)
        

        switch (this.config.selectedApi){
            case "openai":
                this.openai = new OpenAI({
                    apiKey: config.openaiKey,
                    dangerouslyAllowBrowser: true,
                })

                this.model = config.openaiModel;
                this.setting = require(`../../../public/settings/Openai Settings/${config.openaiSelectedSetting}`);
                break;
            case "ooba":
                this.openai = new OpenAI({
                    apiKey: "111111111111111111111111111111111111111111111111111",
                    dangerouslyAllowBrowser: true,
                    baseURL: config.oobaServerUrl
                });

                this.model = "string";
                this.setting = require(`../../../public/settings/Ooba settings/${config.oobaSelectedSetting}`);                         
                break;
            case "openrouter":
                this.openai = new OpenAI({
                    apiKey: config.openRouterKey,
                    dangerouslyAllowBrowser: true,
                    baseURL: "https://openrouter.ai/api/v1",
                });

                this.model = config.openRouterModel;

                this.setting = require(`../../../public/settings/OpenRouter settings/${config.openRouterSelectedSetting}`);                
                break;
            default:
                throw new Error('API Type is not valid!');
        }       
    }

    pushMessage(message: Message): void{           
        this.messages.push(message);
    }

    async generateNewAIMessage(streamRelay: (arg1: MessageChunk)=> void): Promise<ResponseObject>{
        let response: Message;
        console.log(this.gameData)
        if(this.isApiChat()){
            console.log(buildChatPrompt(this));
            response = await this.chatComplete(streamRelay);
        }
        else{
            console.log(buildTextPrompt(this));
            response = await this.textComplete(streamRelay);
        }

        if(this.config.cleanMessages){
            response.content = cleanMessageContent(response.content);
        }

        this.pushMessage(response);

        let responseObject: ResponseObject = {
            message: response,
            interactions: checkInteractions(this)
        }

        return responseObject;
    }

    async chatComplete(streamRelay: (arg1: MessageChunk)=> void): Promise<Message> {

        let completion = await this.openai.chat.completions.create({
            model: this.model,
            messages: buildChatPrompt(this),
            stop: [this.gameData.playerName+":", "you:", "user:"],
            stream: this.config.stream,
            ...this.setting.parameters
        })

        let responseMessage: Message = {
            role: "assistant",
            name: this.gameData.aiName,
            content: ""
        };

        if(this.config.stream){
            // @ts-ignore
            for await(const chunk of completion){
                let msgChunk: MessageChunk = chunk.choices[0].delta;
                streamRelay(msgChunk);
                responseMessage.content += msgChunk.content;
            }
        }
        else{
            // @ts-ignore
            responseMessage.content = completion.choices[0].message.content;
        }
        
        return responseMessage;
    }

    async textComplete(streamRelay: (arg1: MessageChunk)=> void): Promise<Message> {

        let completion;

        if(this.config.selectedApi === "openrouter"){
            //@ts-ignore
            completion = await this.openai.chat.completions.create({
                model: this.model,
                //@ts-ignore
                prompt: buildTextPrompt(this),
                stream: this.config.stream,
                stop: [this.gameData.playerName+":", this.gameData.aiName+":", this.setting.inputSequence, this.setting.outputSequence],
                ...this.setting.parameters
            })
        }
        else{
            completion = await this.openai.completions.create({
                model: this.model,
                prompt: buildTextPrompt(this),
                stream: this.config.stream,
                stop: [this.gameData.playerName+":", this.gameData.aiName+":", "you:"],
                ...this.setting.parameters
            });
        }
        
        let responseMessage: Message = {
            role: "assistant",
            name: this.gameData.aiName,
            content: ""
        };

        if(this.config.stream){
            // @ts-ignore
            for await(const chunk of completion){
                let msgChunk: MessageChunk = {
                    // @ts-ignore
                    content: chunk.choices[0].text
                }
                streamRelay(msgChunk);

                responseMessage.content += msgChunk.content;
            }
        }
        else{
            // @ts-ignore
           responseMessage.content = completion.choices[0].text
              
        }

        return responseMessage;
    }

    async summarize(){

        let summary = {
            date: this.gameData.date,
            content: ""
        }

        if(this.isApiChat()){
            console.log(buildSummarizeChatPrompt(this))
            let completion = await this.openai.chat.completions.create({
                model: this.model,
                messages: buildSummarizeChatPrompt(this),
                stop: [],
                stream: false,
                ...this.setting.parameters
            })
            
            summary.content = completion.choices[0].message.content!; 
        }
        else{
            console.log(buildSummarizeTextPrompt(this))
            //@ts-ignore
            let completion = await this.openai.chat.completions.create({
                model: this.model,
                //@ts-ignore
                prompt: buildSummarizeTextPrompt(this),
                stream: false,
                stop: [],
                ...this.setting.parameters
            })

            //@ts-ignore
            summary.content = completion.choices[0].text        
        }

        console.log(summary)

        this.summaries.unshift(summary)

        fs.writeFileSync(`./public/conversation_summaries/${this.gameData.playerID}/${this.gameData.aiID}.json`, JSON.stringify(this.summaries, null, '\t'));
    }

    updateConfig(config: Config){
        this.config = config;
        switch (this.config.selectedApi){
            case "openai":
                this.openai = new OpenAI({
                    apiKey: config.openaiKey,
                    dangerouslyAllowBrowser: true,
                })

                this.model = config.openaiModel;
                this.setting = require(`../../../public/settings/Openai Settings/${config.openaiSelectedSetting}`);
                break;
            case "ooba":
                this.openai = new OpenAI({
                    apiKey: "111111111111111111111111111111111111111111111111111",
                    dangerouslyAllowBrowser: true,
                    baseURL: config.oobaServerUrl
                });

                this.model = "string";
                this.setting = require(`../../../public/settings/Ooba settings/${config.oobaSelectedSetting}`);                         
                break;
            case "openrouter":
                this.openai = new OpenAI({
                    apiKey: config.openRouterKey,
                    dangerouslyAllowBrowser: true,
                    baseURL: "https://openrouter.ai/api/v1",
                });

                this.model = config.openRouterModel;

                this.setting = require(`../../../public/settings/OpenRouter settings/${config.openRouterSelectedSetting}`);                
                break;
            default:
                throw new Error('API Type is not valid!');
        }
    }

    isApiChat(){
        if(this.config.selectedApi === "openai" || (this.config.selectedApi === "openrouter" && !this.config.openRouterForceInstruct ) ){
            return true;
        }
        else{
            return false;
        }
    }

}