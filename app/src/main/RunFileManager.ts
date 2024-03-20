import { Config } from "../shared/Config";
import { ipcMain, ipcRenderer } from 'electron';
import fs from 'fs';

export class RunFileManager{
    path: string;

    constructor(userFolderPath: string){
        this.path = userFolderPath+"\\run\\gpt_kings.txt";
    }

    write(text: string): void{
        fs.writeFileSync(this.path, text);
    
        console.log("wrote to run file: "+text)
    }

    append(text: string): void{
        fs.appendFileSync(this.path, text)
    }
    
    clear(): void{
        fs.writeFileSync(this.path, "");
        console.log("Run File cleared")
    }
    
    
}

