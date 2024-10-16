//Made by: Durond

/**@typedef {import('../../gamedata_typedefs.js').GameData} GameData */
module.exports = {
    signature: "becomeCloseFriends",
    args: [
        {
            name: "reason",
            type: "string",
            desc: "the reason (the event) that made them become friends. (in past tense)."
        }
    ],
    description: "Execute when a strong and close friendship formed between {{playerName}} and {{aiName}}.",

    /**
     * @param {GameData} gameData 
     */
    check: (gameData) => {
        let ai = gameData.getAi();
        
        return (ai.getOpinionModifierValue("From conversation") > 35 &&
                ai.opinionOfPlayer > 0 &&
                !ai.relationsToPlayer.includes("Friend"))
    },

    /**
     * @param {GameData} gameData 
     * @param {Function} runGameEffect
     * @param {string[]} args 
     */
    run: (gameData, runGameEffect, args) => {
        runGameEffect(`global_var:talk_second_scope = {
            set_relation_friend = { reason = ${args[0]} target = global_var:talk_first_scope }
        }`)

        gameData.getAi().relationsToPlayer.push("Friend");
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
