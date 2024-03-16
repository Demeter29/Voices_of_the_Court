import { app, BrowserWindow, clipboard, ipcMain, dialog, ipcRenderer } from "electron";
import {ConfigWindow} from './windows/ConfigWindow.js';
import {ChatWindow} from './windows/ChatWindow.js';
import { Config } from '../shared/Config.js';
import { ClipboardListener } from "./ClipboardListener.js";
import { Conversation } from "./conversation/Conversation.js";
import { GameData, parseLog } from "../shared/GameData.js";
import { Message, ResponseObject, ErrorMessage, MessageChunk } from "./ts/conversation_interfaces.js";
const shell = require('electron').shell;



app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


if (require('electron-squirrel-startup')) {
    app.quit();
}

let launcherWindow: ConfigWindow;
let chatWindow: ChatWindow;

let clipboardListener = new ClipboardListener();
let config: Config;

app.on('ready',  () => {
    console.log("App ready!");
    launcherWindow = new ConfigWindow();
    chatWindow = new ChatWindow();

    clipboardListener.start();
    config = new Config();

    launcherWindow.window.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    }) 
   
});

let conversation: Conversation

clipboardListener.on('GK:IN', async (clipboard) =>{
    conversation = new Conversation(await parseLog('C:\\Users\\gabor\\Documents\\Paradox Interactive\\Crusader Kings III\\logs\\debug.log'), config);
    chatWindow.show();
    chatWindow.window.webContents.send('chat-start');
    console.log("New conversation started!")
})

//IPC 

ipcMain.on('message-send', async (e, messageText) =>{
    let msg: Message = {
        role: "user",
        name: conversation.gameData.playerName,
        content: messageText
    }
    conversation.pushMessage(msg);

    chatWindow.window.webContents.send('message-receive', msg);

    
    if(config.stream){
        streamMessage = {
            role: "assistant",
            name: conversation.gameData.aiName,
            content: ""
        }

        chatWindow.window.webContents.send('stream-start');

        let response: ResponseObject = await conversation.generateNewAIMessage(streamRelay);

        chatWindow.window.webContents.send('stream-end');
        console.log(response)
    }
    else{
        let response: ResponseObject = await conversation.generateNewAIMessage(streamRelay);

        
        chatWindow.window.webContents.send('message-receive', response.message);
        console.log(response)
    }
    
});

let streamMessage: Message
function streamRelay(msgChunk: MessageChunk): void{
    streamMessage.content += msgChunk.content;
    chatWindow.window.webContents.send('stream-message', streamMessage)
}

ipcMain.on('config-change', (e, newConfig) =>{
    config = newConfig
    if(chatWindow.isShown){
        conversation.updateConfig(config);
    }
    
})

ipcMain.on('chat-stop', () =>{
    conversation.summarize();
})


ipcMain.on("select-user-folder", (event) => {
    dialog.showOpenDialog(launcherWindow.window, { properties: ['openDirectory']}).then( (resp) =>{
        event.reply("select-user-folder-success", resp.filePaths[0]);
    });
});


