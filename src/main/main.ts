import { app, BrowserWindow, clipboard, ipcMain, dialog, ipcRenderer, autoUpdater, Tray, Menu } from "electron";
import {ConfigWindow} from './windows/ConfigWindow.js';
import {ChatWindow} from './windows/ChatWindow.js';
import { Config } from '../shared/Config.js';
import { ClipboardListener } from "./ClipboardListener.js";
import { Conversation } from "./conversation/Conversation.js";
import { GameData, parseLog } from "../shared/GameData.js";
import { Message, ResponseObject, ErrorMessage, MessageChunk } from "./ts/conversation_interfaces.js";
import path from 'path';
import { existsSync } from "original-fs";
import fs from 'fs';
import { checkUserData } from "./userDataCheck.js";
const shell = require('electron').shell;

const isFirstInstance = app.requestSingleInstanceLock();
if (!isFirstInstance) {
    app.quit();
    process.exit();
} 
else {
app.on('second-instance', (event, commandLine, workingDirectory) => {
    if(configWindow.window.isDestroyed()){
        configWindow = new ConfigWindow();
    }
    else if(configWindow.window.isMinimized()){
        configWindow.window.focus();
    }
})
}

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

//check config files
const userDataPath = path.join(app.getPath('userData'), 'votc_data');




//updating
if(app.isPackaged){
    const server = 'https://update.electronjs.org';
    const feed = `${server}/Demeter29/GPT_Kings/${process.platform}-${process.arch}/${app.getVersion()}`
    //@ts-ignore
    autoUpdater.setFeedURL(feed);
    
      autoUpdater.on('update-available', () => {
        const dialogOpts = {
          type: 'info',
          buttons: [],
          title: 'Update found!',
          message: "new version found!",
          detail:
            'A new version is available. updating application now...'
        }
      
        dialog.showMessageBox(dialogOpts);
    })

    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {

        const dialogOpts = {
          type: 'info',
          buttons: ['Restart', 'Later'],
          title: 'Application Update',
          message: process.platform === 'win32' ? releaseNotes : releaseName,
          detail:
            'A new version has been downloaded. Restart the application to apply the updates.'
        }
      
        dialog.showMessageBox(dialogOpts).then((returnValue) => {
          if (returnValue.response === 0) autoUpdater.quitAndInstall()
        })
    })

    

    autoUpdater.on('update-not-available', () => {
        const dialogOpts = {
          type: 'info',
          buttons: [],
          title: 'App is up to date!',
          message: "App is up to date!",
          detail: 'no new version was found!'
        }  
        dialog.showMessageBox(dialogOpts);
    })
}



if(process.argv[2] == '--dev'){
    console.log("dev mode")
    require('source-map-support').install();
}else{
    console.log("product mode")
}





let configWindow: ConfigWindow;
let chatWindow: ChatWindow;

let clipboardListener = new ClipboardListener();
let config: Config;


app.on('ready',  async () => {

   await checkUserData();

    //logging
    var util = require('util');

    var log_file = fs.createWriteStream(path.join(userDataPath, 'logs', 'debug.log'), {flags : 'w'});

    console.log = function(d) { //
        
        process.stdout.write(util.format(d) + '\n');

        let time = new Date();
        var currentDate = `[${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}] `;
        log_file.write(currentDate + util.format(util.inspect(d, {depth: Infinity})) + '\n');
    };

   let tray = new Tray(path.join(__dirname, '..', '..', 'build', 'icons', 'icon.ico'));
   const contextMenu = Menu.buildFromTemplate([
    { label: 'Open config window',
        click: () => { 
            if(configWindow.window.isDestroyed()){
                configWindow = new ConfigWindow();
            }
            else if(configWindow.window.isMinimized()){
                configWindow.window.focus();
            }
          }
    },
    { label: 'Check for updates..',
        click: () => { 
            if(app.isPackaged){
                autoUpdater.checkForUpdates();
            }
          }
    },
    { label: 'Exit', 
        click: () => { 
            app.quit();
      }},
    ])
    tray.setToolTip('Voices of the Court CK3 mod')
    tray.setContextMenu(contextMenu)

    tray.on('click', ()=>{
        if(configWindow.window.isDestroyed()){
            configWindow = new ConfigWindow();
        }
        else if(configWindow.window.isMinimized()){
            configWindow.window.focus();
        }
    })

    console.log("App ready!");


    configWindow = new ConfigWindow();
    chatWindow = new ChatWindow();

    
    chatWindow.window.on('closed', () =>{app.quit()});

    clipboardListener.start();


    if (!fs.existsSync(path.join(userDataPath, 'configs', 'config.json'))){
        let conf = await JSON.parse(fs.readFileSync(path.join(userDataPath, 'configs', 'default_config.json')).toString());
        await fs.writeFileSync(path.join(userDataPath, 'configs', 'config.json'), JSON.stringify(conf, null, '\t'))
    }
    
    config = new Config(path.join(userDataPath, 'configs', 'config.json'));


    configWindow.window.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    }) 
   
});

let conversation: Conversation;

clipboardListener.on('VOTC:IN', async () =>{
    chatWindow.show();
    chatWindow.window.webContents.send('chat-show');
    try{ 
        console.log("New conversation started!");
        conversation = new Conversation(await parseLog(config.userFolderPath+'\\logs\\debug.log'), config);
        chatWindow.window.webContents.send('chat-start', conversation.gameData);
        
    }catch(err){
        console.log("==VOTC:IN ERROR==");
        console.log(err);

        if(chatWindow.isShown){
            chatWindow.window.webContents.send('error-message', err);
        }
    }
})

clipboardListener.on('VOTC:EFFECT_ACCEPTED', async () =>{
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

ipcMain.handle('get-config', () => {return config});

ipcMain.handle('get-userdata-path', () => {return path.join(app.getPath("userData"), 'votc_data')});


ipcMain.on('config-change', (e, confID: string, newValue: any) =>{
    //@ts-ignore
    config[confID] = newValue;
    config.export();
    if(chatWindow.isShown){
        conversation.updateConfig(config);
    }
    
})

ipcMain.on('config-change-nested', (e, outerConfID: string, innerConfID: string, newValue: any) =>{
    
    console.log(newValue);

    //@ts-ignore
    config[outerConfID][innerConfID] = newValue;
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
    dialog.showOpenDialog(configWindow.window, { properties: ['openDirectory']}).then( (resp) =>{
        event.reply("select-user-folder-success", resp.filePaths[0]);
    });
});

ipcMain.on("open-folder", (event, path) => {
    dialog.showSaveDialog(configWindow.window, { defaultPath: path, properties: []});
});


