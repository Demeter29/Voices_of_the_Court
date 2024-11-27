import { GameData, Memory, Trait, OpinionModifier, Secret} from "./GameData";
import { Character } from "./Character";
const fs = require('fs');
const readline = require('readline');

export async function parseLog(debugLogPath: string): Promise<GameData>{
    let gameData!: GameData

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
                case "new_relations":
                    value = removeTooltip(value)
                    // if (value.includes("your")) {

                    //     value = value.replace("your", gameData.playerName+"'s");
                    // }
                    multiLineTempStorage.push(value)
                break;
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

        if(line.includes("VOTC:IN")){

            //0: VOTC:IN, 1: dataType, 3: rootID 4...: data
            let data = line.split("/;/")

            const dataType = data[1];

            data.splice(0,2)

            const rootID = Number(data[0]);

            for(let i=0;i<data.length;i++){
                data[i] = removeTooltip(data[i])
            }

            switch (dataType){
                case "init":
                    gameData = new GameData(data);
                break;
                case "character": 
                    let char = new Character(data);
                    gameData!.characters.set(char.id, char);
                break;
                case "memory": 
                    let memory = parseMemory(data)
                    gameData!.characters.get(rootID)!.memories.push(memory);
                break;
                case "secret": 
                    let secret = parseSecret(data)
                    gameData!.characters.get(rootID)!.secrets.push(secret);
                break;
                case "trait":
                    gameData!.characters.get(rootID)!.traits.push(parseTrait(data));
                break;
                case "opinons":
                    gameData!.characters.get(rootID)!.opinions.push({id: Number(data[1]), opinon: Number(data[2])});
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
                case "new_relations":
                var tmpTargetId = Number(data[1])
                if(line.split('#')[1] !== ''){
                    
                    gameData!.characters.get(rootID)!.relationsToCharacters.push({id: tmpTargetId, relations: [removeTooltip(line.split('#')[1])]})
                    //gameData!.characters.get(rootID)!.relationsToPlayer = [removeTooltip(line.split('#')[1])]
                }
                
                if(!line.includes("#ENDMULTILINE")){
                    multiLineTempStorage = gameData!.characters.get(rootID)!.relationsToCharacters.find(x => x.id == tmpTargetId)!.relations
                    isWaitingForMultiLine = true;
                    multiLineType = "new_relations";
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

    
    function parseMemory(data: string[]): Memory{
        return {
            type: data[1],
            creationDate: data[2],
            desc: data[3],
            relevanceWeight: Number(data[4])
        }
    }

    function parseSecret(data: string[]): Secret{
        return {
            name: data[1],
            desc: data[2],
            category: data[3],
        }
    }

    
    function parseTrait(data: string[]): Trait{
        return {
            category: data[1],
            name: data[2],
            desc: data[3],
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

    console.log(gameData!);
    return gameData!;
}


export function removeTooltip(str: string): string{
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