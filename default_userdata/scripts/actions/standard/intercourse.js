//Made by: Durond

/**@typedef {import('../../gamedata_typedefs.js').GameData} GameData */
module.exports = {
    signature: "intercourse",
    args: [],
    description: `Execute when {{aiName}} and {{playerName}} had sexual intercourse, only execute when the act is finished, the act can both be consensual or rape.`,
    group: "",

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
    run: (gameData, runFileManager) => {
        runFileManager.append(`
        global_var:talk_first_scope = {
            had_sex_with_effect = {
				CHARACTER = global_var:talk_second_scope
				PREGNANCY_CHANCE = pregnancy_chance
			}
        }
    `);
    },
    chatMessage: (args) =>{
        return `you layed with {{aiName}}`
    },
    chatMessageClass: "neutral-action-message"
}