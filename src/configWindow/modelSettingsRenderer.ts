import { ipcMain, ipcRenderer } from 'electron';
import { Config } from '../shared/Config';
import fs from 'fs';
import path from 'path';

document.getElementById("container")!.style.display = "block";