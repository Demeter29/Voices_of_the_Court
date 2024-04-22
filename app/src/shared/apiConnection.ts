import { Message, MessageChunk } from "../main/ts/conversation_interfaces";
import OpenAI from "openai";

export interface apiConnectionTestResult{
    success: boolean,
    errorMessage?: string,
}

export class ApiConnection{
    type: string;//openrouter, openai, ooba
    baseUrl: string;
    key: string;
    model: string;
    forceInstruct: boolean //only used by openrouter

    constructor(parameters: any){
        this.type = parameters.type;
        this.baseUrl = parameters.baseUrl;
        this.key = parameters.key;
        this.model = parameters.model;
        this.forceInstruct = parameters.forceInstruct;
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

        console.log(prompt);

        if(this.isChat()){
            let completion = await openai.chat.completions.create({
                model: this.model,
                //@ts-ignore
                messages: prompt,
                stream: stream,
                ...otherArgs
            })

            let response: string = "";
            
            console.log("stream: "+stream)
            if(stream){
                console.log("steam::")

                // @ts-ignore
                for await(const chunk of completion){
                    let msgChunk: MessageChunk = chunk.choices[0].delta;
                    streamRelay!(msgChunk);
                    response += msgChunk.content;
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
                    ...otherArgs
                })
            }
            else{
                completion = await openai.completions.create({
                    model: this.model,
                    //@ts-ignore
                    prompt: prompt,
                    ...otherArgs
                });
            }

            let response: string = "";

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
                    content: "say hi"
                }
            ]
        }else{
            prompt = "say hi";
        }

        return this.complete(prompt, false, {max_tokens: 1}).then( (resp) =>{
            console.log(resp)
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
}