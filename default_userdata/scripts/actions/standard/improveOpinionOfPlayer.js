//Made by: Durond

/**@typedef {import('../../gamedata_typedefs.js').GameData} GameData */
module.exports = {
    signature: "improveOpinionOfPlayer",
    args: [ 
        {
            name: "opinion",
            type: "number",
            desc: "the number of opinion values the relation improves with. Can be between 1 and 5."
        }
    ],
    description: `Execute when {{playerName}}'s last dialogue or action drastically improved {{aiName}}'s opinion of {{playerName}}.`,
    group: "opinion",

    /**
     * @param {GameData} gameData 
     */
    check: (gameData) =>{
        return true
    },

    /**
     * @param {GameData} gameData 
     * @param {Function} runGameEffect
     * @param {string[]} args 
     */
    run: (gameData, runGameEffect, args) =>{
        let conversationOpinion = getConversationOpinionValue(gameData.characters.get(gameData.aiID).opinionBreakdownToPlayer)
        if(conversationOpinion<50){
            changeConversationOpinionValue(gameData.characters.get(gameData.aiID).opinionBreakdownToPlayer, conversationOpinion+5);

            runGameEffect(
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
    chatMessageClass: "positive-action-message"
}
