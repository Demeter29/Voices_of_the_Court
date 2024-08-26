//Made by: Durond
//Script version: v1
//NOTE: trait descriptions are not included, you should use this with an exMessages script that includes them, like aliChat.

/*
id: Number(data[0]),
            shortName: data[1],
            fullName: data[2],
            primaryTitle: data[3],
            sheHe: data[4],
            age: Number(data[5]),
            gold: Number(data[6]),
            opinionOfPlayer: Number(data[7]),
            sexuality: removeTooltip(data[8]),
            personality: data[9],
            greed: Number(data[10]),
            isIndependentRuler: !!Number(data[11]),
            liege: data[12],
            consort: data[13],
            culture: data[14],
            faith: data[15],
            house: data[16],
            isRuler: !!Number(data[17]),
            firstName: data[18],
            capitalLocation: data[19],
            topLiege: data[20],
            prowess: Number(data[21]),
            isKnight: !!Number(data[22]),
            memories: [],
            personalityTraits: [],
            relationsToPlayer: [],
            opinionBreakdownToPlayer: []
*/

module.exports = (date, scene, location, player, ai) =>{

let playerPersonaItems = [`full name(${player.fullName})`, nobleManOrWoman(player), titleAndVassalage(player), `age(${ai.age})`, marriage(player), `faith(${ai.faith})`, `culture(${ai.culture})`, otherTraits(player), personalityTraits(player)];
let aiPersonaItems = [`full Name(${ai.fullName})`, nobleManOrWoman(ai), titleAndVassalage(ai), `age(${ai.age})`, greedines(ai), marriage(ai), `faith(${ai.faith})`, `culture(${ai.culture})`, otherTraits(ai), personalityTraits(ai), listRelationsToPlayer(ai)];


//remove "", null, undefined and 0. 
playerPersonaItems = playerPersonaItems.filter(function(e){return e}); 
aiPersonaItems = aiPersonaItems.filter(function(e){return e}); 


let output = "";

output+= `\n[${player.shortName}'s Persona: ${playerPersonaItems.join(", ")}]`;

output+=`\n[${ai.shortName}'s Persona: ${aiPersonaItems.join(", ")}]`;

output+=`\n[date(${date}), location(${location}), scenario(${scenario()})]`;



return output;

function nobleManOrWoman(char){
    let output="";
    if(char.house){
        output+="noble";
    }
    else{
        output+="lowborn ";
    }

    if(char.SheHe === "she"){
        output+= "woman";
    }
    else if(char.SheHe === "he"){
        output+= "man";
    }

    return output;
}

function greedines(char){
    if(char.greed>75){
        return "very greedy";
    }
    else if(char.greed>50){
        return "greedy";
    }
    else if(char.greed>25){
        return "slightly greedy";
    }
    else{
        return null;
    }
}

function marriage(char){
    if(char.consort){
        return `married to ${char.consort}`
    }
    else{
        return `unmarried`;
    }
}

function otherTraits(char){
    let otherTraits = char.traits.filter((trait) => trait.category != "Personality Trait");

    let traitNames = otherTraits.map(trait => trait.name);

    let output = "traits("
    output+= traitNames.join(", ");
    output+=")";

    return output;
}

function personalityTraits(char){
    let personalityTraits = filterTraitsToCategory(char.traits, "Personality Trait");

    let traitNames = personalityTraits.map(trait => trait.name);

    let output = "personality("
    output+= traitNames.join(", ");
    output+=")";

    return output;
}

function titleAndVassalage(char){
    if(char.primaryTitle.startsWith("Unlanded")){
        return `has no land, subject of ${char.liege}`;
    }
    else if(char.isIndependentRuler){
        return `independent ruler of ${char.primaryTitle}`;
    }
    else{
        return `ruler of ${char.primaryTitle}, under the vassalage of ${char.liege}`;
    }
}

function listRelationsToPlayer(char){
    if(char.relationsToPlayer.length === 0){
        return `has no relation to ${player.shortName}`;
    }
    else{
        return `${char.shortName} is the ${char.relationsToPlayer.join(', ')} of ${player.shortName}`;
    }
}

function scenario(){
    switch (scene){
        case "throneroom":
            return `${ai.shortName} meets ${player.shortName} in the court's throneroom.`;
        case "garden":
            return `${ai.shortName} meets ${player.shortName} in the castle's garden.`;
        case "bedchamber":
            return `${ai.shortName} meets ${player.shortName} in their private bedchamber.`;
        case "feast":
            return `${ai.shortName} talks to ${player.shortName} during the feast hosted by ${player.shortName}.`;
        case "army_camp":
            return `${ai.shortName} meets ${player.shortName} in the army camp.`;
        case "hunt":
            return `${ai.shortName} meets ${player.shortName} while hunting in the foggy forest. Their weapons are bows.`;
        case "dungeon":
            return `${ai.shortName} meets ${player.shortName} in the dungeon, where ${ai.shortName} is held as a prisoner.`;
        case "alley":
            return `${ai.shortName} meets ${player.shortName} in the narrow alley, hidden from everyone`;
    }
}


}


//help functions

function filterTraitsToCategory(traits, category){
    return traits.filter((trait) => trait.category == category);
}