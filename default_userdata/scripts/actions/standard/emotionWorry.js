//Made by: Durond

/**@typedef {import('../../gamedata_typedefs.js').GameData} GameData */
module.exports = {
    signature: "emotionWorry",
    args: [],
    description: `Execute when {{aiName}} is feeling worried.`,

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
				value = flag:worry
            }`
        )
    },
    chatMessage: () =>{
        
    },
    chatMessageClass: null
}

