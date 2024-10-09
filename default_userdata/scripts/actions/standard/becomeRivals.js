module.exports = {
    signature: "becomeRivals",
    args: [
        {
            name: "reason",
            type: "string",
            desc: "the reason (the event) that made them become rivals with eachother. (write it in past tense)."
        }
    ],
    description: "Trigger when something drastic happens and {{playerName}} and {{aiName}} become rivals with eachother. it's enough of {{aiName}} does something that {playerName}} really didn't like.",
    check: (gameData) => {
        return true;
    },
    run: (gameData, runFileManager, args) => {
        console.log(args[0])
        runFileManager.append(`global_var:talk_second_scope = {
            set_relation_rival = { reason = ${args[0]} target = global_var:talk_first_scope }
        }`)
    },
    chatMessage: (args) =>{
        return `{{aiName}} has become your rival.`
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
