module.exports = (data) =>{

    switch (data.scene){
        case "throneroom": return throneRoom(data);
        case "garden": return garden(data);
        case "bedchamber": return bedchamber(data);
        case "feast": return feast(data);
    }
}

function throneRoom(data){
    const relationHierarchy = ["Liege", "Vassal", "Wife"];
    const primaryRelation = getMostImportantRelation(data.aiRelations, relationHierarchy);

    return `*${data.aiSheHe} enters the throneroom, noticing ${data.playerName} sitting on his throne, ${data.aiSheHe} slowly approaches and bows before him.* My lord, it is a honour to meet you! Did you wish to speak to me?`
    
}

function garden(data){

}

function bedchamber(data){

    return `*I enter the bedchamber, noticing ${data.playerName} sitting on the bed, I slowly approach and bow before him.* My lord, it is a honour to meet you! Did you wish to speak to me? *I await his response eagerly*`
}

function feast(data){

}
  

function getMostImportantRelation(relations, relationHierarchy){
    for(const relation in relationHierarchy){
        if(relations.includes(relation)){
            return relation;
        }
    }

    return "0"; //no important relation
}