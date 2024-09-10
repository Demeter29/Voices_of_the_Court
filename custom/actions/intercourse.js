
module.exports = {
    signature: "intercourse",
    args: [],
    description: `execute when {{aiName}} and {{playerName}} had sexual intercourse, only trigger when the act is finished`,
    group: "",
    run: (gameData, runFileManager) => {
        conv.runFileManager.append(`
        global_var:talk_first_scope = {
            intercourse_with_character_effect = { INTERCOURSE_CHARACTER = scope:talk_second_scope }
        }
    `);
    },
    chatMessage: (args) =>{
        return `you layed with {{aiName}}`
    },
    chatMessageClass: "neutral-interaction-message"
}