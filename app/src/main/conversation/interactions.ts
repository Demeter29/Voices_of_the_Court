import { Interaction} from "../ts/conversation_interfaces"
import { Character, OpinionModifier } from "../../shared/GameData";
import { Conversation } from "./Conversation";
import { RunFileManager } from "../RunFileManager";

export const interactions: Interaction[] = [
    {
        signature: "improveOpinionOfPlayer()",
        description: `execute when {{playerName}}'s last dialogue or action drastically improved {{aiName}}'s opinion of {{playerName}}.`,
        group: "opinion",
        run: (conv: Conversation): void => {
            let conversationOpinion: number = getConversationOpinionValue(conv.gameData.characters.get(conv.gameData.aiID)?.opinionBreakdownToPlayer!)
            if(conversationOpinion<50){
                changeConversationOpinionValue(conv.gameData.characters.get(conv.gameData.aiID)?.opinionBreakdownToPlayer!, conversationOpinion+5);

                conv.runFileManager.write(
                    `global_var:talk_second_scope = {
                        add_opinion = {
                            target = global_var:talk_first_scope
                            modifier = conversation_opinion
                            opinion = 5
                        }
                    }`
                )
            }
        },
        chatMessage: "{{aiName}}'s opinion of you has improved slightly.",
        chatMessageClass: "positive-interaction-message"
    },
    {
        signature: "lowerOpinionOfPlayer()",
        description: `execute when {{playerName}}'s last single  or action drastically lowered {{aiName}}'s opinion of {{playerName}}.`,
        group: "opinion",
        run: (conv: Conversation): void => {
            let conversationOpinion: number = getConversationOpinionValue(conv.gameData.characters.get(conv.gameData.aiID)?.opinionBreakdownToPlayer!)
            if(conversationOpinion>-50){
                changeConversationOpinionValue(conv.gameData.characters.get(conv.gameData.aiID)?.opinionBreakdownToPlayer!, conversationOpinion-5)

                conv.runFileManager.write(
                    `global_var:talk_second_scope = {
                        add_opinion = {
                            target = global_var:talk_first_scope
                            modifier = conversation_opinion
                            opinion = -5
                        }
                    }`
                )
            }
        },
        chatMessage: "{{aiName}}'s opinion of you has deteriorated slightly.",
        chatMessageClass: "negative-interaction-message"
    },
    {
        signature: "aiGetsWounded()",
        description: `execute when {{aiName}} gets seriously wounded.`,
        group: "fight",
        run: (conv: Conversation): void => {
            conv.runFileManager.write(
                `global_var:talk_second_scope = {
                    add_trait = wounded_1
                }`
            )
        },
        chatMessage: "{{aiName}} got wounded!.",
        chatMessageClass: "negative-interaction-message"
    },
]

//help functions

function getConversationOpinionValue(opinionBreakdown: OpinionModifier[]): number{
    let results = opinionBreakdown.filter( (opinionModifier: OpinionModifier) =>{
        return opinionModifier.reason == "From conversations";
    })

    let conversationOpinion = 0;
    if(results.length>0){
        conversationOpinion = results[0].value;
    }

    return conversationOpinion;
}

function changeConversationOpinionValue(opinionBreakdown: OpinionModifier[], value: number): void{
    let found: boolean = false;
    opinionBreakdown.forEach( (om: OpinionModifier) =>{
        
        if(om.reason == "From conversations"){
            om.value = value;

            found = true
        }        
    })

    //no modifier found
    if(!found){
        opinionBreakdown.push({
            reason: "From conversations",
            value: value
        })
    }
    

}   