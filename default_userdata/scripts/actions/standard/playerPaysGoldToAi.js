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
    check: (gameData) => {
        return true;
    },
    run: (gameData, runFileManager) => {
        runFileManager.append(`
            global_var:talk_second_scope = {
            add_gold = 50;
            }

            global_var:talk_first_scope = {
                        remove_short_term_gold = 50;
            }
        `);
        
    },
    chatMessage: (args) =>{
        return `You paid ${args[0]} gold to {{aiName}}`
    },
    chatMessageClass: "neutral-action-message"
}