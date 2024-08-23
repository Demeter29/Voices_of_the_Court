import {  app, BrowserWindow, screen, ipcMain } from "electron";
import { OverlayController, OVERLAY_WINDOW_OPTS } from 'electron-overlay-window';
import {ClipboardListener} from '../ClipboardListener.js';
import { Conversation } from "../conversation/Conversation.js";
import {GameData} from "../../shared/GameData.js";
import fs from 'fs';
import { ConfigWindow } from "./ConfigWindow.js";

export class ChatWindow{
    window: BrowserWindow;
    isShown: boolean;
    interval: any;

    constructor(){
        this.window = new BrowserWindow({
            ...OVERLAY_WINDOW_OPTS,
            resizable: false,
            webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            }       
        })
        

        this.window.loadFile('./public/chatWindow/chat.html')
        this.window.removeMenu();
    
        OverlayController.attachByTitle(
            this.window,
            'Crusader Kings III',
          )
          this.window.webContents.openDevTools({ mode: 'detach', activate: false })
    
        this.window.on('close', ()=>{app.quit()}); //TODO

        this.isShown = false;
        

    

        //this.clipboardListener.on('GK:IN', (clipboard) =>{this.show(clipboard)});

        ipcMain.on('chat-stop', () =>{this.hide()})
        
        console.log("Chat window opened!")
    }

    show(){
        OverlayController.activateOverlay();
        this.isShown = true;
        //window loses focus forever when alt-tabbed.
        this.interval = setInterval(()=>{OverlayController.activateOverlay()}, 500);

        console.log("Chat window showed!")
    }

    hide(){
        OverlayController.focusTarget();
        this.isShown = false;
        clearInterval(this.interval);
        console.log("Chat window hidden!")
    }
}


