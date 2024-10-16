import { GameData } from "../shared/gameData/GameData";

//replaces variables inside string. "Write {{aiName}}'s next reply" --> "Write Duke Vratislav's next reply"
export function parseVariables(input: string, gameData: GameData): string {
    return input.replace(/{{([^}]+)}}/gi, (_, variable: string) => {
        variable = variable.trim();
        //@ts-ignore
        return gameData[variable];
    });

    
}