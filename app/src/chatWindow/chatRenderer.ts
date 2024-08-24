import { ipcMain, ipcRenderer } from 'electron';
import {Interaction, InteractionResponse, Message, MessageChunk, ResponseObject} from '../main/ts/conversation_interfaces.js';
import { marked } from 'marked';
import { GameData } from '../shared/GameData.js';
const DOMPurify = require('dompurify');

const sanitizeConfig = {
    ALLOWED_TAGS: ['em', 'strong'], 
    KEEP_CONTENT: true, 
  };

hideChat();


let chatMessages: HTMLDivElement = document.querySelector('.messages')!;
let chatInput: HTMLInputElement= document.querySelector('.chat-input')!;
let leaveButton: HTMLButtonElement = document.querySelector('.leave-button')!;
let loadingDots: any;

let playerName: string;
let aiName: string;


async function initChat(){
    
    chatMessages.innerHTML = '';
    chatInput.innerHTML = '';
    chatInput.disabled = false;    
}

async function displayMessage(message: Message): Promise<HTMLDivElement>{
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    switch (message.role){
        case 'user':
            messageDiv.classList.add('player-message');
            messageDiv.innerHTML = DOMPurify.sanitize(await marked.parseInline(`**${message.name}:** ${message.content}`), sanitizeConfig);
            break;
        case 'assistant':
            loadingDots.remove();
            messageDiv.classList.add('ai-message');
            messageDiv.innerHTML = DOMPurify.sanitize(await marked.parseInline(`**${message.name}:** ${message.content}`), sanitizeConfig);
            chatInput.disabled = false;
            break;
    };   
    chatMessages.append(messageDiv);
    if(message.role === "user"){
        showLoadingDots();
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageDiv;
}

function displayInteractions(interactions: InteractionResponse[]){
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    for(const interaction of interactions){
        
        const interactionSpan = document.createElement('span');
        interactionSpan.innerText = interaction.chatMessage+"\n";
        interactionSpan.classList.add(interaction.chatMessageClass);
        messageDiv.appendChild(interactionSpan);

        
    }
    
    chatMessages.append(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; 
}

function displayErrorMessage(error: string){
    loadingDots?.remove();
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');

    messageDiv.classList.add('error-message');
    messageDiv.innerText = `Error message: ${error}`;
    chatMessages.append(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}



chatInput.addEventListener('keydown', function(e) {    
    if(e.which == 13) { //on enter
        e.preventDefault(); //disallow newlines   
        if(chatInput.value != ''){
            const messageText = chatInput.value;
            chatInput.value = ''

            let message: Message = {
                role: "user",
                name: playerName,
                content: messageText
            }

            displayMessage(message);
            ipcRenderer.send('message-send', message);

        };
    };
});

async function replaceLastMessage(message: Message){
    chatMessages.lastElementChild!.innerHTML = DOMPurify.sanitize((await marked.parseInline(`**${message.name}:** ${message.content}*`)).replace(/\*/g, ''), sanitizeConfig);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showLoadingDots(){  //and disable chat
    loadingDots = document.createElement('div');
    loadingDots.classList.add('loading');
    chatMessages.append(loadingDots);
    chatInput.disabled = true;
}

function hideChat(){
    document.body.style.display = 'none';
}

leaveButton.addEventListener("click", ()=>{
    hideChat();
    ipcRenderer.send('chat-stop');
});

//IPC Events

ipcRenderer.on('chat-show', () =>{
    initChat();
    document.body.style.display = '';
})

ipcRenderer.on('chat-start', (e, gameData: GameData) =>{
    playerName = gameData.playerName;
    aiName = gameData.aiName;
    document.body.style.display = '';
    initChat();
})

ipcRenderer.on('message-receive', async (e, responseObject: ResponseObject)=>{
    console.log(responseObject)
    await displayMessage(responseObject.message);

    displayInteractions(responseObject.interactions);


})

ipcRenderer.on('stream-start', async (e, gameData)=>{
    let streamMessage = document.createElement('div');
    streamMessage.classList.add('message');
    streamMessage.classList.add('ai-message');
    chatMessages.append(streamMessage);
})

ipcRenderer.on('stream-message', (e, message: Message)=>{
    loadingDots.remove();
    replaceLastMessage(message);
    showLoadingDots();
    //@ts-ignore
})

ipcRenderer.on('stream-end', (e, response: ResponseObject)=>{
    chatInput.disabled = false;
    displayInteractions(response.interactions);
    loadingDots.remove();
})

ipcRenderer.on('error-message', (e, errorMessage: string) =>{
    displayErrorMessage(errorMessage);
})


