//Made by: Durond
//NOTE: trait descriptions are not included, you should use this with an exMessages script that includes them, like aliChat.

/**@typedef {import('../../../gamedata_typedefs.js').GameData} GameData */
/**@param {GameData} gameData */
module.exports = (gameData) =>{
    const player = gameData.characters.get(gameData.playerID);
    const ai = gameData.characters.get(gameData.aiID);
    const date = gameData.date;
    const location = gameData.location;
    let locationController = gameData.locationController;
    if(locationController === player.fullName){
        locationController = player.shortName;
    }
    else if(locationController === ai.fullName){
        locationController = ai.shortName;
    }
    const scene = gameData.scene;
    
    let playerPersonaItems = [,
        mainPosition(player), 
        courtAndCouncilPositions(player), 
        houseAndStatus(player), 
        personalityTraits(player), 
        otherTraits(player), 
        marriage(player), 
        `age(${player.age})`, 
        `faith(${player.faith})`, 
        `culture(${player.culture})`,
        `wealth(${player.gold} gold)`
    ];
    
    let aiPersonaItems = [,
        mainPosition(ai), 
        courtAndCouncilPositions(ai), 
        listRelationsToPlayer(ai), 
        houseAndStatus(ai), 
        opinion(ai), 
        personalityTraits(ai), 
        otherTraits(ai), 
        greedines(ai), 
        marriage(ai),  
        `age(${ai.age})`, 
        `faith(${ai.faith})`, 
        `culture(${ai.culture})`,
        `wealth(${ai.gold} gold)`
    ];
    
    //remove "", null, undefined and 0. 
    playerPersonaItems = playerPersonaItems.filter(function(e){return e}); 
    aiPersonaItems = aiPersonaItems.filter(function(e){return e}); 
    
    let output = "";
    output+= `\n[${player.shortName}'s Persona: ${playerPersonaItems.join("; ")}]`;
    output+=`\n[${ai.shortName}'s Persona: ${aiPersonaItems.join("; ")}]`;
    output+=`\n[date(${date}), location(${location}), scenario(${scenario()})]`;
    
    return output;
    
    function mainPosition(char){
        if(isLandlessAdventurer(char)){
            if(char.isRuler){
                return `Leader of ${char.primaryTitle}, a group of ${char.liegeRealmLaw}`
            }
            else{
                return `A follower of ${char.liege}, they are a group of ${char.liegeRealmLaw}`
            }
        }
        else if(char.isLandedRuler){
            if(char.isIndependentRuler){
                return `Independent ruler of ${char.primaryTitle}`
            }
            else{
                return `Ruler of ${char.primaryTitle}, vassal of ${char.liege}`
            }
            
        }
        else if(char.isKnight){
            return `Knight of ${char.liege}`
        }        
    }

    function courtAndCouncilPositions(char){
        if(char.heldCourtAndCouncilPositions){
            return `${char.heldCourtAndCouncilPositions} of ${char.liege}`
        }
        else{
            return ``
        }
    }

    function houseAndStatus(char){
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

        if(char.house){
            output+=` of house ${char.house}`
        }
    
        return output;
    }

    function opinion(char){
        const op = char.opinionOfPlayer;

        if(op>60){
            return `${char.shortName} has a very favorable opinion of ${player.shortName}`
        }
        else if(op>20){
            return `${char.shortName} has a slightly positive opinion of ${player.shortName}`
        }
        else if(op>-20){
            return `${char.shortName} has a neutral opinion of ${player.shortName}`
        }
        else if(op>-60){
            return `${char.shortName} has a slight hatred towards ${player.shortName}`
        }
        else{
             return `${char.shortName} has a very strong hatred towards ${player.shortName}`
        }
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
            if(char.consort == player.fullName){
                return `married to ${player.shortName}`;
            }
            else if(char.consort == ai.fullName){
                return `married to ${ai.shortName}`;
            }
            else{
                return `married to ${char.consort}`
            }
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
                return `${ai.shortName} meets ${player.shortName} in ${locationController}'s throneroom.`;
            case "garden":
                return `${ai.shortName} meets ${player.shortName} in ${locationController}'s castle garden.`;
            case "bedchamber":
                return `${ai.shortName} meets ${player.shortName} in their private bedchamber.`;
            case "feast":
                return `${ai.shortName} talks to ${player.shortName} during the feast hosted by ${locationController}.`;
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

    function isLandlessAdventurer(char){
        const landlessLaws = ["Wanderers", "Swords-for-Hire", "Scholars", "Explorers", "Freebooters", "Legitimists"]
        return landlessLaws.includes(char.liegeRealmLaw);
    }

