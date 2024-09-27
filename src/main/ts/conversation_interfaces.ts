import { RunFileManager } from "../RunFileManager";
import { GameData } from "../../shared/GameData";

export interface Message {
    role: 'system' | 'user' | 'assistant';
    name?: string,
    content: string ;
}

export type ResponseObject = {
    message: Message,
    actions: ActionResponse[]
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
    group: string,
    check: () => boolean,
    run: (arg1: GameData, arg2: RunFileManager, arg3: string[]) => void,
    chatMessage: (arg1: string[]) => string,
    chatMessageClass: string
}

export interface ActionResponse{
    actionName: string,
    chatMessage: string,
    chatMessageClass: string
}

