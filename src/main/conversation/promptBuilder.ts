import { Conversation, } from "./Conversation";
import { parseVariables } from "./parseVariables";
import { Message } from "../ts/conversation_interfaces";
import { GameData, Memory } from "../../shared/GameData";
import { Config } from "../../shared/Config";

export function convertChatToText(chat: Message[], config: Config): string{
    let output: string = "";

    for(let msg of chat){
        
        switch(msg.role){
            case "system":
                    output += msg.content+"\n";
                break;
            case "user":
                output += `${config.inputSequence}\n${msg.name}: ${msg.content}\n`;
                break;
                case "assistant":
                    output += `${config.outputSequence}\n${msg.name}: ${msg.content}\n`;
                    break;
        }
    }

    output+=config.outputSequence
    return output;
}

export function buildChatPrompt(conv: Conversation): Message[]{
    let chatPrompt: Message[]  = [];

    chatPrompt.push({
        role: "system",
        content: parseVariables(conv.config.mainPrompt, conv.gameData)
    })

    chatPrompt.push({
        role: "system",
        content: "[example messages]"
    })
    
    chatPrompt = chatPrompt.concat(conv.exampleMessages);

    
    

    chatPrompt.push({
        role: "system",
        content: "[Start a new chat]"
    })

    let messages = conv.messages.slice(0); //pass by value

    let correctedSummariesInsertDepth = conv.config.summariesInsertDepth;
    let correctedMemoriesInsertDepth = conv.config.memoriesInsertDepth;
    let correctedDescInsertDepth = conv.config.descInsertDepth;

    if(conv.config.summariesInsertDepth > conv.config.memoriesInsertDepth){
        correctedMemoriesInsertDepth++;
    }
    if(conv.config.summariesInsertDepth > conv.config.descInsertDepth){
        correctedDescInsertDepth++;
    }
    if(conv.config.memoriesInsertDepth > conv.config.descInsertDepth){
        correctedDescInsertDepth++;
    }

    if(conv.summaries.length > 0){
        let summaryString = "Here are the date and summary of previous conversations between them:\n"

        conv.summaries.reverse();

        for(let summary of conv.summaries){
            summaryString += `${summary.date} (${getDateDifference(summary.date, conv.gameData.date)}): ${summary.content}\n`;
        }

        conv.summaries.reverse();

        let summariesMessage: Message = {
            role: "system",
            content: summaryString
        } 

        

        insertMessageAtDepth(messages, summariesMessage, correctedSummariesInsertDepth);   
        
    }

    const descMessage: Message = {
        role: "system",
        content: conv.description
    };

    const memoryMessage: Message = {
        role: "system",
        content: createMemoryString(conv)
    }

    
    if(memoryMessage.content){
        insertMessageAtDepth(messages, memoryMessage, correctedMemoriesInsertDepth);
    }
    

    insertMessageAtDepth(messages, descMessage, correctedDescInsertDepth);

    if(conv.currentSummary){
        let currentSummaryMessage: Message = {
            role: "system",
            content: "Summarization of the previous messages in this conversation: "+conv.currentSummary,
        }

        messages.unshift(currentSummaryMessage);
    }

    chatPrompt = chatPrompt.concat(messages);

    if(conv.config.enableSuffixPrompt){
        chatPrompt.push({
            role: "system",
            content: conv.config.suffixPrompt
        })
    }

    

    return chatPrompt;
}

//SUMMARIZATION

export function buildSummarizeChatPrompt(conv: Conversation): Message[]{
    
    let output: Message[] = [];

    //I found that summarization works a lot better if the conversation is contained in just 1 message
    output.push({
        role: "system",
        content: convertMessagesToString(conv.messages, "", "")
    })

    output = output.concat({
        role: "system",
        content: parseVariables(conv.config.summarizePrompt, conv.gameData)
    });

    return output;
}

export function buildResummarizeChatPrompt(conv: Conversation, messagesToSummarize: Message[]): Message[]{
    let prompt: Message[] = [];

    if(conv.currentSummary){
        prompt.push({
            role: "system",
            content: "Summary of this conversation that happened before the messages:"+conv.currentSummary
        })
    }
    

    prompt.push({
        role: "system",
        content: convertMessagesToString(messagesToSummarize, "", "")
    })

    prompt.push({
        role: "system",
        content: parseVariables(conv.config.summarizePrompt, conv.gameData)
    })

    return prompt;
}



//help functions 

export function convertMessagesToString(messages: Message[], inputSeq: string, outputSeq: string): string{
    let output= "";
    for(const message of messages){
        if(message.role === 'user'){
            output+= `${inputSeq}${message.name}:${message.content}\n`
        }
        else if(message.role == 'assistant'){
            output+= `${outputSeq}${message.name}:${message.content}\n`
        }
        else if(message.role == 'system'){
            output+= `${inputSeq}${message.content}\n`
        }
    }

    return output;
}

function insertMessageAtDepth(messages: Message[], messageToInsert: Message, insertDepth: number): Message[] {

    if(messages.length < insertDepth){
        messages.unshift(messageToInsert);
    }
    else{
        messages.splice(messages.length - insertDepth, 0, messageToInsert);
    }

    return messages;
}

function getDateDifference(pastDate: string, todayDate: string): string{

    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ];

      const past = {
        day: Number(pastDate.split(" ")[0]),
        month: months.indexOf(pastDate.split(" ")[1]),
        year: Number(pastDate.split(" ")[2])
      }

      const today = {
        day: Number(todayDate.split(" ")[0]),
        month: months.indexOf(todayDate.split(" ")[1]),
        year: Number(todayDate.split(" ")[2])
      }

      let totalDays = (today.year - past.year) * 365 + (today.month - past.month) * 30 + (today.day - past.day);

      if(totalDays > 365){
        return Math.round(totalDays/365) + " years ago"
      }
      else if(totalDays >= 30){
        return Math.round(totalDays/30) + " months ago"
      }
      else if(totalDays > 0){
        return totalDays + " days ago"
      }
      else{
        return "today"
      }
}




function createMemoryString(conv: Conversation): string{

    let allMemories: Memory[] = [];

    allMemories =allMemories.concat(conv.gameData.characters.get(conv.gameData.playerID)!.memories);
    allMemories = allMemories.concat(conv.gameData.characters.get(conv.gameData.aiID)!.memories);

    allMemories.sort((a, b) => (a.relevanceWeight - b.relevanceWeight));
    
    allMemories.reverse();

    

    let output ="";
    if(allMemories.length>0){
        output = conv.config.memoriesPrompt;
    }

    let tokenCount = 0;
    while(allMemories.length>0){
        const memory: Memory = allMemories.pop()!;

        let memoryLine = `${memory.creationDate}: ${memory.desc}`;

        let memoryLineTokenCount = conv.textGenApiConnection.calculateTokensFromText(memoryLine);

        if(tokenCount + memoryLineTokenCount > conv.config.maxMemoryTokens){
            break;
        }
        else{
            output+="\n"+memoryLine;
            tokenCount+=memoryLineTokenCount;
        }

    }

    return output;
}
