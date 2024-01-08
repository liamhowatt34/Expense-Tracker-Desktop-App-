// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const sqlite3 = require('sqlite3');
const path = require('path');
let db;
console.log('Main process started');


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
    console.log('App is ready');
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
console.log("ready for messages")


// Handle messages from the renderer process
ipcMain.handle('addExpense', async (event, expense) => {
    const { description, amount } = expense;
    console.log('Received addExpense message:', expense);

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



ipcMain.on('addIncome', (event, income) => {
    // Destructure the 'income' object sent from the renderer process
    const { description, amount } = income;

    // Insert the income into the 'incomes' table
    const sql = 'INSERT INTO incomes (description, amount) VALUES (?, ?)';
    db.run(sql, [description, amount], function (err) {
        if (err) {
            console.error('Error adding income to the database:', err.message);
            // Send an error response back to the renderer process if needed
            event.reply('addIncomeResponse', { success: false, error: err.message });
        } else {
            console.log(`Income added with ID: ${this.lastID}`);
            // Send a success response back to the renderer process if needed
            event.reply('addIncomeResponse', { success: true, incomeId: this.lastID });
        }
    });
});


ipcMain.on('removeIncome', (event, { incomeId }) => {
    const sql = 'DELETE FROM incomes WHERE id = ?';
    db.run(sql, [incomeId], function (err) {
        if (err) {
            console.error('Error removing income from the database:', err.message);
            event.reply('removeIncomeResponse', { success: false, error: err.message });
        } else {
            console.log(`Income removed with ID: ${incomeId}`);
            event.reply('removeIncomeResponse', { success: true });
        }
    });
});