
module.exports = {
    signature: "becomeCloseFriends",
    args: [],
    description: "Trigger when a strong and close friendship has formed between {{playerName}} and {{aiName}}.",
    check: (conv) => {
        return getConversationOpinionValue(opinionBreakdown)>30
    },
    run: (gameData, runFileManager) => {
        //
    },
    chatMessage: (args) =>{
        return `{{aiName}} has become your friend.`
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
