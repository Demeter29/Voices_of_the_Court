module.exports = {
    signature: "emotionWorry",
    args: [],
    description: `execute when {{aiName}} is feeling worried.`,
    group: "fight",
    check: (conv) =>{
        return true;
    },
    run: (conv) => {
        conv.runFileManager.append(
            `set_global_variable = {
				name = talk_pose
				value = flag:worry
        }`
        )
    },
    chatMessage: () =>{
        return `emotion: worry`
    },
    chatMessageClass: "neutral-interaction-message"
}

