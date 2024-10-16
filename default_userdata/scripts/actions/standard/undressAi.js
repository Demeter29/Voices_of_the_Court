//Made by: Durond

/**@typedef {import('../../gamedata_typedefs.js').GameData} GameData */
module.exports = {
    signature: "undressAi",
    args: [],
    description: `Execute when {{aiName}} got undressed either willingly or forcefully against her wish.`,

    /**
     * @param {GameData} gameData 
     */
    check: (gameData) => {
        return true;
    },

    /**
     * @param {GameData} gameData 
     * @param {Function} runGameEffect
     * @param {string[]} args 
     */
    run: (gameData, runGameEffect, args) => {
        runGameEffect(`
        global_var:talk_second_scope = {
            add_character_flag = {
                flag = is_naked
                days = 1
            }
        }
    `);
    },
    chatMessage: (args) =>{
        return `{{aiName}} got undressed`
    },
    chatMessageClass: "neutral-action-message"
}