//Made by: Durond

/**@typedef {import('../../gamedata_typedefs.js').GameData} GameData */
module.exports = {
    signature: "intercourse",
    args: [],
    description: `Execute when {{aiName}} and {{playerName}} had sexual intercourse, only execute after the intercourse is over. The act can be both consensual or rape.`,

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
        global_var:talk_first_scope = {
            had_sex_with_effect = {
				CHARACTER = global_var:talk_second_scope
				PREGNANCY_CHANCE = pregnancy_chance
			}
        }
    `);
    },
    chatMessage: (args) =>{
        return `you lay with {{aiName}}`
    },
    chatMessageClass: "neutral-action-message"
}