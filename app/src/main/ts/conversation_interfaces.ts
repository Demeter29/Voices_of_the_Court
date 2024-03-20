import { Conversation } from "../conversation/Conversation";

export interface Message {
    role: 'system' | 'user' | 'assistant';
    name?: string,
    content: string ;
}

export type ResponseObject = {
    message: Message,
    interactions: InteractionResponse[]
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

export interface Interaction{
    signature: string,
    description: string,
    group: string,
    run: (arg1: Conversation) => void,
    chatMessage: string,
    chatMessageClass: string
}

export interface InteractionResponse{
    rationale: string,
    action: string,
    interactionGroup: string,
    chatMessage: string,
    chatMessageClass: string
}