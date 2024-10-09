module.exports = {
    signature: "aiGetsWounded",
    args: [],
    description: `execute when {{aiName}} gets seriously wounded.`,
    group: "fight",
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