module.exports = {
    signature: "playerPaysGoldToAi",
    args: [
        {
            name: "amount",
            type: "number",
            desc: "the amount of gold {{playerName}} pays to {{aiName}}"
        }
    ],
    description: `execute when {{playerName}} pays gold to {{aiName}} and {{aiName}} accepts it.`,
    group: "",
    run: (conv) => {
        //
    },
    chatMessage: (args) =>{
        return `You paid ${args[0]} gold to {{aiName}}`
    },
    chatMessageClass: "neutral-interaction-message"
}