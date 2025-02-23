"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
// Set development environment
process.env.NODE_ENV = 'development';
var isDev = true;
var cron_1 = require("./cron");
var mainWindow = null;
var cronService = null;
var DEV_PORT = 3000;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    var startUrl = isDev
        ? "http://localhost:3000"
        : "file://".concat(path.join(__dirname, '../build/index.html'));
    mainWindow.loadURL(startUrl);
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    // Initialize cron service
    if (!cronService) {
        cronService = new cron_1.default(DEV_PORT);
        cronService.start();
    }
}
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        if (cronService) {
            cronService.stop();
            cronService = null;
        }
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
