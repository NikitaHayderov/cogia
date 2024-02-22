import { app, BrowserWindow, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { Todo } from '../renderer/types';

const todosFilePath = path.join(app.getPath('userData'), 'todos.json');

function readTodos(): Todo[] {
    try {
        const todosRaw = fs.readFileSync(todosFilePath, { encoding: 'utf-8' });
        return JSON.parse(todosRaw);
    } catch (error) {
        console.error('Error reading:', error);
        return [];
    }
}

function writeTodos(todos: Todo[]): void {
    try {
        const todosRaw = JSON.stringify(todos, null, 2);
        fs.writeFileSync(todosFilePath, todosRaw, { encoding: 'utf-8' });
    } catch (error) {
        console.error('Error writing:', error);
    }
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile(path.join(__dirname, '../../public/index.html'));

    mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('get-todos', (event) => {
    event.sender.send('todos', readTodos());
});

ipcMain.on('save-todos', (event, todos: Todo[]) => {
    writeTodos(todos);
});