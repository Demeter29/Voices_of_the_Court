//Made by: Durond
//Script version: v1
//NOTE: trait descriptions are not included, you should use this with an exMessages script that includes them, like aliChat.

module.exports = (date, scene, location, player, ai) =>{

let playerPersonaItems = [`full name(${player.fullName})`, nobleManOrWoman(player), titleAndVassalage(player), `age(${ai.age})`, marriage(player), `faith(${ai.faith})`, `culture(${ai.culture})`, personalityTraits(player)];
let aiPersonaItems = [`full Name(${ai.fullName})`, nobleManOrWoman(ai), titleAndVassalage(ai), `age(${ai.age})`, greedines(ai), marriage(ai), `faith(${ai.faith})`, `culture(${ai.culture})`, personalityTraits(ai), listRelationsToPlayer(ai)];

//remove "", null, undefined and 0. 
playerPersonaItems = playerPersonaItems.filter(function(e){return e}); 
aiPersonaItems = aiPersonaItems.filter(function(e){return e}); 

let output = "";

output+=`\n[date(${date}), location(${location}), scenario(${scenario()})]`

output+= `\n[${player.shortName}'s Persona: ${playerPersonaItems.join(", ")}]`;

output+=`\n[${ai.shortName}'s Persona: ${aiPersonaItems.join(", ")}]`;



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

function personalityTraits(char){
    let traitNames = char.personalityTraits.map(trait => trait.name);

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
        return `ruler of ${char.primaryTitle} under the vassalage of ${char.liege}`;
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
    }
}


}