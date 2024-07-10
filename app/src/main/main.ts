import { app, BrowserWindow, clipboard, ipcMain, dialog, ipcRenderer } from "electron";
import {ConfigWindow} from './windows/ConfigWindow.js';
import {ChatWindow} from './windows/ChatWindow.js';
import { Config } from '../shared/Config.js';
import { ClipboardListener } from "./ClipboardListener.js";
import { Conversation } from "./conversation/Conversation.js";
import { GameData, parseLog } from "../shared/GameData.js";
import { Message, ResponseObject, ErrorMessage, MessageChunk } from "./ts/conversation_interfaces.js";

const fs = require('fs');
const shell = require('electron').shell;
require('source-map-support').install();



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

    if (!fs.existsSync(`./configs/configs.json`)){
      //TODO
    }
    

    launcherWindow = new ConfigWindow();
    chatWindow = new ChatWindow();

    clipboardListener.start();
    config = new Config();


    launcherWindow.window.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    }) 
   
});

let conversation: Conversation;

clipboardListener.on('GK:IN', async () =>{
    conversation = new Conversation(await parseLog('C:\\Users\\gabor\\Documents\\Paradox Interactive\\Crusader Kings III\\logs\\debug.log'), config);
    chatWindow.show();
    chatWindow.window.webContents.send('chat-start', conversation.gameData);
    console.log("New conversation started!")
})

clipboardListener.on('GK:EFFECT_ACCEPTED', async () =>{
    if(conversation){
        conversation.runFileManager.clear();
    }
    
})

//IPC 

ipcMain.on('message-send', async (e, message: Message) =>{
    conversation.pushMessage(message);
    
    if(config.stream){
        streamMessage = {
            role: "assistant",
            name: conversation.gameData.aiName,
            content: ""
        }

        chatWindow.window.webContents.send('stream-start');

        let response: ResponseObject = await conversation.generateNewAIMessage(streamRelay);

        chatWindow.window.webContents.send('stream-end', response);
    }
    else{
        let response: ResponseObject = await conversation.generateNewAIMessage(streamRelay);

        
        chatWindow.window.webContents.send('message-receive', response);
    }
    
});

let streamMessage: Message
function streamRelay(msgChunk: MessageChunk): void{
    streamMessage.content += msgChunk.content;
    chatWindow.window.webContents.send('stream-message', streamMessage)
}

ipcMain.on('config-change', (e, confID: string, newValue: any) =>{
    //@ts-ignore
    config[confID] = newValue;
    config.export();
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

ipcMain.on("open-folder", (event, path) => {
    dialog.showSaveDialog(launcherWindow.window, { defaultPath: path, properties: []});
});



