import { Conversation, } from "./Conversation";
import { parseVariables } from "./parseVariables";
import { Message } from "../ts/conversation_interfaces";
import { GameData, Memory } from "../../shared/GameData";

export function buildTextPrompt(conv: Conversation): string {
        let output: string = "";

        output+= parseVariables(conv.setting.mainPrompt, conv.gameData) +"\n";

        output+= "Examples:\n"
       
        output+= convertMessagesToString(conv.exampleMessages, conv.setting.inputSequence, conv.setting.outputSequence);


        const descMessage: Message = {
            role: "system",
            content: conv.description
        };

        let messagesWithDesc: Message[] = insertMessageAtDepth(conv.messages, descMessage, conv.config.descInsertDepth);

        
        output+= convertMessagesToString(messagesWithDesc, conv.setting.inputSequence, conv.setting.outputSequence);

        output += conv.setting.outputSequence + conv.gameData.aiName +":"

        return output;
}

export function buildChatPrompt(conv: Conversation): Message[]{

    let chatPrompt: Message[]  = [];

    chatPrompt.push({
        role: "system",
        content: parseVariables(conv.setting.mainPrompt, conv.gameData)
    })
    
    chatPrompt = chatPrompt.concat(conv.exampleMessages);

    const memoriesString: string = getNumberOfMemoriesString(conv.gameData, 10);

    if(memoriesString.length>0){
        chatPrompt.push({
            role: "system",
            content: memoriesString
        })    
    }
    
    /*
    if(conv.summaries.length > 1){
        chatPrompt.push({
            role: "system",
            content: `The last time ${conv.gameData.aiName} and ${conv.gameData.playerName} spoke to eachother was in ${conv.summaries[0].date} (${getDateDifference(conv.summaries[0].date, conv.gameData.date)}).\nHere's a summary of that conversation: ${conv.summaries[0].content}`
        })
    }

    */
    chatPrompt.push({
        role: "system",
        content: "[Start a new chat]"
    })

    const descMessage: Message = {
        role: "system",
        content: conv.description
    };
    

    let messagesWithDesc = insertMessageAtDepth(conv.messages, descMessage, conv.config.descInsertDepth);

    chatPrompt = chatPrompt.concat(messagesWithDesc);

    return chatPrompt;
}

//SUMMARIZATION

export function buildSummarizeTextPrompt(conv: Conversation): string{
    let output = convertMessagesToString(conv.messages, "", "")
    

    output+= conv.setting.inputSequence + parseVariables(conv.config.summarizePrompt, conv.gameData) + "\n" +conv.setting.outputSequence;

    return output;
}

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

function insertMessageAtDepth(messages: Message[], messageToInsert: Message, depth: number): Message[] {

    let outputMessages = messages.slice(0); //pass by value
    if(outputMessages.length < depth){
        outputMessages.unshift(messageToInsert);
    }
    else{
        outputMessages.splice(outputMessages.length - depth + 1, 0, messageToInsert);
    }

    return outputMessages;
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




function getNumberOfMemoriesString(gameData: GameData, num: number): string{

    let allMemories: Memory[] = [];

    allMemories =allMemories.concat(gameData.characters.get(gameData.playerID)!.memories);
    allMemories = allMemories.concat(gameData.characters.get(gameData.aiID)!.memories);

    allMemories.sort((a, b) => (a.relevanceWeight - b.relevanceWeight));
    
    allMemories.reverse();

    

    let output ="";
    if(allMemories.length>0){
        output = "These are the significant events that has happened to the characters:"
    }

    while(allMemories.length>0 && num-- > 0){
        const memory: Memory = allMemories.pop()!;

        output += `\n${memory.creationDate}: ${memory.desc}`;
    }

    return output;
}
