const favContainer = document.getElementById("fav-meals");
const mealsEl = document.getElementById("meals");
const searchBtn = document.getElementById("search");
const searchTerm = document.getElementById("search-term");
const mealPopup = document.getElementById("popup");
const popupCloseBtn = document.getElementById("close-popup");
const mealInfoEl = document.getElementById("meal-info");
const reloadBtn = document.getElementById("reload");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
  const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");

  const resData = await res.json();
  const randomMeal = resData.meals[0];

  addMeal(randomMeal, true);
}

async function getMealById(id) {
  const res = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  );

  const resData = await res.json();
  const meal = resData.meals[0];

  return meal;
}

async function getMealsBySearch(term) {
  const res = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
  );

  const resData = await res.json();
  const meals = resData.meals;
  return meals;
}

function addMeal(mealData, random = false) {
  const meal = document.createElement("div");
  meal.classList.add("meal");
  meal.innerHTML = `
    <div class="meal">
    <div class="meal-header">
      ${random ? `<span class="random"> Random Recipe </span>` : ""}
      <img
        src="${mealData.strMealThumb}"
        alt="${mealData.strMeal}"
      />
    </div>
    <div class="meal-body">
      <h4>${mealData.strMeal}</h4>
      <button class="fav-btn">
        <i class="fas fa-heart"></i>
      </button>
    </div>
  </div>
  `;
  meal.classList.add("fade-in");
  const btn = meal.querySelector(".meal-body .fav-btn");
  btn.addEventListener("click", (e) => {
    if (btn.classList.contains("active")) {
      removeMealFromLS(mealData.idMeal);
      btn.classList.remove("active");
    } else {
      addMealToLS(mealData.idMeal);
      btn.classList.add("active");
    }

    //clean container
    fetchFavMeals();
  });

  meal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  console.log(mealData);

  mealsEl.appendChild(meal);
}

function addMealToLS(mealId) {
  const mealIds = getMealsFromLS();

  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealFromLS(mealId) {
  const mealIds = getMealsFromLS();

  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

function getMealsFromLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
  favContainer.innerHTML = "";

  const mealIds = getMealsFromLS();

  const meals = [];
  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];

    let meal = await getMealById(mealId);
    addMealToFav(meal);
  }
}

function addMealToFav(mealData) {
  //clean contain

  const favMeal = document.createElement("li");
  favMeal.innerHTML = `
  <img
    src="${mealData.strMealThumb}"
    alt="${mealData.strMeal}"
  /><span>${mealData.strMeal}</span>
  <button class="clear"><i class="fa-regular fa-rectangle-xmark"></i></button>
  `;

  const btn = favMeal.querySelector(".clear");

  btn.classList.add("clear-btn");
  btn.addEventListener("click", () => {
    removeMealFromLS(mealData.idMeal);

    fetchFavMeals();
  });

  favMeal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  favContainer.appendChild(favMeal);
}

function showMealInfo(mealData) {
  mealInfoEl.innerHTML = "";
  const mealEl = document.createElement("div");

  const mealIngEl = document.createElement("ul");

  const ingredientArr = [];

  const measurementArr = [];

  for (let key in mealData) {
    for (let i = 0; i < Object.keys(mealData).length; i++) {
      if (key === `strIngredient${i}` && mealData[key]) {
        ingredientArr.push(mealData[key]);
      } else if (key === `strMeasure${i}` && mealData[key]) {
        measurementArr.push(mealData[key]);
      }
    }
  }

  ingredientArr.forEach((ing) => {
    const listEl = document.createElement("li");
    listEl.innerHTML = `${ing} - ${measurementArr[ingredientArr.indexOf(ing)]}`;
    mealIngEl.appendChild(listEl);
  });

  mealEl.innerHTML = `<h1>${mealData.strMeal}</h1>
  <img
    src="${mealData.strMealThumb}"
    alt="${mealData.strMeal}"
  />
  <div>
    <p>
      ${mealData.strInstructions}
    </p>
    <
    
    
  </div>`;

  mealInfoEl.appendChild(mealEl);
  mealInfoEl.appendChild(mealIngEl);

  mealPopup.classList.remove("hidden");
}

searchBtn.addEventListener("click", async () => {
  mealsEl.innerHTML = "";
  const search = searchTerm.value;

  const meals = await getMealsBySearch(search);

  meals.forEach((meal) => {
    addMeal(meal);
  });
});

popupCloseBtn.addEventListener("click", () => {
  mealPopup.classList.add("hidden");
});

reloadBtn.addEventListener("click", () => {
  location.reload();
});
