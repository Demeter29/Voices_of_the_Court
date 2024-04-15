module.exports = {
    signature: "aiGetsWounded",
    args: [],
    description: `execute when {{aiName}} gets seriously wounded.`,
    group: "fight",
    check: (conv) =>{
        return true;
    },
    run: (conv) => {
        conv.runFileManager.append(
            `global_var:talk_second_scope = {
                add_trait = wounded_1
            }`
        )
    },
    chatMessage: () =>{
        return `{{aiName}} got wounded!`
    },
    chatMessageClass: "negative-interaction-message"
}

