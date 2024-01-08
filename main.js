// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const sqlite3 = require('sqlite3');
const path = require('path');
let db;

function createWindow() {
    const win = new BrowserWindow({
        width: 1600,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


// database
const dbPath = path.join(app.getPath('userData'), 'appDB.db');
db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the database');

        // Create tables if they do not exist
        db.run(`
            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                description TEXT,
                amount INTEGER
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS incomes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                description TEXT,
                amount INTEGER
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS app_data (
                id INTEGER PRIMARY KEY,
                total_amount INTEGER
            )
        `, (err) => {
            if (err) {
                console.error('Error creating app_data table:', err.message);
            } else {
                // Initialize total_amount if it doesn't exist
                db.get('SELECT total_amount FROM app_data WHERE id = 1', (err, row) => {
                    if (err) {
                        console.error('Error fetching total_amount:', err.message);
                    } else if (!row) {
                        // Insert initial value for total_amount
                        db.run('INSERT INTO app_data (id, total_amount) VALUES (1, 0)');
                    }
                });
            }
        });
    }
});


// Handle messages from the renderer process
ipcMain.handle('addExpense', async (event, expense) => {
    const { description, amount } = expense;

    try {
        const result = await new Promise((resolve, reject) => {
            const sql = 'INSERT INTO expenses (description, amount) VALUES (?, ?)';
            db.run(sql, [description, amount], function (err) {
                if (err) {
                    console.error('Error adding expense to the database:', err.message);
                    reject({ success: false, error: err.message });
                } else {
                    console.log(`Expense added with ID: ${this.lastID}`);
                    resolve({ success: true, expenseId: this.lastID });
                }
            });
        });

        return result;
    } catch (error) {
        console.error('Error handling addExpense:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('removeExpense', async (event, { expenseId }) => {
    try {
        const result = await new Promise((resolve, reject) => {
            const sql = 'DELETE FROM expenses WHERE id = ?';
            db.run(sql, [expenseId], function (err) {
                if (err) {
                    console.error('Error removing expense from the database:', err.message);
                    reject({ success: false, error: err.message });
                } else {
                    console.log(`Expense removed with ID: ${expenseId}`);
                    resolve({ success: true });
                }
            });
        });

        return result;
    } catch (error) {
        console.error('Error handling removeExpense:', error);
        return { success: false, error: error.message };
    }
});


ipcMain.handle('addIncome', async (event, income) => {
    const { description, amount } = income;

    try {
        const result = await new Promise((resolve, reject) => {
            const sql = 'INSERT INTO incomes (description, amount) VALUES (?, ?)';
            db.run(sql, [description, amount], function (err) {
                if (err) {
                    console.error('Error adding income to the database:', err.message);
                    reject({ success: false, error: err.message });
                } else {
                    console.log(`Income added with ID: ${this.lastID}`);
                    resolve({ success: true, incomeId: this.lastID });
                }
            });
        });

        return result;
    } catch (error) {
        console.error('Error handling addIcome:', error);
        return { success: false, error: error.message };
    }
});


ipcMain.handle('removeIncome', async (event, { incomeId }) => {
    try {
        const result = await new Promise((resolve, reject) => {
            const sql = 'DELETE FROM incomes WHERE id = ?';
            db.run(sql, [incomeId], function (err) {
                if (err) {
                    console.error('Error removing income from the database:', err.message);
                    reject({ success: false, error: err.message });
                } else {
                    console.log(`Income removed with ID: ${incomeId}`);
                    resolve({ success: true });
                }
            });
        });

        return result;
    } catch (error) {
        console.error('Error handling removeIncome:', error);
        return { success: false, error: error.message };
    }
});