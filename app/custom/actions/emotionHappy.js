module.exports = {
    signature: "emotionHappy",
    args: [],
    description: `execute when {{aiName}} is feeling happy.`,
    group: "emotion",
    check: (conv) =>{
        return true;
    },
    run: (gameData, runFileManager) => {
        runFileManager.append(
            `set_global_variable = {
				name = talk_pose
				value = flag:happy
        }`
        )
    },
    chatMessage: () =>{
        return `emotion: happy`
    },
    chatMessageClass: "neutral-interaction-message"
}

