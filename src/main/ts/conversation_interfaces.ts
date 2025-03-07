import { GameData } from "../../shared/gameData/GameData";

export interface Message {
    role: 'system' | 'user' | 'assistant';
    name?: string,
    content: string ;
}


export interface ErrorMessage {
    text: string,
}

export interface MessageChunk {
    role?: 'system' | 'user' | 'assistant' | 'tool';
    content?: string | null | undefined;
}

export interface Preset {
    systemPrompt: string;
    inputSequence: string;
    outputSequence: string;
}

export interface Setting {
    mainPrompt: string,
    inputSequence: string,
    outputSequence: string,
    parameters: Object;
}

export interface Summary{
    date: string,
    content: string
}

export interface ActionArgument{
    name: string;
    type: string;
    desc: string
}

export interface Action{
    signature: string,
    args: ActionArgument[],
    description: string,
    creator?: string,
    check: (gameData: GameData) => boolean,
    run: (arg1: GameData, arg2: (arg1: string)=> void, arg3: string[]) => void,
    chatMessage: (arg1: string[]) => string,
    chatMessageClass: string
}

export interface ActionResponse{
    actionName: string,
    chatMessage: string,
    chatMessageClass: string
}

