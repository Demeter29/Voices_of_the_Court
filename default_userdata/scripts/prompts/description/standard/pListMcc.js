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
    
    let playerPersonaItems = [
        `id(${player.id})`,
        mainPosition(player), 
        courtAndCouncilPositions(player), 
        houseAndStatus(player), 
        personalityTraits(player), 
        otherTraits(player), 
        marriage(player),
        describeProwess(player),
        goldStatus(player),
        age(player),
        `faith (${player.faith})`, 
        `culture (${player.culture})`,
    ];
    
    let aiPersonaItems = [
        `id(${ai.id})`,
        mainPosition(ai), 
        courtAndCouncilPositions(ai), 
        listRelationsToPlayer(ai), 
        listRelationsToCharacters(ai),
        houseAndStatus(ai), 
        opinion(ai),
        listOpinionsToCharacters(ai),
        personalityTraits(ai), 
        otherTraits(ai), 
        greedines(ai),
        describeProwess(ai),
        marriage(ai),
        goldStatus(ai),
        age(ai), 
        `faith (${ai.faith})`, 
        `culture (${ai.culture})`,
    ];
    

    //remove "", null, undefined and 0. 
    playerPersonaItems = playerPersonaItems.filter(function(e){return e}); 
    aiPersonaItems = aiPersonaItems.filter(function(e){return e}); 
    
    let output = "";
    output+= `\n[${player.shortName}'s Persona: ${playerPersonaItems.join("; ")}]`;
    output+=`\n[${ai.shortName}'s Persona: ${aiPersonaItems.join("; ")}]`;
    
    if (gameData.characters.size > 2){
        gameData.characters.forEach((value, key) => {
            if(key !== gameData.playerID && key !== gameData.aiID)
            {
                let secondaryAiItems = [
                    `id(${value.id})`,
                    mainPosition(value), 
                    courtAndCouncilPositions(value), 
                    listRelationsToPlayer(value), 
                    listRelationsToCharacters(value),
                    houseAndStatus(value), 
                    opinion(value),
                    listOpinionsToCharacters(value),
                    personalityTraits(value), 
                    otherTraits(value), 
                    greedines(value), 
                    describeProwess(value),
                    marriage(value),  
                    goldStatus(value),
                    age(value), 
                    `faith (${value.faith})`, 
                    `culture (${value.culture})`]
                output+=`\n[${value.shortName}'s Persona: ${secondaryAiItems.join("; ")}]`;
            }
        })
    }



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
    
    function listRelationsToCharacters(char) {
        if (char.relationsToCharacters.length === 0) {
            return `${char.shortName} has no relations.`;
        } else {
            return char.relationsToCharacters
                .map(relation => {
                    const targetCharacter = gameData.characters.get(relation.id);
                    if (targetCharacter) {
                        let relationTypes = relation.relations.join(', ');
                        if (relationTypes.includes("your")) {
                            relationTypes = relationTypes.replace("your", gameData.playerName+"'s");
                        }
                        return `${char.shortName} is ${relationTypes} for ${targetCharacter.shortName}`;
                    } else {
                        return `${char.shortName} has relations to an unknown character (ID: ${relation.id})`;
                    }
                })
                .join('\n');
        }
    }


    function listOpinionsToCharacters(char) {
        if (gameData.characters.size <= 2) {
            return null; // Not enough characters to analyze opinions
        }  
        return "This are " + char.shortName + "'s opinions about other characters of conversation:" + char.opinions
            .map(opinionData => {
                const targetCharacter = gameData.characters.get(opinionData.id);
                if (targetCharacter && targetCharacter.id !== char.id && targetCharacter.id !== player.id) {
                    const op = opinionData.opinon; // Opinion score
                    if (op > 60) {
                        return `${char.shortName} has a very favorable opinion of ${targetCharacter.shortName}`;
                    } else if (op > 20) {
                        return `${char.shortName} has a slightly positive opinion of ${targetCharacter.shortName}`;
                    } else if (op > -20) {
                        return `${char.shortName} has a neutral opinion of ${targetCharacter.shortName}`;
                    } else if (op > -60) {
                        return `${char.shortName} has a slight hatred towards ${targetCharacter.shortName}`;
                    } else {
                        return `${char.shortName} has a very strong hatred towards ${targetCharacter.shortName}`;
                    }
                } else {
                    return `${char.shortName} has an opinion about an unknown character (ID: ${opinionData.id})`;
                }
            })
            .join('\n');
    }
    
        
    function listRelationsToPlayer(char){
        if(char.relationsToPlayer === 0){
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

    function goldStatus(char) {
        const gold = char.gold;
        if (gold >= 500) {
            return `${char.shortName} is wealthy (gold: ${gold})`;
        } else if (gold > 100) {
            return `${char.shortName} is comfortable (gold: ${gold})`;
        } else if (gold > 50) {
            return `${char.shortName} is poor (gold: ${gold})`;
        } else if (gold > 0) {
            return `${char.shortName} is struggling (gold: ${gold})`;
        } else if (gold === 0) {
            return `${char.shortName} has no gold`;
        } else {
            // Character is in debt
            if (gold < -100) {
                return `${char.shortName} has great debt (gold: ${gold})`;
            } else {
                return `${char.shortName} has little debt (gold: ${gold})`;
            }
        }
    }
    
    function age(char) {
        const age = char.age;
    
        if (age < 3) {
            return `${char.shortName} is an infant, unable to speak but quick to babble, cry, or smile to convey needs. They spend their time observing and reaching out for what’s near.`;
        } else if (age < 6) {
            return `${char.shortName} is a small child, learning to speak in simple phrases and curious about their surroundings. They play often, imitating the actions of adults with innocence and energy.`;
        } else if (age < 10) {
            return `${char.shortName} is a child, capable of speaking clearly and enjoying games or tales. They understand basic duties and may help with simple tasks, but they still rely heavily on guidance.`;
        } else if (age < 13) {
            return `${char.shortName} is a preteen, beginning to take on minor tasks or skills training. They speak with more confidence and show a budding sense of duty, often eager to earn approval from elders.`;
        } else if (age < 16) {
            return `${char.shortName} is an adolescent, showing independence in their speech and actions. They are likely training for future duties and may show pride in taking on early responsibilities.`;
        } else if (age < 20) {
            return `${char.shortName} is a young adult, confident and often ready to make decisions. They handle day-to-day responsibilities, and their speech reflects a mix of ambition and youthfulness.`;
        } else if (age < 30) {
            return `${char.shortName} is a mature young adult, acting with intent and clarity. They often balance work and personal matters independently, speaking with purpose and conviction.`;
        } else if (age < 40) {
            return `${char.shortName} is experienced and settled in their ways. Their speech is straightforward, and they carry out their tasks steadily, with reliability.`;
        } else if (age < 60) {
            return `${char.shortName} is a seasoned adult, deliberate in both speech and action. They carry a quiet confidence and tend to offer advice or guidance to those younger.`;
        } else {
            return `${char.shortName} is an elder, often reflective and thoughtful. They may be more reserved, speaking only when necessary, but carry a calm presence that reflects a life of experience.`;
        }
    }
    
    function describeProwess(char){    
        let description = `${char.shortName}'s prowess is `;
        let prowess = char.prowess;
        if (prowess >= 0 && prowess <= 4) {
            description = `terrible: This character is physically weak, with little muscle mass and minimal personal combat skills. They are highly vulnerable in battle and likely to be injured or killed even in minor skirmishes.`;
        } else if (prowess >= 5 && prowess <= 8) {
            description = `poor: This character has below-average physical strength and combat aptitude. They may have some muscle definition but are at significant risk in personal combat and on the battlefield.`;
        } else if (prowess >= 9 && prowess <= 12) {
            description = `average: This character has some physical strength and combat ability. They can hold their own in personal combat against less skilled opponents but remain vulnerable in pitched battles.`;
        } else if (prowess >= 13 && prowess <= 16) {
            description = `good: This character is above average in physical strength and combat skills. They show noticeable muscle mass and are capable of defending themselves well in personal combat and as a knight or commander.`;
        } else if (prowess >= 17 && prowess <= 68) {
            description = `excellent: This character is highly skilled in personal combat and possesses significant physical strength. Their prowess makes them a fearsome presence on the battlefield, with a good balance of survival instincts and lethality.`;
        } else if (prowess === 69) {
            description = `nice: This character’s prowess is both exceptional and memorable. They excel in personal combat with an almost legendary balance of skill and strength. Their presence in battle is inspiring.`;
        } else if (prowess >= 70 && prowess <= 100) {
            description = `excellent: This character is at the peak of physical and combat capability, with unmatched skill and muscle mass. They dominate in personal combat, and their presence as a knight or commander is both intimidating and awe-inspiring.`;
        }
    
        return description;
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

