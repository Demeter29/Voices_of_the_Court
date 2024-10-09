module.exports = {
    signature: "emotionPain",
    args: [],
    description: `execute when {{aiName}} is feeling pain or being hurt.`,
    group: "emotion",
    check: (conv) =>{
        return true;
    },
    run: (gameData, runFileManager) => {
        runFileManager.append(
            `set_global_variable = {
				name = talk_pose
				value = flag:pain
        }`
        )
    },
    chatMessage: () =>{
        
    },
    chatMessageClass: null
}

