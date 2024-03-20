import {clipboard} from "electron";
import {EventEmitter} from 'events';

export class ClipboardListener extends EventEmitter{
    previousClipboard: string;
    isListening: boolean;
    interval: any;

    constructor(){
        super();
        let clipboardText = clipboard.readText();
        if(clipboardText.startsWith('GK:')){
            clipboard.writeText('');
            this.previousClipboard = '';
        }
        else{
            this.previousClipboard = clipboardText;
        }

        this.isListening = false;
    }

    start(){
        if(this.isListening){
            throw new Error('ClipboardListener is already listening!');
        }
        this.interval = setInterval(this.readClipboard.bind(this), 100);
        this.isListening = true;
    }

    stop(){
        if(!this.isListening){
            throw new Error('ClipboardListener is not currently listening!');
        }

        clearInterval(this.interval);
        this.isListening = false;
    }

    readClipboard(){
        let currentClipboard = clipboard.readText();
        if(this.previousClipboard == currentClipboard) return;

        if(currentClipboard.startsWith('GK:')){
            let command = currentClipboard.split(':')[1];
            switch (command){
                case "IN":
                    this.emit('GK:IN');
                break;
                case "EFFECT_ACCEPTED":
                    this.emit('GK:EFFECT_ACCEPTED');
            }
            
            
            clipboard.writeText(this.previousClipboard);
        }
        else{
            this.previousClipboard = clipboard.readText();
        }
    }
}

