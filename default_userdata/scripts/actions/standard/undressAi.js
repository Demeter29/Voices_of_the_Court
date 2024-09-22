module.exports = {
    signature: "undressAi",
    args: [],
    description: `execute when {{aiName}} gets undressed either willingly or forcefully against her wish.`,
    group: "",
    run: (gameData, runFileManager) => {
        runFileManager.append(`
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
    chatMessageClass: "neutral-interaction-message"
}