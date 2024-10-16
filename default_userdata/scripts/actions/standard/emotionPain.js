//Made by: Durond

/**@typedef {import('../../gamedata_typedefs.js').GameData} GameData */
module.exports = {
    signature: "emotionPain",
    args: [],
    description: `Execute when {{aiName}} is feeling pain or being hurt.`,
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
    run: (gameData, runGameEffect, args) => {
        runGameEffect(
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

