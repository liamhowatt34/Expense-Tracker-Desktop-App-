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
let expenses = [];
let incomes = [];


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


function appendToList(list, inputDesc, inputAmt, array, operation) {
    if (!isValidInput(inputDesc, inputAmt)) {
        displayErrorMessage('Error. Amount must be a number.');
        return;
    }

    // add our item to an html ul
    let liElement = document.createElement("li");
    liElement.textContent = `Item: ${inputDesc.value} - $${inputAmt.value}`;
    list.appendChild(liElement);

    // keep track of our items, running total, and update the HTML h2
    array.push(Number(inputAmt.value));
    runningTotal += operation * Number(inputAmt.value);
    total.textContent = `Total: $${runningTotal}`;

    // need to add a selected class for every item we append to the list
    // to use with the remove button
    liElement.addEventListener('click', function () {
        liElement.classList.toggle('selected');
    });

    inputDesc.value = '';
    inputAmt.value = '';
}


function removeFromList(list, selectedItems, array, operation) {
    // going over our lists to remove them and updating out runningTotal
    for (let i = 0; i < selectedItems.length; i++) {
        let amount = parseFloat(selectedItems[i].textContent.split('$')[1].trim());
        if (array.includes(amount)) {
            let index = array.indexOf(amount);
            array.splice(index, 1);
            runningTotal -= operation * amount;
        }
    }

    total.textContent = `Total: $${runningTotal}`;

    // removing the selected class once removed from ul
    selectedItems.forEach(function (item) {
        list.removeChild(item);
    });
}


// event listeners
expHideShowButton.addEventListener('click', toggleExpList);
incHideShowButton.addEventListener('click', toggleIncList);

expAddBtn.addEventListener('click', function () {
    appendToList(expList, expInputDesc, expInputAmt, expenses, -1);
});

expRemoveBtn.addEventListener('click', function () {
    removeFromList(expList, expList.querySelectorAll('.selected'), expenses, -1);
});

incAddBtn.addEventListener('click', function () {
    appendToList(incList, incInputDesc, incInputAmt, incomes, 1);
});

incRemoveBtn.addEventListener('click', function () {
    removeFromList(incList, incList.querySelectorAll('.selected'), incomes, 1);
});