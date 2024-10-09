module.exports = {
    signature: "emotionWorry",
    args: [],
    description: `execute when {{aiName}} is feeling worried.`,
    group: "emotion",
    check: (conv) =>{
        return true;
    },
    run: (gameData, runFileManager) => {
        runFileManager.append(
            `set_global_variable = {
				name = talk_pose
				value = flag:worry
        }`
        )
    },
    chatMessage: () =>{
        
    },
    chatMessageClass: null
}

