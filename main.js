// main.js
const { app, BrowserWindow } = require('electron');
const sqlite3 = require('sqlite3');
const path = require('path');


// database
function initializeDatabase() {
    const dbPath = path.join(app.getPath('userData'), 'expenseTracker.db');
    const db = new sqlite3.Database(dbPath, (err) => {
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
}

initializeDatabase();

// Handle messages from the renderer process
ipcMain.on('addExpense', (event, expense) => {
    // Destructure the 'expense' object sent from the renderer process
    const { description, amount } = expense;

    // Insert the expense into the 'expenses' table
    const sql = 'INSERT INTO expenses (description, amount) VALUES (?, ?)';
    db.run(sql, [description, amount], function (err) {
        if (err) {
            console.error('Error adding expense to the database:', err.message);
            // Send an error response back to the renderer process if needed
            event.reply('addExpenseResponse', { success: false, error: err.message });
        } else {
            console.log(`Expense added with ID: ${this.lastID}`);
            // Send a success response back to the renderer process if needed
            event.reply('addExpenseResponse', { success: true, expenseId: this.lastID });
        }
    });
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