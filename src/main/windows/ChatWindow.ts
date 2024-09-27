import {  app, BrowserWindow, screen, ipcMain, Rectangle} from "electron";
import { OverlayController, OVERLAY_WINDOW_OPTS } from 'electron-overlay-window';
import {ClipboardListener} from '../ClipboardListener.js';
import { Conversation } from "../conversation/Conversation.js";
import {GameData} from "../../shared/GameData.js";
import fs from 'fs';
import { ConfigWindow } from "./ConfigWindow.js";
import ActiveWindow from '@paymoapp/active-window';

ActiveWindow.initialize();

export class ChatWindow{
    window: BrowserWindow;
    isShown: boolean;
    windowWatchId: number;

    constructor(){
        this.window = new BrowserWindow({
            ...OVERLAY_WINDOW_OPTS,
            resizable: false,
            webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
           

            }       
        })

        //this.window.setShape([{x:0, y:0, width: 650, height: 800}])
        
        this.windowWatchId = 0;

        this.window.loadFile('./public/chatWindow/chat.html')
        this.window.removeMenu();
    
        OverlayController.attachByTitle(
            this.window,
            'Crusader Kings III',
          )
          
          if(!app.isPackaged){
            this.window.webContents.openDevTools({ mode: 'detach', activate: false })
          }
          
    
        this.window.on('close', ()=>{app.quit()}); //TODO

        this.isShown = false;

        ipcMain.on('chat-stop', () =>{this.hide()})
        
        console.log("Chat window opened!")
    }

    show(){
        console.log("Chat window showed!");
        OverlayController.activateOverlay();
        this.isShown = true;

        this.windowWatchId = ActiveWindow.subscribe( (winInfo) =>{
            if(winInfo?.title == "Crusader Kings III" && this.isShown ){

                OverlayController.activateOverlay();
                this.window.webContents.send('chat-show');
                
            }else{
                this.window.webContents.send('chat-hide');
            }
        })

        
    }

    hide(){
        console.log("Chat window hidden!");
        OverlayController.focusTarget();
        this.isShown = false;

        ActiveWindow.unsubscribe(this.windowWatchId);
    }
}


