import { GameData } from "../../shared/GameData";
import { Conversation } from "./Conversation";
import { Config } from "../../shared/Config";
import OpenAI from "openai";
import { convertMessagesToString } from "./promptBuilder";
import { Message, Interaction, InteractionResponse } from "../ts/conversation_interfaces";
import { parseVariables } from "./parseVariables";

export async function checkInteractions(conv: Conversation): Promise<InteractionResponse[]>{

    let interactions: Interaction[] = require('./interactions.js').interactions;

    let interactionResponses: InteractionResponse[] = [];
    
    do{
        let response = await conv.interactionApiConnection.complete(buildInteractionChatPrompt(conv, interactions), false, {} );

        console.log("LLM Interaction response: "+response);

        if(!response.match(/<rationale>(.*?)<\/rationale>/) || !response.match(/<action>(.*?)<\/action>/)){
            console.log("Interaction warning: rationale or action couldn't be extracted. llm response: "+ response);
            break;
        }

        const rationale = response.match(/<rationale>(.*?)<\/rationale>/)![1];
        const action = response.match(/<action>(.*?)<\/action>/)![1];


        if(action === "noop()"){
            break;
        }

        let results = (interactions.filter( int =>{
            return int.signature == action || int.signature == action+"()";
        }))

        if(results.length == 0){
            console.log("Interaction warning: the returned action from llm matched none of the listed interactions.");
            break;
        }

        const triggeredInteraction = results[0];

        console.log(conv.gameData.characters.get(conv.gameData.aiID)?.opinionBreakdownToPlayer);
        triggeredInteraction.run(conv);
        conv.runFileManager.append(`
            global_var:talk_first_scope = {
                trigger_event = talk_event.9003
            }`
        )
        
        console.log(conv.gameData.characters.get(conv.gameData.aiID)?.opinionBreakdownToPlayer);

        const interactionResponse: InteractionResponse = {
            rationale: rationale,
            action: action,
            interactionGroup: triggeredInteraction.group,
            chatMessage: parseVariables(triggeredInteraction.chatMessage, conv.gameData),
            chatMessageClass: triggeredInteraction.chatMessageClass,
        }

        interactionResponses.push(interactionResponse);
        interactions = interactions.filter( ( int: Interaction ) => {
            return int.group != interactionResponse.interactionGroup;
        }) 
    }while(interactions.length>0)

    return interactionResponses;
}

function buildInteractionChatPrompt(conv: Conversation, interactions: Interaction[]): Message[]{
    let output: Message[] = [];

    output.push({
        role: "system",
        content: `Your task is to select the best action on behalf of ${conv.gameData.aiName} that best fits the context. The rationale must be relevant to ${conv.gameData.aiName}'s personality, scenario, and the conversation so far. The action MUST exist in the provided list.`
    })

    output.push({
        role: "system",
        content: `Choose ${conv.gameData.aiName}'s most relevant action for the provided dialogue based on ${conv.gameData.aiName}'s last message or action.`
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
        content += `\n- ${interaction.signature}: ${parseVariables(interaction.description, conv.gameData)}`
    }
    content += `\n- noop(): Execute when none of the previous actions are a good fit for the given replies.`

    content += `\nHighlight useful information related to selecting an action from the list (rationale), then write the single most appropriate action ${conv.gameData.aiName} should execute (action).`
    content+= `\nResponse format: <rationale>Reasoning.</rationale><action>name()</action>`

    output = output.concat({
        role: "system",
        content: content
    });

    return output;
}