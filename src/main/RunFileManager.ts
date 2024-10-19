import fs from 'fs';

export class RunFileManager{
    path: string;

    constructor(userFolderPath: string){
        this.path = userFolderPath+"\\run\\votc.txt";

        this.createRunFolder(userFolderPath);
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
    
    async createRunFolder(userFolderPath: string){

        if(userFolderPath && !fs.existsSync(userFolderPath+'\\run')){
            try{
                fs.mkdirSync(userFolderPath+"\\run");
            }
            catch(err){
                console.log("RunFileManager error: "+err)
            }
            
        }
    }
}
