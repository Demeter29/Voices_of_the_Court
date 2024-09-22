import { ipcMain, ipcRenderer, dialog} from 'electron';
import { Config } from '../shared/Config';
import  {OpenAI}  from "openai";
import { ApiConnection } from '../shared/apiConnection';
import fs from 'fs';
import path from 'path';

let appVersionSpan: HTMLElement = document.querySelector("#app-version")!;

appVersionSpan.innerText = "Current app version: "+require('../../package.json').version;

