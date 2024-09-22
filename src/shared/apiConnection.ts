import { Message, MessageChunk } from "../main/ts/conversation_interfaces";
import OpenAI from "openai";
const contextLimits = require("../../public/contextLimits.json");

import tiktoken from "js-tiktoken";
import { ApiConnectionConfig } from "./Config";

export interface apiConnectionTestResult{
    success: boolean,
    errorMessage?: string,
}

export interface Parameters{
    temperature: number,
	frequency_penalty: number,
	presence_penalty: number,
	top_p: number,
}

export class ApiConnection{
    type: string; //openrouter, openai, ooba
    baseUrl: string;
    key: string;
    model: string;
    forceInstruct: boolean ;//only used by openrouter
    parameters: Parameters;
    context: number;
    

    constructor(connectionConfig: any){
        this.type = connectionConfig.type;
        this.baseUrl = connectionConfig.baseUrl;
        this.key = connectionConfig.key;
        this.model = connectionConfig.model;
        this.forceInstruct = connectionConfig.forceInstruct;
        this.parameters = connectionConfig.parameters;

        let modelName = this.model
        console.log("==HERE");
        console.log(connectionConfig)
        if(modelName && modelName.includes("/")){
            modelName = modelName.split("/").pop()!;
        }

        if(connectionConfig.overwriteContext){
            console.log("Overwriting context size!");
            this.context = connectionConfig.customContext;
        }
        else if(contextLimits[modelName]){
            this.context = contextLimits[modelName]
        }
        else{
            console.log(`Warning: couldn't find ${this.model}'s context limit. context overwrite value will be used!`);
            this.context = connectionConfig.customContext;
        }
    }

    isChat(): boolean {
        if(this.type === "openai" || (this.type === "openrouter" && !this.forceInstruct ) ){
            return true;
        }
        else{
            return false;
        }
    
    }

    async complete(prompt: string | Message[], stream: boolean, otherArgs: object, streamRelay?: (arg1: MessageChunk)=> void,  ): Promise<string> {

        let openai = new OpenAI({
            baseURL: this.baseUrl,
            apiKey: this.key,
            dangerouslyAllowBrowser: true,
        })

        //OPENAI DOESNT ALLOW spaces inside message.name so we have to put them inside the Message content.
        if(this.type == "openai"){
            console.log("akurva")
            for(let i=0;i<prompt.length;i++){
                 //@ts-ignore
                 if(prompt[i].name){
                    //@ts-ignore
                    prompt[i].content = prompt[i].name + ": "+prompt[i].content;

                    //@ts-ignore
                    delete prompt[i].name;
                }
            }
        }   
        console.log(prompt);
        
        if(this.isChat()){
            let completion = await openai.chat.completions.create({
                model: this.model,
                //@ts-ignore
                messages: prompt,
                stream: stream,
                ...this.parameters,
                ...otherArgs
            })

            let response: string = "";

            //@ts-ignore
            if(completion["error"]){
                //@ts-ignore
                throw completion.error.message;
            }
            

            if(stream){

                // @ts-ignore
                for await(const chunk of completion){
                    let msgChunk: MessageChunk = chunk.choices[0].delta;
                    if(msgChunk.content){
                        streamRelay!(msgChunk);
                        response += msgChunk.content;
                    }   
                }
                
            }
            else{
                // @ts-ignore
                response = completion.choices[0].message.content;
            }

            console.log(response);
            return response;
        }
        else{
            let completion;

            if(this.type === "openrouter"){
                //@ts-ignore
                completion = await openai.chat.completions.create({
                    model: this.model,
                    //@ts-ignore
                    prompt: prompt,
                    ...this.parameters,
                    ...otherArgs
                })
            }
            else{
                completion = await openai.completions.create({
                    model: this.model,
                    //@ts-ignore
                    prompt: prompt,
                    ...this.parameters,
                    ...otherArgs
                });
            }

            let response: string = "";

            //@ts-ignore
            if(completion["error"]){
                //@ts-ignore
                throw completion.error.message;
            }

            if(stream){
                // @ts-ignore
                
                for await(const chunk of completion){
                    let msgChunk: MessageChunk = {
                        // @ts-ignore
                        content: chunk.choices[0].text
                    }
                    streamRelay!(msgChunk);

                    response += msgChunk.content;
                }
            }
            else{
                // @ts-ignore
            response = completion.choices[0].text
                
            }

            console.log(response);
            return response;
        }
    }

    async testConnection(): Promise<apiConnectionTestResult>{
        let prompt: string | Message[];
        if(this.isChat()){
            prompt = [
                {
                    role: "user",
                    content: "ping"
                }
            ]
        }else{
            prompt = "ping";
        }

        return this.complete(prompt, false, {max_tokens: 1}).then( (resp) =>{
            if(resp){
                return {success: true};
            }
            else{
                return {success: false, errorMessage: "this is fuku"};
            }
        }).catch( (err) =>{
            return {success: false, errorMessage: err}
        });
    }

    calculateTokensFromText(text: string): number{
    
        const enc = tiktoken.getEncoding("cl100k_base");
          return enc.encode(text).length;
    }

    calculateTokensFromMessage(msg: Message): number{
        console.log(msg)
    
        const enc = tiktoken.getEncoding("cl100k_base");

        let sum = enc.encode(msg.role).length + enc.encode(msg.content).length

        if(msg.name){
            sum += enc.encode(msg.name).length;
        }

        return sum;
    }

    calculateTokensFromChat(chat: Message[]): number{
    
        const enc = tiktoken.getEncoding("cl100k_base");
        
        let sum=0;
        for(let msg of chat){
           sum += this.calculateTokensFromMessage(msg);
        }

        return sum;
    }

   
}