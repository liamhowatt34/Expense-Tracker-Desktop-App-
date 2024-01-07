// main.js
const { app, BrowserWindow } = require('electron');
const sqlite3 = require('sqlite3');
const path = require('path');


// database
const dbPath = path.join(app.getPath('userData'), 'expenseTracker.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the database');
    }
});


function createWindow() {
    const win = new BrowserWindow({
        width: 1600,
        height: 900
    });

    win.loadFile('source/index.html');
}


app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});