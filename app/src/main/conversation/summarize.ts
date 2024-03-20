import { Conversation } from "./Conversation";
import { buildSummarizeChatPrompt, buildSummarizeTextPrompt } from "./promptBuilder";


export async function summarize(conv: Conversation): Promise<string>{
    
    let summarization: string;
    if(conv.summarizationApiConnection.isChat()){
        summarization = await conv.summarizationApiConnection.complete(buildSummarizeChatPrompt(conv), conv.config.stream, {
        })
    }
    else{
        summarization = await conv.summarizationApiConnection.complete(buildSummarizeTextPrompt(conv), conv.config.stream, {
        })
    }

    console.log(summarization)
    return summarization;
}