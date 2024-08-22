import { GameData } from "../../shared/GameData";
import { Conversation } from "./Conversation";
import { Config } from "../../shared/Config";
import OpenAI from "openai";
import { convertMessagesToString } from "./promptBuilder";
import { Message, Interaction, InteractionResponse } from "../ts/conversation_interfaces";
import { parseVariables } from "./parseVariables";
import fs from 'fs';
import path from 'path';



export async function checkInteractions(conv: Conversation): Promise<InteractionResponse[]>{

    let availableInteractions: Interaction[] = [];

    //TODO
    availableInteractions = conv.interactions;

    console.log(availableInteractions)

    let triggeredInteractions: InteractionResponse[] = [];
    
    
    let response;
    if(conv.interactionApiConnection.isChat()){
        response = await conv.interactionApiConnection.complete(buildInteractionChatPrompt(conv, availableInteractions), false, {} );
    }
    else{
        throw "Instruct api is not supported by interactions";
    }

    //console.log("LLM Interaction response: "+response);

    response = response.replace(/(\r\n|\n|\r)/gm, "");

    if(!response.match(/<rationale>(.*?)<\/?rationale>/) || !response.match(/<actions>(.*?)<\/?actions>/)){
        console.log("Interaction warning: rationale or action couldn't be extracted. llm response: "+ response);
        return [];
    }

    const rationale = response.match(/<rationale>(.*?)<\/rationale>/)![1];
    const actionsString = response.match(/<actions>(.*?)<\/actions>/)![1];


    if(actionsString === "noop()"){
        return [];
    }

    const actions = actionsString.replace(/ /g,'').split(',');

    //validations
    for(const actionInResponse of actions){
        //validate name
        const foundActionName = actionInResponse.match(/([a-zA-Z_{1}][a-zA-Z0-9_]+)(?=\()/g);

        if(!foundActionName){
            continue;
        }

        let matchedInteractions: Interaction[] = availableInteractions.filter( validInteraction =>{
            return validInteraction.signature == foundActionName[0];
        })


        if(matchedInteractions.length == 0){
            console.log("Interaction warning: the returned action from llm matched none of the listed interactions.");
            continue;
        }

        const matchedInteraction: Interaction = matchedInteractions[0];

        console.log("air: "+actionInResponse)
        //validate args
        const argsString = /\(([^)]+)\)/.exec(actionInResponse);
        console.log(argsString);
        if(argsString == null){
            if(matchedInteraction.args.length === 0){
                matchedInteraction.run(conv, []);

                if(matchedInteraction.group != "emotion"){
                    triggeredInteractions.push({
                        interactionName: matchedInteraction.signature,
                        chatMessage: parseVariables(matchedInteraction.chatMessage([]), conv.gameData),
                        chatMessageClass: matchedInteraction.chatMessageClass
                    })
                }
                

                continue;
            }

            console.log("Interaction warning: response action had no arguments, but matched action has");
            continue;
        }

        const args = argsString![1].split(",");

        if(args.length !== matchedInteraction.args.length){
            console.log("Interaction warning: the matched interaction has different number of args than the one from the llm response.");
            continue;
        }

        let isValidInteraction = true;
        for(let i =0; i<args.length;i++){

            console.log(args)
            if(matchedInteraction.args[0].type === "number"){
                if(isNaN(Number(args[0]))){
                    console.log("Interaction warning: argument was not the valid type");
                    isValidInteraction = false;
                    break;
                }
                
            }
            else if(matchedInteraction.args[0].type === "string"){
                //TODO
            }
        }
        if(!isValidInteraction){
            continue;
        }

        matchedInteraction.run(conv, args);

        if(matchedInteraction.group != "emotion"){
            triggeredInteractions.push({
                interactionName: matchedInteraction.signature,
                chatMessage: parseVariables(matchedInteraction.chatMessage(args), conv.gameData),
                chatMessageClass: matchedInteraction.chatMessageClass
            })
        }
        
        
    }

    conv.runFileManager.append(`
        global_var:talk_first_scope = {
            trigger_event = talk_event.9003
        }`
    );
    

    return triggeredInteractions;
}

function buildInteractionChatPrompt(conv: Conversation, interactions: Interaction[]): Message[]{
    let output: Message[] = [];

    output.push({
        role: "system",
        content: `Your task is to select the actions you think ${conv.gameData.aiName} did based on her last message. The rationale must be relevant to ${conv.gameData.aiName}'s personality, scenario, and the conversation so far. The actions MUST exist in the provided list. You can select multiple actions, seperate them with commas. If a function takes a value, then put it inside the brackets after the function, a function can take either 0 or 1 values.`
    })

    output.push({
        role: "system",
        content: `Choose ${conv.gameData.aiName}'s most relevant actions for the provided dialogue based on ${conv.gameData.aiName}'s last message or action.`
    })


    output.push({
        role: "system",
        content: "Prior dialogue:\n"+ convertMessagesToString(conv.messages.slice(conv.messages.length-8, conv.messages.length-2), "", "")
    })

    output.push({
        role: "system",
        content: conv.description
    })

    output.push({
        role: "system",
        content: "Given these replies:\n"+ convertMessagesToString(conv.messages.slice(conv.messages.length-2), "", "")
    })


    

    
    let content = `List of actions ${conv.gameData.aiName} can do:`;

    for(const interaction of interactions){ 

        let argNames: string[] = [];
        interaction.args.forEach( arg => { argNames.push(arg.name)})

        let signature = interaction.signature+'('+argNames.join(', ')+')';

        let argString = "";
        if(interaction.args.length == 0){
            argString = "Takes no arguments."
        }
        else{
            argString = `Takes ${interaction.args.length} arguments: `
        }

        for(const arg of interaction.args){
            argString += `${arg.name} (${arg.type}): ${arg.desc}. `
        }

        
        content += `\n- ${signature}: ${parseVariables(interaction.description, conv.gameData)} ${parseVariables(argString, conv.gameData)}`;
    }
    content += `\n- noop(): Execute when none of the previous actions are a good fit for the given replies.`

    content += `\nExplain why and which actions you would trigger (rationale), then write the most appropriate actions (actions). If you think multiple actions should be triggered, then seperate them with commas (,) inside the <actions> tags.`
    content+= `\nResponse format: <rationale>Reasoning.</rationale><actions>actionName1(value), actionName2(value)</actions>`

    output = output.concat({
        role: "system",
        content: content
    });

    return output;
}