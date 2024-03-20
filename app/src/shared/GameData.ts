const fs = require('fs');
const readline = require('readline');

export type Trait = {
    name: string,
    desc: string
}

export type Memory = {
    type: string,
    creationDate: string,
    desc: string,
    relevanceWeight: number
}

export type OpinionModifier = {
    reason: string,
    value: number,
}

export type Character = {
    id: number,
    shortName: string,
    fullName: string,
    primaryTitle: string,
    sheHe: string,
    age: number,
    gold: number;
    opinionOfPlayer: number;
    sexuality: string,
    personality: string,
    greed: number,
    isIndependentRuler: boolean,
    liege: string,
    consort: string,
    culture: string,
    faith: string,
    house: string,
    isRuler: boolean,
    firstName: string,

    memories: Memory[],
    personalityTraits: Trait[],
    relationsToPlayer: string[],
    opinionBreakdownToPlayer: OpinionModifier[]
}


export type GameData = {
    date: string,
    scene: string,
    location: string,

    playerID: number,
    playerName: string,
    aiID: number,
    aiName: string,

    characters: Map<number,Character>
}


export async function parseLog(debugLogPath: string): Promise<GameData>{
    let gameData: GameData

    //some data are passed through multiple lines
    let multiLineTempStorage: any[] = [];
    let isWaitingForMultiLine: boolean = false;
    let multiLineType: string = ""; //relation or opinionModifier

    const fileStream = fs.createReadStream(debugLogPath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        if(isWaitingForMultiLine){
            let value = line.split('#')[0]
            switch (multiLineType){
                case "relations":
                    multiLineTempStorage.push(removeTooltip(value))
                break;
                case "opinionBreakdown":
                        multiLineTempStorage.push(parseOpinionModifier(value));
                break;
            }

            if(line.includes('#ENDMULTILINE')){         
                isWaitingForMultiLine = false;
            }
           continue;
        }

        if(line.includes("GK:IN")){

            //0: GK:IN, 1: dataType, 3: rootID 4...: data
            let data = line.split("/;/")

            const dataType = data[1];

            data.splice(0,2)

            const rootID = Number(data[0]);

            for(let i=0;i<data.length;i++){
                data[i] = removeTooltip(data[i])
            }

            switch (dataType){
                case "init":
                    gameData = parseInit(data);
                break;
                case "character": 
                    let char = parseCharacter(data);
                    gameData!.characters.set(char.id, char);
                break;
                case "memory": 
                    let memory = parseMemory(data)
                    gameData!.characters.get(rootID)!.memories.push(memory);
                break;
                case "trait":
                    switch (data[1]){
                        case "personality":
                            gameData!.characters.get(rootID)!.personalityTraits.push(parseTrait(data));
                        break;
                    }
                break;
                case "relations":
                    
                    if(line.split('#')[1] !== ''){
                        gameData!.characters.get(rootID)!.relationsToPlayer = [removeTooltip(line.split('#')[1])]
                    }
                    
                    if(!line.includes("#ENDMULTILINE")){
                        multiLineTempStorage = gameData!.characters.get(rootID)!.relationsToPlayer
                        isWaitingForMultiLine = true;
                        multiLineType = "relations";
                    }
                break;
                case "opinionBreakdown":
                    if(line.split('#')[1] !== ''){
                        gameData!.characters.get(rootID)!.opinionBreakdownToPlayer = [parseOpinionModifier(line.split('#')[1])]
                    }
                    
                    if(!line.includes("#ENDMULTILINE")){
                        multiLineTempStorage = gameData!.characters.get(rootID)!.opinionBreakdownToPlayer
                        isWaitingForMultiLine = true;
                        multiLineType = "opinionBreakdown";
                    }
            }
        }
    } 
    
    function parseInit(data: string[]): GameData{
        return {
            playerID: Number(data[0]),
            playerName: removeTooltip(data[1]),
            aiID: Number(data[2]),
            aiName: removeTooltip(data[3]),
            date: data[4],
            scene: data[5].substring(11),
            location: data[6],
    
            characters: new Map<number,Character>
        }
    }
    
    function parseCharacter(data: string[]): Character{
        return {
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
            isIndependentRuler: !!data[11],
            liege: data[12],
            consort: data[13],
            culture: data[14],
            faith: data[15],
            house: data[16],
            isRuler: !!data[17],
            firstName: data[18],
            memories: [],
            personalityTraits: [],
            relationsToPlayer: [],
            opinionBreakdownToPlayer: []
        }
    }
    
    function parseMemory(data: string[]): Memory{
        return {
            type: data[1],
            creationDate: data[2],
            desc: data[3],
            relevanceWeight: Number(data[4])
        }
    }
    
    function parseTrait(data: string[]): Trait{
        return {
            name: data[2],
            desc: data[3]
        }
    }

    function parseOpinionModifier(line: string): OpinionModifier{
        line = line.replace(/ *\([^)]*\) */g, "");

        
        

        let splits = line.split(": ");


        for(let i=0;i<splits.length;i++){
            splits[i] = removeTooltip(splits[i])
        }

        

        return {
            reason: splits[0],
            value: Number(splits[1])
        }
    }

    //console.log(gameData!)
    console.log(gameData!.characters.get(gameData!.aiID!)!.relationsToPlayer)
    console.log(gameData!.characters.get(gameData!.aiID!)!.opinionBreakdownToPlayer)

    return gameData!;
}




//TODO: just learn regex for fuck's sake
function removeTooltip(str: string): string{
    let newWords: string[] = []
    str.split(" ").forEach( (word) =>{
        if(word.includes('')){
            newWords.push(word.split('')[0])
        }else{
            newWords.push(word)
        }
    })

    return newWords.join(' ').replace(/ +(?= )/g,'').trim();
}

