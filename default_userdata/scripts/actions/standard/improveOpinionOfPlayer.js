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
    description: `Execute when {{playerName}}'s last last single dialogue or action drastically improved {{aiName}}'s opinion of {{playerName}}.`,

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
        let ai = gameData.getAi();
        let conversationOpinion = ai.getOpinionModifierValue("From conversation");
        if(conversationOpinion < 50){
            ai.setOpinionModifierValue("From conversation", conversationOpinion + args[0]);

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
