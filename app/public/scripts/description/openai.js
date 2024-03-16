module.exports = (data) => {
    return `
    You are going to roleplay as ${data.aiName}, and only as ${data.aiName}!

    I am going to roleplay as ${data.playerName}.
    Don't roleplay ${data.playerName}'s actions!

    Write 1 reply only in internet RP style, italicize actions, and avoid quotation marks. 
    Use markdown.. 
    Write at least 1 paragraph, up to 2. Write a maximum of 5 sentences. Always stay in character and avoid repetition.

    Information about ${data.aiName}:
    is ${data.aiTrait1Name}. ${data.aiTrait1Desc}
    is ${data.aiTrait2Name}. ${data.aiTrait2Desc}
    is ${data.aiTrait3Name}. ${data.aiTrait3Desc}
    is ${getPrimaryTitleAndLiegeString(data.aiIsRuler, data.aiIsIndependentRuler, data.aiLiege, data.aiPrimaryTitle)}
    is ${data.aiAge} years old.
    has ${data.aiGold} gold.
    is ${data.aiSexuality}.
    personality is ${data.aiPersonality}.
    culture is ${data.aiCulture}.
    religion is ${data.aiFaith}.
    is member of House ${data.aiHouse}.
    is ${getConsorOrBetrothedString(data.aiConsort)}

    Information about ${data.playerName}:
    is the ${getPrimaryTitleAndLiegeString(data.playerIsRuler, data.playerIsIndependent, data.playerLiege, data.playerPrimaryTitle)}
    is ${data.playerAge} years old.
    culture is ${data.playerCulture}.
    religion is ${data.playerFaith}.
    is member of House ${data.playerHouse}.
    is ${getConsorOrBetrothedString(data.playerConsort)}

    relations of the characters are the following:
    ${createRelationString(data)} 

    ${createOpinionString(data.aiOpinion)}
    The date is ${data.date}, Act like it's ${data.date}, if something requires knowledge past that, act like you don't know anything about that, NEVER BREAK CHARACTER".  

    ${createSceneString(data)}
    We are located in ${data.location}.

`}

//Independent/Liege
function getPrimaryTitleAndLiegeString(isRuler, isIndependentRuler, liege, primaryTitle){
    if(isRuler){
        if(isIndependentRuler){
            return `the independent ruler of ${primaryTitle} with no liege.`
        }
        else{
            return `the ruler of ${primaryTitle}, and the vassal of ${liege}.`
        }
    }
    else{
        return `not a ruler, and a subject of ${liege}.`
    }
}

function getConsorOrBetrothedString(consort){
    if(consort){
        return `married to ${consort} for life.`
    }
    else{
        return 'unmarried.'
    }
}

//Relation

function createRelationString(data){
    if(data.aiRelations[0] == '') return "There is no relation between the two character.";
    let output="";

    data.aiRelations.forEach(relation =>{
        if(relation.includes("'s")){
            output+=`${data.aiName} is ${relation} \n`; //eg. You are King Stephen's marshal
        }
        else if(relation == 'Lover'){
            if( !(data.aiRelations.includes('Wife') || relation.includes('Husband'))){
                output+=`${data.aiName} is ${data.playerName}'s' lover, They are deeply in love with eachother but They are not married so They have to keep it in secret\n`;
            }
            else{
                output+=`${data.aiName} is ${data.playerName}'s lover, They are deeply in love with eachother\n`;
            }  
        }
        else{
            output+=`${data.aiName} is ${data.playerName}'s ${relation}\n`;
        }
       
    })
    

    return output;
}

function createSceneString(data){
    
    const scene = data.sceneFlag.substring(11);
    console.log("scene: "+scene)
    if(scene == "throneroom"){
       return "Our meeting starts in the throneroom."
    }
    else if(scene == "garden"){
        return "Our meeting starts in the castle's garden."
    }
    else if(scene == "bedchamber"){
        return "Our meeting starts in our bedchamber."
    }
    else if(scene == "dungeon"){
        return "Our meeting starts in the dungeon."
    }
    else if(scene == "feast"){
        return `Our meeting starts in the great hall, where we are in a feast hosted by ${data.activityHost}, surrounded by many great lords and ladies.`
    }
}

//Opinion
//translating the number into words seems to yield better results
function createOpinionString(opinion){
    let output;
    if(opinion < -60){
        output="Your opinion of me is very bad!, you despise me! you hate me with full anger!"
    }
    else if(opinion < -20){
        output="Your opinion of me is bad!, you hate me a little."
    }
    else if(opinion < 20){
        output="Your opinion of me is neutral."
    }
    else if(opinion < 60){
        output="Your opinion of me is good!, you like me."
    }
    else{
        output="Your opinion of me is very good!, you really like me!"
    }

    return output;
}

