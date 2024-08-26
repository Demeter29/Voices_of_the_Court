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

if (require('electron-squirrel-startup')) {
    app.quit();
}

process.on("rejectionHandled", function(err){
    console.log('=== REJECTION HANDLED ===');
    console.error( err )
});

process.on('uncaughtException', function(err) {
    console.log('=== UNCAUGHT EXCEPTION ===');
    console.log(err);
  });

process.on('unhandledRejection', (error, p) => {
    console.log('=== UNHANDLED REJECTION ===');
    console.log(error);
});

//logging
var util = require('util');

var log_file = fs.createWriteStream('debug.log', {flags : 'w'});

console.log = function(d) { //
    
    process.stdout.write(util.format(d) + '\n');

    let time = new Date();
    var currentDate = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] `;
    log_file.write(currentDate + util.format(util.inspect(d, {depth: Infinity})) + '\n');
};



if(process.argv[2] == '--dev'){
    console.log("dev mode")
    require('source-map-support').install();
}else{
    console.log("product mode")
}





let launcherWindow: ConfigWindow;
let chatWindow: ChatWindow;

let clipboardListener = new ClipboardListener();
let config: Config;

app.on('ready',  async () => {
    console.log("App ready!");

    

    if (!fs.existsSync(`./configs/config.json`)){
        let conf = await JSON.parse(fs.readFileSync('./configs/default_config.json').toString());
        await fs.writeFileSync('./configs/config.json', JSON.stringify(conf, null, '\t'))
    }
    

    launcherWindow = new ConfigWindow();
    chatWindow = new ChatWindow();

    launcherWindow.window.on('closed', () =>{app.quit()});
    chatWindow.window.on('closed', () =>{app.quit()});

    clipboardListener.start();
    config = new Config();


    launcherWindow.window.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    }) 
   
});

let conversation: Conversation;

clipboardListener.on('GK:IN', async () =>{
    chatWindow.show();
    chatWindow.window.webContents.send('chat-show');
    try{ 
        console.log("New conversation started!");
        conversation = new Conversation(await parseLog(config.userFolderPath+'\\logs\\debug.log'), config);
        chatWindow.window.webContents.send('chat-start', conversation.gameData);
        
    }catch(err){
        console.log("==GK:IN ERROR==");
        console.log(err);

        if(chatWindow.isShown){
            chatWindow.window.webContents.send('error-message', err);
        }
    }
})

clipboardListener.on('GK:EFFECT_ACCEPTED', async () =>{
    if(conversation){
        conversation.runFileManager.clear();
    }
    
})

//IPC 

ipcMain.on('message-send', async (e, message: Message) =>{
    conversation.pushMessage(message);
    try{
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
    }
    catch(err){
        console.log(err);
        chatWindow.window.webContents.send('error-message', err);
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
    chatWindow.hide();

    if(conversation && conversation.isOpen){
        conversation.summarize();
    }
    
})


ipcMain.on("select-user-folder", (event) => {
    dialog.showOpenDialog(launcherWindow.window, { properties: ['openDirectory']}).then( (resp) =>{
        event.reply("select-user-folder-success", resp.filePaths[0]);
    });
});

ipcMain.on("open-folder", (event, path) => {
    dialog.showSaveDialog(launcherWindow.window, { defaultPath: path, properties: []});
});


