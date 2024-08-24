module.exports = {
    signature: "emotionSad",
    args: [],
    description: `execute when {{aiName}} is feeling sad.`,
    group: "emotion",
    check: (conv) =>{
        return true;
    },
    run: (conv) => {
        conv.runFileManager.append(
            `set_global_variable = {
				name = talk_pose
				value = flag:sad
        }`
        )
    },
    chatMessage: () =>{
        return `emotion: sad`
    },
    chatMessageClass: "neutral-interaction-message"
}

