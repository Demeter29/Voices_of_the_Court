module.exports = {
    signature: "emotionHappy",
    args: [],
    description: `execute when {{aiName}} is feeling happy.`,
    group: "emotion",
    check: (gameData) =>{
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
        
    },
    chatMessageClass: null
}

