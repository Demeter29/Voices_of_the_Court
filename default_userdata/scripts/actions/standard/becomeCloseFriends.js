module.exports = {
    signature: "becomeCloseFriends",
    args: [
        {
            name: "reason",
            type: "string",
            desc: "the reason (the event) that made them become friends. (write it in past tense)."
        }
    ],
    description: "Execute when a strong and close friendship formed between {{playerName}} and {{aiName}}.",
    check: (gameData) => {
        let ai = gameData.characters.get(gameData.aiID);
        return (getConversationOpinionValue(ai.opinionBreakdownToPlayer) > 35) && 
                (ai.opinionOfPlayer > 0) &&
                !ai.relationsToPlayer.includes("Friend")
    },
    run: (gameData, runFileManager, args) => {
        console.log(args[0])
        runFileManager.append(`global_var:talk_second_scope = {
            set_relation_friend = { reason = ${args[0]} target = global_var:talk_first_scope }
        }`)
    },
    chatMessage: (args) =>{
        return `{{aiName}} has become your friend.`
    },
    chatMessageClass: "positive-action-message"
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
