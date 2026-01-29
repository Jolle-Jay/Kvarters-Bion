import fs from 'fs';
import path from 'path';
import nodemon from 'nodemon';
import { createServer as cServer } from './server3.js';

export default function createServer(type = 'dev') {
  if (type === 'preview') {
    cServer('preview');
    return;
  }
  try {
    /// backendFolderPath - the backend folder in the project
    //  serverFolderPath - a temp folder with a copy of the scripts that start the backend
    let baseFolder = import.meta.dirname;
    baseFolder = baseFolder.slice(0, baseFolder.lastIndexOf('node_modules'));
    let backendFolderPath = path.join(baseFolder, 'backend');
    let rrFolder = import.meta.dirname;
    rrFolder = rrFolder.slice(0, rrFolder.lastIndexOf('temp'));
    let serverFolderPath = path.join(rrFolder, 'server');
    fs.rmSync(serverFolderPath, { recursive: true, force: true });
    fs.mkdirSync(serverFolderPath);
    let serverPath = path.join(rrFolder, 'server', 'server2.js');
    let serverPath2 = path.join(rrFolder, 'server', 'server3.js');
    fs.cpSync(path.join(import.meta.dirname, 'server2.js'), serverPath);
    fs.cpSync(path.join(import.meta.dirname, 'server3.js'), serverPath2);
    nodemon({
      ignoreRoot: [],
      script: serverPath,
      watch: [serverFolderPath, backendFolderPath],
      ext: 'js, json'
    });
  } catch (e) { console.log(e); }
}