module.exports = {
    signature: "lowerOpinionOfPlayer",
    args: [ 
        {
            name: "opinion",
            type: "number",
            desc: "the number of opinion values the relation decreases with. Can be between 1 and 5."
        }
    ],
    description: `Execute when {{playerName}}'s last single dialogue or action drastically lowered {{aiName}}'s opinion of {{playerName}}.`,
    group: "opinion",
    check: (gameData) =>{
        return (getConversationOpinionValue(gameData.characters.get(gameData.aiID).opinionBreakdownToPlayer) > -50);
    },
    run: (gameData, runFileManager, args) => {
        let conversationOpinion = getConversationOpinionValue(gameData.characters.get(gameData.aiID).opinionBreakdownToPlayer)
        if(conversationOpinion>-50){
            changeConversationOpinionValue(gameData.characters.get(gameData.aiID).opinionBreakdownToPlayer, conversationOpinion-5)

            runFileManager.append(
                `global_var:talk_second_scope = {
                    add_opinion = {
                        target = global_var:talk_first_scope
                        modifier = conversation_opinion
                        opinion = -${args[0]}
                    }
                }`
            )
        }
    },
    chatMessage: (args) =>{
        return `{{aiName}}'s opinion of you has decreased by ${args[0]}.`
    },
    chatMessageClass: "negative-action-message"
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