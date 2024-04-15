module.exports = {
    signature: "emotionPain",
    args: [],
    description: `execute when {{aiName}} is feeling pain or being hurt.`,
    group: "fight",
    check: (conv) =>{
        return true;
    },
    run: (conv) => {
        conv.runFileManager.append(
            `set_global_variable = {
				name = talk_pose
				value = flag:pain
        }`
        )
    },
    chatMessage: () =>{
        return `emotion: pain`
    },
    chatMessageClass: "neutral-interaction-message"
}

