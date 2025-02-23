import { app, BrowserWindow } from 'electron';
import * as path from 'path';
// Set development environment
process.env.NODE_ENV = 'development';
const isDev = true;
import CronService from './cron';

let mainWindow: BrowserWindow | null = null;
let cronService: CronService | null = null;

const DEV_PORT = 3000;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    const startUrl = isDev
        ? `http://localhost:3000`
        : `file://${path.join(__dirname, '../build/index.html')}`;

    mainWindow.loadURL(startUrl);

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Initialize cron service
    if (!cronService) {
        cronService = new CronService(DEV_PORT);
        cronService.start();
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (cronService) {
            cronService.stop();
            cronService = null;
        }
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});