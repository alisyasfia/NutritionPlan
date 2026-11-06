const API_KEY = 'cwbthDb78KqmkMkgQTGrhtPLH7hhDbDTNddgBdLk';

document.addEventListener('DOMContentLoaded', () => {

  const searchButton = document.getElementById('searchBtn');
  const recordsLink = document.getElementById('recordsLink');

  // Check if there is a new record
  if (localStorage.getItem('hasNewRecord') === 'true') {
    recordsLink.classList.add('has-new');
  }

  let allFoods = [];

  // Get nutrient values from USDA API
  function getNutrient(food, number) {
    for (let i = 0; i < food.foodNutrients.length; i++) {
      if (food.foodNutrients[i].nutrientNumber == number) {
        return food.foodNutrients[i].value;
      }
    }

    return 0;
  }

  // Check whether food is suitable for selected diet
  function isSuitable(food, diet) {
    let suitable = false;
    let suggest = '';

    if (diet == 'low-carb') {
      if (food.carbs <= 10) {
        suitable = true;
        suggest = 'Good choice for low-carb diet.';
      } else {
        suggest = 'High carbs.';
      }

    } else if (diet == 'high-protein') {
      if (food.protein >= 10) {
        suitable = true;
        suggest = 'Good choice for high-protein diet.';
      } else {
        suggest = 'Low in protein.';
      }

    } else if (diet == 'low-fat') {
      if (food.fat <= 3) {
        suitable = true;
        suggest = 'Good choice for low-fat.';
      }else{
        suggest = 'High in fat.';
      }

    } else if (diet == 'low-calorie') {
      if (food.kcal <= 100) {
        suitable = true;
        suggest = 'Good for low-calorie.';
      }else{
        suggest = 'High calorie.';
      }

    } else { //balanced diet
      if (food.kcal >= 50 && food.kcal <= 250 && food.protein >= 3) {
        suitable = true;
        suggest = 'Well balanced choice.';
      }else{
        suggest = 'Not suitable for balanced diet';
      }
    }

    return {suitable: suitable, suggest: suggest };
  }

  // Search Aoods from USDA API
  function searchFoods() {
    const query = document.getElementById('query').value.trim();
    const status = document.getElementById('status');

    // Input validation
    if (query === '') {
      status.textContent = 'Please type a food name';
      return;
    }

    status.textContent = 'Searching...';

    //retrieve data from API (USDA)
    const url =
      'https://api.nal.usda.gov/fdc/v1/foods/search?query=' +
      encodeURIComponent(query) +
      '&dataType=Foundation,SR%20Legacy&pageSize=20&api_key=' +
      API_KEY; //usig API key because use url only have a track limit

    fetch(url) //send HTTP request to USDA
      .then(response => {
        if (!response.ok) {
          throw new Error('API request failed: ' + response.status);
        }

        return response.json(); //deserialize JSON string to objects
      })
      .then(data => {

        console.log('API Data:', data);

        allFoods = [];

        if (data.foods && data.foods.length > 0) {

          console.table(data.foods[0].foodNutrients);

          for (let i = 0; i < data.foods.length; i++) {
            const f = data.foods[i];

            const food = {
              name: f.description,
              kcal: getNutrient(f, 208),
              protein: getNutrient(f, 203),
              fat: getNutrient(f, 204),
              carbs: getNutrient(f, 205),
              fiber: getNutrient(f, 291)
            };

            allFoods.push(food);
          }
        }

        showFoods();
      })
      .catch(error => {
        status.textContent = 'Error: ' + error.message;
        console.error(error);
      });
  }

  // Display food results
  function showFoods() {

    const diet = document.getElementById('diet').value;
    const tbody = document.getElementById('resultsBody');
    const suitableOnly = document.getElementById('suitableOnly').checked;
    const status = document.getElementById('status');

    tbody.innerHTML = '';

    let suitableCount = 0;

    for (let i = 0; i < allFoods.length; i++) {

      const food = allFoods[i];
      const result = isSuitable(food, diet);
      const suitable = result.suitable;
      const suggest = result.suggest;

      // Count suitable foods
      if (suitable == true) {
        suitableCount++;
      }

      // Skip unsuitable foods only when checkbox is checked
      if (suitableOnly == true && suitable == false) {
        continue;
      }

      let label = '<span class="badge no">Not suitable</span>';

      if (suitable == true) {
        label = '<span class="badge ok">Suitable</span>';
      }

      tbody.innerHTML = tbody.innerHTML +
        '<tr>' +
          '<td>' + food.name + '</td>' +
          '<td>' + food.kcal.toFixed(0) + '</td>' +
          '<td>' + food.protein.toFixed(1) + '</td>' +
          '<td>' + food.carbs.toFixed(1) + '</td>' +
          '<td>' + food.fat.toFixed(1) + '</td>' +
          '<td>' + food.fiber.toFixed(1) + '</td>' +
          '<td>' + label + '<p>' + suggest + '</p></td>' +
          '<td>' +
            '<input type="number" id="grams' + i +
            '" value="100" min="1" style="width:70px"> g ' +
            '<button onclick="askToAdd(' + i + ')">Add</button>' + //E.D.I x4 -add
          '</td>' +
        '</tr>';
    }

    // Display suggestion message
    if (allFoods.length == 0) {
      status.textContent = 'No food result found.';

    } else if (suitableCount == 0) {
      status.textContent =
        'No suitable food found for the selected diet.';

    } else {
      status.textContent =
        allFoods.length + ' results and ' +
        suitableCount + ' suitable foods.';
    }
  }

  // Add food into Local Storage
  function addToRecords(i) {

    const food = allFoods[i];
    const grams = Number(document.getElementById('grams' + i).value);
    const status = document.getElementById('status');

    // Validate grams
    if (!Number.isFinite(grams) || grams <= 0) {
      status.textContent = 'Please enter grams more than 0';
      return;
    }

    const diet = document.getElementById('diet').value;
    const result = isSuitable(food, diet);
    const suitable = result.suitable;

    let suggestion = 'Not suitable';

    if (suitable == true) {
      suggestion = 'Suitable';
    }

    let logs = [];

    const save = localStorage.getItem('foodLogs');

    if (save != null) {
      logs = JSON.parse(save);
    }

    logs.push({
      name: food.name,
      grams: grams,
      kcal100: food.kcal,
      protein100: food.protein,
      carbs100: food.carbs,
      fat100: food.fat,
      fiber100: food.fiber,
      diet: diet,
      suggestion: suggestion
    });

    // Save records
    localStorage.setItem('foodLogs', JSON.stringify(logs));

    // Mark that a new record has been added
    localStorage.setItem('hasNewRecord', 'true');

    // Make Food Intake Records bold immediately
    recordsLink.classList.add('has-new');

    status.textContent = 'Added ' + grams + ' g of ' + food.name + ' to your records.';

    alert('Added to record successfully');
  }

  window.addToRecords = addToRecords;

  // Confirmation popup
  let pendingIndex = null;

  const confirmBg = document.getElementById('confirmBg');
  const confirmText = document.getElementById('confirmText');

  function askToAdd(i) {

    const food = allFoods[i];
    const grams = document.getElementById('grams' + i).value;

    confirmText.textContent =
      'Do you want to add ' + grams + ' g of ' +
      food.name + ' to your records?';

    pendingIndex = i;

    confirmBg.style.display = 'flex';
  }

  window.askToAdd = askToAdd;

  // Yes button
  document.getElementById('yesBtn').addEventListener('click', () => { //E.D.I x5 -click yes,add

    if (pendingIndex != null) {
      addToRecords(pendingIndex);
    }

    confirmBg.style.display = 'none';
    pendingIndex = null;
  });

  // Cancel button
  document.getElementById('noBtn').addEventListener('click', () => {
    confirmBg.style.display = 'none';
    pendingIndex = null;
  });

  document.getElementById('suitableOnly')
    .addEventListener('change', showFoods); //E.D.I x2 -tick suitable only

  document.getElementById('diet')
    .addEventListener('change', showFoods); //E.D.I x3 -ubah diet dropdown

  searchButton.addEventListener('click', searchFoods);

});
