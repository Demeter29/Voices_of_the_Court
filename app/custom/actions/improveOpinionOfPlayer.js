


module.exports = {
    signature: "improveOpinionOfPlayer",
    args: [ 
        {
            name: "opinion",
            type: "number",
            desc: "the number of opinion values the relation improves with. Can be between 1 and 5."
        }
    ],
    description: `execute when {{playerName}}'s last dialogue or action drastically improved {{aiName}}'s opinion of {{playerName}}.`,
    group: "opinion",
    run: (conv, args) =>{
        let conversationOpinion = getConversationOpinionValue(conv.gameData.characters.get(conv.gameData.aiID).opinionBreakdownToPlayer)
        if(conversationOpinion<50){
            changeConversationOpinionValue(conv.gameData.characters.get(conv.gameData.aiID).opinionBreakdownToPlayer, conversationOpinion+5);

            conv.runFileManager.append(
                `global_var:talk_second_scope = {
                    add_opinion = {
                        target = global_var:talk_first_scope
                        modifier = conversation_opinion
                        opinion = ${args[0]}
                    }
                }`
            )
        }

       
    },
    chatMessage: (args) =>{
        return `{{aiName}}'s opinion of you has improved by ${args[0]}.`
    },
    chatMessageClass: "positive-interaction-message"
}

//help functions

function getConversationOpinionValue(opinionBreakdown){
    let results = opinionBreakdown.filter( (opinionModifier) =>{
        return opinionModifier.reason == "From conversations";
    })

    let conversationOpinion = 0;
    if(results.length>0){
        conversationOpinion = results[0].value;
    }

    return conversationOpinion;
}

function changeConversationOpinionValue(opinionBreakdown, value){
    let found = false;
    opinionBreakdown.forEach( (om) =>{
        
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