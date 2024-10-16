//Made by: Durond

/**@typedef {import('../../gamedata_typedefs.js').GameData} GameData */
module.exports = {
    signature: "aiGetsWounded",
    args: [],
    description: `Execute when {{aiName}} got seriously wounded.`,
    group: "fight",

    /**
     * @param {GameData} gameData 
     */
    check: (gameData) =>{
        const char = gameData.characters.get(gameData.aiID);

        return !hasTrait(char, "Wounded")
    },
    run: (gameData, runFileManager) => {
        runFileManager.append(
            `global_var:talk_second_scope = {
                add_trait = wounded_1
            }`
        )
    },
    chatMessage: () =>{
        return `{{aiName}} got wounded!`
    },
    chatMessageClass: "negative-action-message"
}

function hasTrait(char, traitName){
    let output = false;
    char.traits.forEach(trait => {
        if(trait.name === traitName){
            output = true;
        }
    });

    return output
}