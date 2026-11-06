document.addEventListener('DOMContentLoaded', () => {

function getLogs() { //retrieve array logs from localstorage
  const data = localStorage.getItem('foodLogs'); 
  return data ? JSON.parse(data) : []; //array out if no data
}

function saveLogs(logs) {
    localStorage.setItem('foodLogs', JSON.stringify(logs)); //before storing(localstorage read only string)
}

function renderRecords() {
    const logs = getLogs();
    const tbody = document.getElementById('recordsBody'); //html element DOM MAN. x1
    const status = document.getElementById('recordStatus');

    tbody.innerHTML = '';

    // Read operation feedback
    if (logs.length == 0) {
        status.textContent = 'No food records found. Please add a food first.'; //DOM MAN. x2 -change text
    } else {
        status.textContent = logs.length + ' food record successfully load.';
    }

    logs.forEach((log, index) => {
        //calculation kcal100 -API, grams -user
        const totalKcal = (log.kcal100 * log.grams / 100).toFixed(0);
        const totalProtein = (log.protein100 * log.grams / 100).toFixed(2);
        const totalCarbs = (log.carbs100 * log.grams / 100).toFixed(2);
        const totalFat = (log.fat100 * log.grams / 100).toFixed(2);
        const totalFiber = (log.fiber100 * log.grams / 100).toFixed(2);

        const row = document.createElement('tr'); //DOM MAN. x3 -new HTML element
        row.innerHTML = //DOM MAN. x4 -modify html 
          '<td>' + log.name + ' (' + log.grams + 'g)</td>' +
          '<td>' + totalKcal + ' kcal, ' + totalProtein + 'g protein, ' +
                   totalCarbs + 'g carbs, ' + totalFat + 'g fat, ' +
                   totalFiber + 'g fiber</td>' +
          '<td>' + log.diet + ' (' + log.suggestion + ')</td>' +
          '<td><button onclick="editLog(' + index + ')">Edit</button></td>' +
          //E.D.I x1
          '<td><button onclick="deleteLog(' + index + ')">Delete</button></td>';

        tbody.appendChild(row); //DOM MAN x5 -new ELEMENT to html
    });
    window.renderRecords = renderRecords;
}

function deleteLog(index) {
    let confirmDelete = confirm('Are you sure you want to delete this food record?');

    if (confirmDelete == true) {
        let logs = getLogs();

        logs.splice(index, 1);

        saveLogs(logs);
        renderRecords();

        alert('Food record deleted successfully!');
    }
}
window.deleteLog = deleteLog; //onlick

function editLog(index) {
  let logs = getLogs();
  const log = logs[index];
  const row = document.getElementsByTagName('tr')[index + 1];

  row.innerHTML =
    '<td>' + log.name + '</td>' +   //food name
    '<td><input type="number" id="editGrams" value="' + log.grams + '"> g</td>' +
    '<td>-</td>' +
    '<td><button onclick="saveEdit(' + index + ')">Save</button></td>' +
    '<td><button onclick="renderRecords()">Cancel</button></td>';
}
window.editLog = editLog;

function saveEdit(index) {
  let logs = getLogs();
  const newGrams = Number(document.getElementById('editGrams').value);

  if (!Number.isFinite(newGrams) || newGrams <= 0) {
    alert('Please enter a valid grams value.');
    return;
  }

  logs[index].grams = newGrams;   //update grams
  saveLogs(logs);
  renderRecords();

  logs[index].grams = newGrams;

saveLogs(logs);
renderRecords(); //refresh

alert('Food record updated successfully.');
}
window.saveEdit = saveEdit;

renderRecords();
localStorage.setItem('hasNewRecord', 'false');
});