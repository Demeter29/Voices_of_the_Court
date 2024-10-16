//Made by: Durond

/**@typedef {import('../../gamedata_typedefs.js').GameData} GameData */
module.exports = {
    signature: "emotionSad",
    args: [],
    description: `Execute when {{aiName}} is feeling sad.`,
    group: "emotion",

    /**
     * @param {GameData} gameData 
     */
    check: (conv) =>{
        return true;
    },

    /**
     * @param {GameData} gameData 
     * @param {Function} runGameEffect
     * @param {string[]} args 
     */
    run: (gameData, runFileManager) => {
        runFileManager.append(
            `set_global_variable = {
				name = talk_pose
				value = flag:sad
        }`
        )
    },
    chatMessage: () =>{
        
    },
    chatMessageClass: null
}

