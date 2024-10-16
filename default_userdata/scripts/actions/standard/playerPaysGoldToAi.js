//Made by: Durond

/**@typedef {import('../../gamedata_typedefs.js').GameData} GameData */
module.exports = {
    signature: "playerPaysGoldToAi",
    args: [
        {
            name: "amount",
            type: "number",
            desc: "the amount of gold {{playerName}} pays to {{aiName}}"
        }
    ],
    description: `Execute when {{playerName}} paid gold to {{aiName}} and {{aiName}} accepted it.`,
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
    run: (gameData, runGameEffect, args) => {
        runGameEffect(`
            global_var:talk_second_scope = {
            add_gold = ${args[0]};
            }

            global_var:talk_first_scope = {
                remove_short_term_gold = ${args[0]};
            }
        `);

        gameData.getPlayer().gold -= args[0];
        gameData.getPlayer().gold += args[0];
    },
    chatMessage: (args) =>{
        return `You paid ${args[0]} gold to {{aiName}}`
    },
    chatMessageClass: "neutral-action-message"
}