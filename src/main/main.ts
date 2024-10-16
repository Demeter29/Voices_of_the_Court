import { app, BrowserWindow, clipboard, ipcMain, dialog, ipcRenderer, autoUpdater, Tray, Menu, MessageBoxOptions } from "electron";
import {ConfigWindow} from './windows/ConfigWindow.js';
import {ChatWindow} from './windows/ChatWindow.js';
import { Config } from '../shared/Config.js';
import { ClipboardListener } from "./ClipboardListener.js";
import { Conversation } from "./conversation/Conversation.js";
import { GameData } from "../shared/gameData/GameData.js";
import { parseLog } from "../shared/gameData/parseLog.js";
import { Message, ErrorMessage, MessageChunk } from "./ts/conversation_interfaces.js";
import path from 'path';
import { existsSync } from "original-fs";
import fs from 'fs';
import { checkUserData } from "./userDataCheck.js";
const shell = require('electron').shell;
const packagejson = require('../../package.json');



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
    const feed = `${packagejson.updater.server}/${packagejson.updater.repo}/${process.platform}-${process.arch}/${app.getVersion()}`
    //@ts-ignore
    autoUpdater.setFeedURL(feed);
    
      autoUpdater.on('update-available', () => {
        const dialogOpts = {
          type: "info" as const,
          buttons: [],
          title: 'Update found!',
          message: "new version found!",
          detail: 'A new version is available. updating application now...'
        }
      
        dialog.showMessageBox(dialogOpts);
    })

    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {

        const dialogOpts = {
          type: 'info' as const,
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
          type: 'info' as const,
          buttons: [],
          title: 'App is up to date!',
          message: "App is up to date!",
          detail: 'no new version was found!'
        }  
        dialog.showMessageBox(dialogOpts);
    })

    autoUpdater.on('error', (error) => {
        const dialogOpts = {
          type: 'info' as const,
          buttons: [],
          title: 'Update error!',
          message: "Something went wrong during updating!",
          detail: 'error message: '+error
        }  
        dialog.showMessageBox(dialogOpts);
    })
}



if(app.isPackaged){
    console.log("product mode")
}else{
    console.log("dev mode")
    require('source-map-support').install();
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

    console.log(`app version: ${packagejson.version}`)

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

ipcMain.on('update-app', ()=>{
    autoUpdater.checkForUpdates();
});

ipcMain.on('clear-summaries', ()=>{
    const dialogOpts = {
        type: 'question' as const,
        buttons: ['Yes', 'No'],
        title: 'Clear summaries',
        message: "Are you sure you want to clear conversation summaries?",
      }
    
      dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0){
            const remPath = path.join(userDataPath, 'conversation_summaries');

            fs.readdir(remPath, (err, files) => {
                if (err) throw err;

                for(const file of files){
                    fs.rmSync(path.join(remPath, file), { recursive: true, force: true });
                }

                
            })
        }
      })
})

let conversation: Conversation;

clipboardListener.on('VOTC:IN', async () =>{
    chatWindow.show();
    chatWindow.window.webContents.send('chat-show');
    try{ 
        console.log("New conversation started!");
        conversation = new Conversation(await parseLog(config.userFolderPath+'\\logs\\debug.log'), config, chatWindow);
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
        conversation.generateNewAIMessage();
    }
    catch(err){
        console.log(err);
        chatWindow.window.webContents.send('error-message', err);
    }
    
    
    
});



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
    //@ts-ignore
    config[outerConfID][innerConfID] = newValue;
    config.export();
    if(chatWindow.isShown){
        conversation.updateConfig(config);
    }
})

//dear god...
ipcMain.on('config-change-nested-nested', (e, outerConfID: string, middleConfID: string, innerConfID: string, newValue: any) =>{
    //@ts-ignore
    config[outerConfID][middleConfID][innerConfID] = newValue;
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

