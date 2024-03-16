import { GameData } from "../../shared/GameData";
import { Conversation } from "./Conversation";
import { Config } from "../../shared/Config";
import OpenAI from "openai";

export async function checkInteractions(conv: Conversation){

    let openai = new OpenAI({
        apiKey: conv.config.openaiKey,
        dangerouslyAllowBrowser: true,
    });

    let interactionConfig = {
        enableAll: conv.config.interactionsEnableAll,
        relationModifier: conv.config.interactionsRelations
    };

    if(!interactionConfig.enableAll || (!interactionConfig.relationModifier)){
        return {};
    }

    let tools: any = [];   

    if(interactionConfig.relationModifier){
        tools.push({
            "type": "function",
            "function": {
                "name": "change_opinion",
                "description": `increase or decrease ${conv.gameData.aiName}'s opinion of ${conv.gameData.playerName} if ${conv.gameData.playerName}'s actions or words made ${conv.gameData.aiName} drastically hate or like ${conv.gameData.playerName} more in the last message.`,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "opinion_value": {
                            "type": "number",
                            "description": "The increased or decreased opinion value, upper limit is +10, bottom limit is -10",
                        }
                    }     
                }
            },            
        })
    }

    /*
    if(interactionConfig.goldExchange){
        tools.push({
            "type": "function",
            "function":{
                "name": "gold_exchange",
                "description": "Exchange gold between the characters, execute only if the sender explicitly says that he gave over the gold!",
                "parameters":{
                    "type": "object",
                    "properties": {
                        "gold_amount": {
                            "type": "number",
                            "description": "The amount of gold to be exchanged",
                        },
                        "sender": {
                            "type": "string",
                            "description": "The name of the character that sends the gold"
                        }
                    }
                }          
            }        
        });
    }
    */
    

    const completion = await openai.chat.completions.create({
        model: conv.config.interactionsModel,
        messages: conv.messages.slice(conv.messages.length-2),
        tools: tools,
        tool_choice: "auto",  // auto is default, but we'll be explicit
    });


    if(!completion.choices[0].message.tool_calls){
        return {};
    }

    const toolCalls = completion.choices[0].message.tool_calls;

    let interactions: any = {};
    for(let toolCall of toolCalls){
        interactions[toolCall.function.name] = JSON.parse(toolCall.function.arguments);
    }

    return interactions;
}