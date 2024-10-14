import { Message, MessageChunk } from "../main/ts/conversation_interfaces";
import OpenAI from "openai";
const contextLimits = require("../../public/contextLimits.json");

import tiktoken from "js-tiktoken";
import { ApiConnectionConfig } from "./Config";

export interface apiConnectionTestResult{
    success: boolean,
    overwriteWarning?: boolean;
    errorMessage?: string,
}

export interface Connection{
    type: string; //openrouter, openai, ooba
    baseUrl: string;
    key: string;
    model: string;
    forceInstruct: boolean ;//only used by openrouter
    overwriteContext: boolean;
    customContext: number;
}

export interface Parameters{
    temperature: number,
	frequency_penalty: number,
	presence_penalty: number,
	top_p: number,
}

let encoder = tiktoken.getEncoding("cl100k_base");

export class ApiConnection{
    type: string; //openrouter, openai, ooba, custom
    client: OpenAI;
    model: string;
    forceInstruct: boolean ;//only used by openrouter
    parameters: Parameters;
    context: number;
    overwriteWarning: boolean;
    

    constructor(connection: Connection, parameters: Parameters){
        this.type = connection.type;
        this.client = new OpenAI({
            baseURL: connection.baseUrl,
            apiKey: connection.key,
            dangerouslyAllowBrowser: true,
            defaultHeaders: {
                "HTTP-Referer": "https://github.com/Demeter29/Voices_of_the_Court", // Optional, for including your app on openrouter.ai rankings.
                "X-Title": "Voices of the Court", // Optional. Shows in rankings on openrouter.ai.
              }
        })
        this.model = connection.model;
        this.forceInstruct = connection.forceInstruct;
        this.parameters = parameters;
        

        let modelName = this.model
        if(modelName && modelName.includes("/")){
            modelName = modelName.split("/").pop()!;
        }

        if(connection.overwriteContext){
            console.log("Overwriting context size!");
            this.context = connection.customContext;
            this.overwriteWarning = false;
        }
        else if(contextLimits[modelName]){
            this.context = contextLimits[modelName];
            this.overwriteWarning = false;
        }
        else{
            console.log(`Warning: couldn't find ${this.model}'s context limit. context overwrite value will be used!`);
            this.context = connection.customContext;
            this.overwriteWarning = true;
        }
    }

    isChat(): boolean {
        if(this.type === "openai" || (this.type === "openrouter" && !this.forceInstruct ) || this.type === "other"){
            return true;
        }
        else{
            return false;
        }
    
    }

    async complete(prompt: string | Message[], stream: boolean, otherArgs: object, streamRelay?: (arg1: MessageChunk)=> void,  ): Promise<string> {


        //OPENAI DOESNT ALLOW spaces inside message.name so we have to put them inside the Message content.
        if(this.type == "openai"){
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
            let completion = await this.client.chat.completions.create({
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
                completion = await this.client.chat.completions.create({
                    model: this.model,
                    //@ts-ignore
                    prompt: prompt,
                    stream: stream,
                    ...this.parameters,
                    ...otherArgs
                })
            }
            else{
                completion = await this.client.completions.create({
                    model: this.model,
                    //@ts-ignore
                    prompt: prompt,
                    stream: stream,
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
                return {success: true, overwriteWarning: this.overwriteWarning };
            }
            else{
                return {success: false, overwriteWarning: false, errorMessage: "no response, something went wrong..."};
            }
        }).catch( (err) =>{
            return {success: false, overwriteWarning: false, errorMessage: err}
        });
    }

    calculateTokensFromText(text: string): number{
          return encoder.encode(text).length;
    }

    calculateTokensFromMessage(msg: Message): number{
        let sum = encoder.encode(msg.role).length + encoder.encode(msg.content).length

        if(msg.name){
            sum += encoder.encode(msg.name).length;
        }

        return sum;
    }

    calculateTokensFromChat(chat: Message[]): number{        
        let sum=0;
        for(let msg of chat){
           sum += this.calculateTokensFromMessage(msg);
        }

        return sum;
    }

   
}