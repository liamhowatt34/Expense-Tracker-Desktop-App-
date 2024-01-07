// script.js
const { ipcRenderer } = require('electron');

const expList = document.getElementById('exp-list');
const incList = document.getElementById('inc-list');
const expHideShowButton = document.getElementById('exp-hide-show');
const incHideShowButton = document.getElementById('inc-hide-show');
const expInputDesc = document.getElementById('exp-desc');
const expInputAmt = document.getElementById('exp-amt');
const expAddBtn = document.getElementById('exp-add');
const expRemoveBtn = document.getElementById('exp-rmv');
const incInputDesc = document.getElementById('inc-desc');
const incInputAmt = document.getElementById('inc-amt');
const incAddBtn = document.getElementById('inc-add');
const incRemoveBtn = document.getElementById('inc-rmv');
const total = document.getElementById('total');
let runningTotal = 0;


// expanding list
function toggleExpList() {
    expList.classList.toggle('expanded');
}


function toggleIncList() {
    incList.classList.toggle('expanded');
}


// input info
function isValidInput(inputDesc, inputAmt) {
    return inputDesc.value.trim() !== '' && !isNaN(inputAmt.value);
}


function displayErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.textContent = message;
    errorDiv.classList.add('error-message');

    // Append the error div to the body or any other container element
    document.body.appendChild(errorDiv);

    // Remove the error message after a certain time (e.g., 3 seconds)
    setTimeout(function () {
        document.body.removeChild(errorDiv);
    }, 3000);
}


// Append an item to the list and update the database
async function addExpense(list, inputDesc, inputAmt) {
    if (!isValidInput(inputDesc, inputAmt)) {
        displayErrorMessage('Error. Amount must be a number.');
        return;
    }

    // add our item to an html ul
    let liElement = document.createElement("li");
    liElement.textContent = `Item: ${inputDesc.value} - $${inputAmt.value}`;
    list.appendChild(liElement);

    // need to add a selected class for every item we append to the list
    // to use with the remove button
    liElement.addEventListener('click', function () {
        liElement.classList.toggle('selected');
    });

    // Update the database in the main process
    try {
        const response = await ipcRenderer.invoke('addExpense', {
            description: inputDesc.value,
            amount: Number(inputAmt.value)
        });

        // Handle the response from the main process
        if (response.success) {
            console.log('Expense added successfully');
        } else {
            console.error('Error adding expense:', response.error);
            displayErrorMessage('Error adding expense. Please try again.');
        }
    } catch (error) {
        console.error('Error invoking addExpense:', error);
        displayErrorMessage('Error adding expense. Please try again.');
    }

    inputDesc.value = '';
    inputAmt.value = '';
}


async function removeExpense(list, selectedItems) {
    // Extract the expense IDs and amounts from the selected items
    const expenses = Array.from(selectedItems).map(item => ({
        id: parseInt(item.getAttribute('id')),
        amount: parseFloat(item.textContent.split('$')[1].trim())
    }));

    // Update the database in the main process
    try {
        const response = await ipcRenderer.invoke('removeExpense', expenses);

        // Handle the response from the main process
        if (response.success) {
            // Database operation successful
            console.log('Expense removed successfully');
        } else {
            // Database operation failed
            console.error('Error removing expense:', response.error);
            displayErrorMessage('Error removing expense. Please try again.');
        }
    } catch (error) {
        // Handle IPC invoke error
        console.error('Error invoking removeExpense:', error);
        displayErrorMessage('Error removing expense. Please try again.');
    }

    // Remove the selected items from the list
    selectedItems.forEach(function (item) {
        list.removeChild(item);
    });
}


async function addIncome(description, amount) {
    try {
        const response = await ipcRenderer.invoke('addIncome', {
            description: description,
            amount: Number(amount)
        });

        // Handle the response from the main process
        if (response.success) {
            console.log('Income added successfully');
        } else {
            console.error('Error adding income:', response.error);
            displayErrorMessage('Error adding income. Please try again.');
        }
    } catch (error) {
        console.error('Error invoking addIncome:', error);
        displayErrorMessage('Error adding income. Please try again.');
    }
}


async function removeIncome(selectedItems) {
    // Extract the income IDs and amounts from the selected items
    const incomes = Array.from(selectedItems).map(item => ({
        id: parseInt(item.getAttribute('id')),
        amount: parseFloat(item.textContent.split('$')[1].trim())
    }));

    // Update the database in the main process
    try {
        const response = await ipcRenderer.invoke('removeIncome', incomes);

        // Handle the response from the main process
        if (response.success) {
            // Database operation successful
            console.log('Income removed successfully');
        } else {
            // Database operation failed
            console.error('Error removing income:', response.error);
            displayErrorMessage('Error removing income. Please try again.');
        }
    } catch (error) {
        // Handle IPC invoke error
        console.error('Error invoking removeIncome:', error);
        displayErrorMessage('Error removing income. Please try again.');
    }

    // Remove the selected items from the list
    selectedItems.forEach(function (item) {
        incList.removeChild(item);
    });
}


// event listeners
expHideShowButton.addEventListener('click', toggleExpList);
incHideShowButton.addEventListener('click', toggleIncList);

expAddBtn.addEventListener('click', function () {
    addExpense(expList, expInputDesc, expInputAmt);
});

expRemoveBtn.addEventListener('click', function () {
    removeExpense(expList, expList.querySelectorAll('.selected'));
});

incAddBtn.addEventListener('click', function () {
    addIncome(incList, incInputDesc, incInputAmt);
});


incRemoveBtn.addEventListener('click', function () {
    removeIncome(incList, incList.querySelectorAll('.selected'));
});