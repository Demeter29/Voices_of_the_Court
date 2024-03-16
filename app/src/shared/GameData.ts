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
    relationsToPlayer: string[]
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
    let multiLineTempStorage: string[] = [];
    let isWaitingForMultiLine: boolean = false;

    const fileStream = fs.createReadStream(debugLogPath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        if(isWaitingForMultiLine){
            if(line.includes('#ENDMULTILINE')){
                multiLineTempStorage.push(removeTooltip(line.split('#')[0]))
                isWaitingForMultiLine = false;
            }
            else{
                multiLineTempStorage.push(removeTooltip(line));
            }
           continue;
        }

        if(line.includes("GK:IN")){
            //console.log(line.split("GK:IN")[1])

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
                    }
                break;
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
            relationsToPlayer: []
        }
    }
    
    function parseMemory(data: string[]): Memory{
        //console.log(removeTooltip(data[4]))
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

    console.log(gameData!)
    console.log(gameData!.characters.get(gameData!.aiID)?.memories)

    console.log(gameData!.characters.get(gameData!.playerID)?.memories)

    return gameData!;
}




//TODO: just learn regex for fuck's sake
function removeTooltip(str: string): string{
    let newWords: string[] = []
   // console.log(str.split(' '))
    str.split(" ").forEach( (word) =>{
        if(word.includes('')){
            newWords.push(word.split('')[0])
        }else{
            newWords.push(word)
        }
    })

    return newWords.join(' ').replace(/ +(?= )/g,'').trim();
}



/*
export function clipboardToGameData(clipboardText: string): GameData {

        let varLines = clipboardText.split('%;%');

        let gameData = new Map();   
        for(const line of varLines){
            let lineSplit: string[] = line.split("%:%");

            
            
            gameData.set(lineSplit[0], lineSplit[1])

            if(lineSplit[1] === ""){
               // console.log(lineSplit)
                gameData.set(lineSplit[0], null);
                //console.log(gameData.get(lineSplit[0]))
            }


            //@ts-ignore
            if(lineSplit[1] != "" && !isNaN(lineSplit[1])){
                gameData.set(lineSplit[0], Number(lineSplit[1]));
            }


        }

        gameData.delete('GK:IN');

        console.log(gameData.get('scene'))
        gameData.set('scene', (gameData.get('scene')).substring(11));

        gameData.set('aiPersonalityTraits', groupTraits('aiPersonalityTrait', gameData))

        console.log(gameData)


        return gameData;
}

//groups traits with the same prefix into 1 array.
function groupTraits(traitPrefix: string, gameData: GameData): Trait[]{
    let output: Trait[] = [];

    gameData.forEach( (value, key, map) => {
        if(key.startsWith(traitPrefix)){
            let traitSuffix = key.substring(traitPrefix.length);
            console.log(traitSuffix)

            if(traitSuffix.includes('Name')){
                if(gameData.has(key.replace('Name', 'Desc')) && value != null){
                    output.push( {
                        name: value,
                        desc: gameData.get(key.replace('Name', 'Desc'))
                    })

                    gameData.delete(key.replace('Name', 'Desc'));
                }

                gameData.delete(key);
            }
            else if(traitSuffix.includes('Desc')){
                if(gameData.has(key.replace('Desc', 'Name')) && value != null){
                    output.push( {
                        name: gameData.get(key.replace('Desc', 'Name')),
                        desc: value
                    })

                    gameData.delete(key.replace('Desc', 'Name'));
                }

                gameData.delete(key);
            }
        }
    })

    return output;
}
*/