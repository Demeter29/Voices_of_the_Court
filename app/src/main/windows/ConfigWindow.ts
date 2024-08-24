import {  app, BrowserWindow, screen } from "electron";

export class ConfigWindow{
    window: BrowserWindow;

    constructor(){
        this.window = new BrowserWindow({
            width: 800,
            height: 600,
            minWidth: 800,
            minHeight: 600,
            webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            }       
        })

        //this.window.webContents.openDevTools();
        this.window.loadFile('./public/configWindow/connection.html')
        this.window.removeMenu();


        console.log("Config window opened!")
    }  
}