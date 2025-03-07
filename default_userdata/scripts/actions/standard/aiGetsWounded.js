//Made by: Durond

/**@typedef {import('../../gamedata_typedefs.js').GameData} GameData */
module.exports = {
    signature: "aiGetsWounded",
    args: [],
    description: `Execute when {{aiName}} got seriously wounded.`,
    creator: "Durond",
    /**
     * @param {GameData} gameData 
     */
    check: (gameData) =>{
        return !gameData.getAi().hasTrait("wounded");
    },

    /**
     * @param {GameData} gameData 
     * @param {Function} runGameEffect
     * @param {string[]} args 
     */
    run: (gameData, runGameEffect, args) => {
        runGameEffect(
            `global_var:talk_second_scope = {
                add_trait = wounded_1
            }`
        )
        gameData.getAi().addTrait({
            category: "health",
            name: "Wounded",
            desc: `${gameData.getAi().shortName} is wounded`    
        })
    },
    chatMessage: () =>{
        return `{{aiName}} got wounded!`
    },
    chatMessageClass: "negative-action-message"
}