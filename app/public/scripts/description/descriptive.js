//Made by: Durond
//Script version: v1

module.exports = (data) =>{
return `${getSummaryString(data)} ${getRelationString(data)} ${getFaithString(data)} She is ${data.aiTrait1Name}, ${data.aiTrait1Desc} She is ${data.aiTrait2Name}, ${data.aiTrait2Desc} She is ${data.aiTrait3Name}, ${data.aiTrait3Desc} ${createOpinionString(data)} ${createMarriageString(data)} She is a member of House ${data.aiHouse}. ${getPrimaryTitleAndLiegeString(data)} The date is ${data.date}, The location is ${data.location}. We meet in the ${data.scene}.`
}

function getSummaryString(data){
    let nobleManOrWoman;
    if(data.aiSheHe === "he"){
        nobleManOrWoman = "nobleman";
    }
    else{
        nobleManOrWoman = "noblewoman"
    }
    return `${data.aiName} is a ${data.aiAge} years old ${data.aiCulture} ${nobleManOrWoman}.`
}

function getRelationString(data){
    let relations = data.aiRelations;
    if(relations.length === 0){
        return `${data.aiSheHe} has no relation to ${data.playerName}.`
    }

    let output="";
    for(let relation of relations){
        output+= relation + ", ";
    }

    return output+` of ${data.playerName}.`
}

function getFaithString(data){
    let output=`${data.aiSheHe} follows the faith of ${data.aiFaith}`

    if(data.aiFaith === data.playerFaith){
        output+=`, the same faith as ${data.playerName}.`
    }
    else{
        output+=`, a different faith as ${data.playerName}.`
    }

    return output;
}

function createMarriageString(data){
    if(data.aiConsort != ""){
        return `${data.aiSheHe} is married to ${data.aiConsort}.`
    }
    else{
        return `${data.aiSheHe} is unmarried.`
    }
}

//Independent/Liege
function getPrimaryTitleAndLiegeString(data){
    if(data.aiIsRuler){
        if(data.aiIsIndependentRuler){
            return `the independent ruler of ${data.aiPrimaryTitle} with no liege.`
        }
        else{
            return `the ruler of ${data.aiPrimaryTitle}, and the vassal of ${data.aiLiege}.`
        }
    }
    else{
        return `not a ruler, and a subject of ${data.aiLiege}.`
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
       return "The meeting starts in the throneroom."
    }
    else if(scene == "garden"){
        return "The meeting starts in the castle's garden."
    }
    else if(scene == "bedchamber"){
        return "The meeting starts in Thei bedchamber."
    }
    else if(scene == "dungeon"){
        return "The meeting starts in the dungeon."
    }
    else if(scene == "feast"){
        return `The meeting starts in the great hall, where we are in a feast hosted by ${data.activityHost}, surrounded by many great lords and ladies.`
    }
}

//Opinion
//translating the number into words seems to yield better results
function createOpinionString(data){
    let opinion = data.aiOpinion
    let output;
    if(opinion < -60){
        output=`${data.aiSheHe} opinion of ${data.playerName} is very bad!, ${data.aiSheHe} despises him! ${data.aiSheHe} hates him with full anger!`
    }
    else if(opinion < -20){
        output=`${data.aiSheHe} opinion of ${data.playerName} is bad!, ${data.aiSheHe} hate him a little.`
    }
    else if(opinion < 20){
        output=`${data.aiSheHe} opinion of ${data.playerName} is neutral.`
    }
    else if(opinion < 60){
        output=`${data.aiSheHe} opinion of ${data.playerName} is good!, ${data.aiSheHe} like him.`
    }
    else{
        output=`${data.aiSheHe} opinion of ${data.playerName} is very good!, ${data.aiSheHe} really like him!`
    }

    return output;
}

