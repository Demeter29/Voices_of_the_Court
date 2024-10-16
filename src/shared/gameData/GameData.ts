import { Character } from "./Character";
import { removeTooltip } from "./parseLog";

/**@typedef {import('./Character').Character} Character */

export type Trait = {
    category: string,
    name: string,
    desc: string
}

export type Memory = {
    type: string,
    creationDate: string,
    desc: string,
    /**@property {number} relevanceWeight - how relevant the memory to the current conversation. The higher, the more relevant. */
    relevanceWeight: number
}

export type OpinionModifier = {
    reason: string,
    value: number,
}


/** 
 * @class
*/
export class GameData {
    date: string;
    scene: string;
    location: string;
    locationController: string;

    playerID: number;
    playerName: string;
    aiID: number;
    aiName: string;

    characters: Map<number,Character>

    constructor(data: string[]){
            this.playerID = Number(data[0]),
            this.playerName = removeTooltip(data[1]),
            this.aiID = Number(data[2]),
            this.aiName = removeTooltip(data[3]),
            this.date = data[4],
            this.scene = data[5].substring(11),
            this.location = data[6],
            this.locationController = data[7],
    
            this.characters = new Map<number,Character>
    }

    getPlayer(): Character{
        return this.characters.get(this.playerID)!;
    }

    /**
     * 
     * @return {Character} ai
     */
    getAi(): Character{
        return this.characters.get(this.aiID)!;
    }
}