(() => {
  "use strict";

  const STORAGE_KEY = "dinnerPlanner.data.v1";
  const SETTINGS_KEY = "dinnerPlanner.settings.v1";

  const KNOWN_COOKING_METHODS = [
    "Oven",
    "Stovetop",
    "Grill",
    "Blackstone",
    "Slow Cooker",
    "Air Fryer",
    "Instant Pot",
    "Soup",
    "No Cook"
  ];

  const state = {
    data: loadData(),
    settings: loadSettings(),
    activeTab: "meals"
  };

  const els = {};
  let toastTimer = null;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    mapElements();
    hydrateSettingsForm();
    bindEvents();
    populateMealMethodFilter();
    renderMeals();
    renderRestaurants();
  }

  function mapElements() {
    els.tabButtons = Array.from(document.querySelectorAll(".tab-btn"));
    els.mealsSection = document.getElementById("meals-section");
    els.restaurantsSection = document.getElementById("restaurants-section");

    els.mealSearch = document.getElementById("meal-search");
    els.mealMethodFilter = document.getElementById("meal-method-filter");
    els.mealCuisineFilter = document.getElementById("meal-cuisine-filter");
    els.mealSort = document.getElementById("meal-sort");
    els.proteinChecks = Array.from(document.querySelectorAll(".protein-tag"));
    els.mealsList = document.getElementById("meals-list");

    els.restaurantSearch = document.getElementById("restaurant-search");
    els.restaurantTypeFilter = document.getElementById("restaurant-type-filter");
    els.restaurantPriceFilter = document.getElementById("restaurant-price-filter");
    els.restaurantCuisineFilter = document.getElementById("restaurant-cuisine-filter");
    els.restaurantSort = document.getElementById("restaurant-sort");
    els.restaurantsList = document.getElementById("restaurants-list");

    els.addMealBtn = document.getElementById("add-meal");
    els.addRestaurantBtn = document.getElementById("add-restaurant");

    els.mealModal = document.getElementById("meal-modal");
    els.restaurantModal = document.getElementById("restaurant-modal");
    els.settingsModal = document.getElementById("settings-modal");
    els.closeModalButtons = Array.from(document.querySelectorAll("[data-close-modal]"));

    els.mealModalTitle = document.getElementById("meal-modal-title");
    els.mealForm = document.getElementById("meal-form");
    els.mealId = document.getElementById("meal-id");
    els.mealName = document.getElementById("meal-name");
    els.mealCookingMethod = document.getElementById("meal-cooking-method");
    els.mealCuisine = document.getElementById("meal-cuisine");
    els.mealNotes = document.getElementById("meal-notes");

    els.restaurantModalTitle = document.getElementById("restaurant-modal-title");
    els.restaurantForm = document.getElementById("restaurant-form");
    els.restaurantId = document.getElementById("restaurant-id");
    els.restaurantName = document.getElementById("restaurant-name");
    els.restaurantType = document.getElementById("restaurant-type");
    els.restaurantCuisine = document.getElementById("restaurant-cuisine");
    els.restaurantPrice = document.getElementById("restaurant-price");
    els.restaurantLocation = document.getElementById("restaurant-location");
    els.restaurantRating = document.getElementById("restaurant-rating");
    els.restaurantNotes = document.getElementById("restaurant-notes");

    els.openSettingsBtn = document.getElementById("open-settings");
    els.settingsForm = document.getElementById("settings-form");
    els.sheetUrlInput = document.getElementById("sheet-url");
    els.pullSheetsBtn = document.getElementById("pull-sheets");
    els.pushSheetsBtn = document.getElementById("push-sheets");

    els.exportBtn = document.getElementById("export-data");
    els.importBtn = document.getElementById("import-data");
    els.importFileInput = document.getElementById("import-file");

    els.toast = document.getElementById("toast");
  }

  function bindEvents() {
    els.tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    els.mealSearch.addEventListener("input", renderMeals);
    els.mealMethodFilter.addEventListener("change", renderMeals);
    els.mealCuisineFilter.addEventListener("input", renderMeals);
    els.mealSort.addEventListener("change", renderMeals);
    els.proteinChecks.forEach((checkbox) => checkbox.addEventListener("change", renderMeals));

    els.restaurantSearch.addEventListener("input", renderRestaurants);
    els.restaurantTypeFilter.addEventListener("change", renderRestaurants);
    els.restaurantPriceFilter.addEventListener("change", renderRestaurants);
    els.restaurantCuisineFilter.addEventListener("input", renderRestaurants);
    els.restaurantSort.addEventListener("change", renderRestaurants);

    els.addMealBtn.addEventListener("click", () => openMealModal(null));
    els.addRestaurantBtn.addEventListener("click", () => openRestaurantModal(null));

    els.mealsList.addEventListener("click", handleMealListActions);
    els.restaurantsList.addEventListener("click", handleRestaurantListActions);

    els.mealForm.addEventListener("submit", handleMealSubmit);
    els.restaurantForm.addEventListener("submit", handleRestaurantSubmit);

    els.closeModalButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const modalId = btn.dataset.closeModal;
        const modal = document.getElementById(modalId);
        if (modal) {
          closeModal(modal);
        }
      });
    });

    [els.mealModal, els.restaurantModal, els.settingsModal].forEach((modal) => {
      modal.addEventListener("click", (event) => {
        if (event.target === modal) {
          closeModal(modal);
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal(els.mealModal);
        closeModal(els.restaurantModal);
        closeModal(els.settingsModal);
      }
    });

    els.openSettingsBtn.addEventListener("click", () => openModal(els.settingsModal));
    els.settingsForm.addEventListener("submit", handleSettingsSubmit);
    els.pullSheetsBtn.addEventListener("click", pullFromSheets);
    els.pushSheetsBtn.addEventListener("click", pushToSheets);

    els.exportBtn.addEventListener("click", exportData);
    els.importBtn.addEventListener("click", () => els.importFileInput.click());
    els.importFileInput.addEventListener("change", handleImportData);
  }

  function switchTab(tabName) {
    state.activeTab = tabName === "restaurants" ? "restaurants" : "meals";
    els.tabButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === state.activeTab));
    els.mealsSection.classList.toggle("active", state.activeTab === "meals");
    els.restaurantsSection.classList.toggle("active", state.activeTab === "restaurants");
  }

  function openModal(modal) {
    modal.classList.remove("hidden");
  }

  function closeModal(modal) {
    modal.classList.add("hidden");
  }

  function openMealModal(meal) {
    const isEdit = Boolean(meal);
    els.mealModalTitle.textContent = isEdit ? "Edit Meal" : "Add Meal";
    els.mealId.value = meal ? meal.id : "";
    els.mealName.value = meal ? meal.name : "";
    els.mealCookingMethod.value = meal ? meal.cookingMethod : "";
    els.mealCuisine.value = meal ? meal.cuisine : "";
    els.mealNotes.value = meal ? meal.notes : "";
    openModal(els.mealModal);
    els.mealName.focus();
  }

  function openRestaurantModal(restaurant) {
    const isEdit = Boolean(restaurant);
    els.restaurantModalTitle.textContent = isEdit ? "Edit Restaurant" : "Add Restaurant";
    els.restaurantId.value = restaurant ? restaurant.id : "";
    els.restaurantName.value = restaurant ? restaurant.name : "";
    els.restaurantType.value = restaurant ? restaurant.type : "Sit-down";
    els.restaurantCuisine.value = restaurant ? restaurant.cuisine : "";
    els.restaurantPrice.value = restaurant ? restaurant.priceRange : "";
    els.restaurantLocation.value = restaurant ? restaurant.location : "";
    els.restaurantRating.value = restaurant ? String(restaurant.rating) : "0";
    els.restaurantNotes.value = restaurant ? restaurant.notes : "";
    openModal(els.restaurantModal);
    els.restaurantName.focus();
  }

  function handleMealSubmit(event) {
    event.preventDefault();
    const formData = new FormData(els.mealForm);
    const id = toCleanString(formData.get("id"));
    const existingMeal = id ? state.data.meals.find((entry) => entry.id === id) : null;

    const meal = normalizeMeal({
      id: id || createId(),
      name: formData.get("name"),
      cookingMethod: formData.get("cookingMethod"),
      cuisine: formData.get("cuisine"),
      notes: formData.get("notes"),
      dateAdded: existingMeal ? existingMeal.dateAdded : new Date().toISOString()
    });

    if (!meal.name) {
      showToast("Meal name is required.", true);
      return;
    }

    const existingIndex = state.data.meals.findIndex((entry) => entry.id === meal.id);
    if (existingIndex >= 0) {
      state.data.meals[existingIndex] = meal;
    } else {
      state.data.meals.unshift(meal);
    }

    saveData();
    populateMealMethodFilter();
    renderMeals();
    closeModal(els.mealModal);
    showToast(existingIndex >= 0 ? "Meal updated." : "Meal added.");
  }

  function handleRestaurantSubmit(event) {
    event.preventDefault();
    const formData = new FormData(els.restaurantForm);
    const id = toCleanString(formData.get("id"));
    const existingRestaurant = id ? state.data.restaurants.find((entry) => entry.id === id) : null;

    const restaurant = normalizeRestaurant({
      id: id || createId(),
      name: formData.get("name"),
      type: formData.get("type"),
      cuisine: formData.get("cuisine"),
      priceRange: formData.get("priceRange"),
      location: formData.get("location"),
      rating: formData.get("rating"),
      notes: formData.get("notes"),
      dateAdded: existingRestaurant ? existingRestaurant.dateAdded : new Date().toISOString()
    });

    if (!restaurant.name) {
      showToast("Restaurant name is required.", true);
      return;
    }

    const existingIndex = state.data.restaurants.findIndex((entry) => entry.id === restaurant.id);
    if (existingIndex >= 0) {
      state.data.restaurants[existingIndex] = restaurant;
    } else {
      state.data.restaurants.unshift(restaurant);
    }

    saveData();
    renderRestaurants();
    closeModal(els.restaurantModal);
    showToast(existingIndex >= 0 ? "Restaurant updated." : "Restaurant added.");
  }

  function handleMealListActions(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const id = button.dataset.id;
    const action = button.dataset.action;
    const meal = state.data.meals.find((entry) => entry.id === id);
    if (!meal) {
      return;
    }

    if (action === "edit-meal") {
      openMealModal(meal);
      return;
    }

    if (action === "delete-meal") {
      const confirmed = window.confirm(`Delete "${meal.name}"?`);
      if (!confirmed) {
        return;
      }
      state.data.meals = state.data.meals.filter((entry) => entry.id !== id);
      saveData();
      populateMealMethodFilter();
      renderMeals();
      showToast("Meal deleted.");
    }
  }

  function handleRestaurantListActions(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const id = button.dataset.id;
    const action = button.dataset.action;
    const restaurant = state.data.restaurants.find((entry) => entry.id === id);
    if (!restaurant) {
      return;
    }

    if (action === "edit-restaurant") {
      openRestaurantModal(restaurant);
      return;
    }

    if (action === "delete-restaurant") {
      const confirmed = window.confirm(`Delete "${restaurant.name}"?`);
      if (!confirmed) {
        return;
      }
      state.data.restaurants = state.data.restaurants.filter((entry) => entry.id !== id);
      saveData();
      renderRestaurants();
      showToast("Restaurant deleted.");
    }
  }

  function populateMealMethodFilter() {
    const currentValue = els.mealMethodFilter.value || "all";
    const dynamicMethods = state.data.meals
      .map((meal) => meal.cookingMethod)
      .filter((method) => method);
    const methods = Array.from(new Set([...KNOWN_COOKING_METHODS, ...dynamicMethods])).sort((a, b) =>
      a.localeCompare(b)
    );

    const options = [`<option value="all">All cooking methods</option>`].concat(
      methods.map((method) => `<option value="${escapeHtml(method)}">${escapeHtml(method)}</option>`)
    );

    els.mealMethodFilter.innerHTML = options.join("");
    if ([...els.mealMethodFilter.options].some((option) => option.value === currentValue)) {
      els.mealMethodFilter.value = currentValue;
    } else {
      els.mealMethodFilter.value = "all";
    }
  }

  function renderMeals() {
    const meals = getFilteredMeals();
    if (!meals.length) {
      els.mealsList.innerHTML = `<div class="empty-state">No meals match your current filters.</div>`;
      return;
    }

    els.mealsList.innerHTML = meals
      .map((meal) => {
        const badges = [meal.cookingMethod, meal.cuisine]
          .filter(Boolean)
          .map((item) => `<span class="badge">${escapeHtml(item)}</span>`)
          .join("");

        const notesHtml = meal.notes ? `<p class="card-notes">${escapeHtml(meal.notes)}</p>` : "";
        const date = escapeHtml(formatDate(meal.dateAdded));

        return `
          <article class="card">
            <div class="card-header">
              <h3>${escapeHtml(meal.name)}</h3>
              <div class="card-actions">
                <button class="card-btn" type="button" data-action="edit-meal" data-id="${escapeHtml(meal.id)}">Edit</button>
                <button class="card-btn card-btn-danger" type="button" data-action="delete-meal" data-id="${escapeHtml(meal.id)}">Delete</button>
              </div>
            </div>
            ${badges ? `<div class="badges">${badges}</div>` : ""}
            ${notesHtml}
            <p class="card-meta">Added ${date}</p>
          </article>
        `;
      })
      .join("");
  }

  function renderRestaurants() {
    const restaurants = getFilteredRestaurants();
    if (!restaurants.length) {
      els.restaurantsList.innerHTML = `<div class="empty-state">No restaurants match your current filters.</div>`;
      return;
    }

    els.restaurantsList.innerHTML = restaurants
      .map((restaurant) => {
        const badges = [restaurant.type, restaurant.cuisine, restaurant.priceRange]
          .filter(Boolean)
          .map((item) => `<span class="badge">${escapeHtml(item)}</span>`)
          .join("");

        const locationHtml = restaurant.location
          ? `<p class="card-notes"><strong>Location:</strong> ${escapeHtml(restaurant.location)}</p>`
          : "";
        const notesHtml = restaurant.notes ? `<p class="card-notes">${escapeHtml(restaurant.notes)}</p>` : "";
        const stars = restaurant.rating ? `<div class="stars">${renderStars(restaurant.rating)}</div>` : "";
        const date = escapeHtml(formatDate(restaurant.dateAdded));

        return `
          <article class="card">
            <div class="card-header">
              <h3>${escapeHtml(restaurant.name)}</h3>
              <div class="card-actions">
                <button class="card-btn" type="button" data-action="edit-restaurant" data-id="${escapeHtml(restaurant.id)}">Edit</button>
                <button class="card-btn card-btn-danger" type="button" data-action="delete-restaurant" data-id="${escapeHtml(restaurant.id)}">Delete</button>
              </div>
            </div>
            ${badges ? `<div class="badges">${badges}</div>` : ""}
            ${stars}
            ${locationHtml}
            ${notesHtml}
            <p class="card-meta">Added ${date}</p>
          </article>
        `;
      })
      .join("");
  }

  function getFilteredMeals() {
    const searchTerm = normalizeText(els.mealSearch.value);
    const methodFilter = els.mealMethodFilter.value;
    const cuisineFilter = normalizeText(els.mealCuisineFilter.value);
    const excludedTags = els.proteinChecks
      .filter((checkbox) => !checkbox.checked)
      .map((checkbox) => normalizeText(checkbox.value));
    const sortBy = els.mealSort.value || "newest";

    const filtered = state.data.meals.filter((meal) => {
      const haystack = normalizeText([meal.name, meal.cookingMethod, meal.cuisine, meal.notes].join(" "));

      if (searchTerm && !haystack.includes(searchTerm)) {
        return false;
      }
      if (methodFilter !== "all" && meal.cookingMethod !== methodFilter) {
        return false;
      }
      if (cuisineFilter && !normalizeText(meal.cuisine).includes(cuisineFilter)) {
        return false;
      }

      const blockedByUncheckedTag = excludedTags.some((tag) => tag && haystack.includes(tag));
      return !blockedByUncheckedTag;
    });

    return filtered.sort((a, b) => compareItems(a, b, sortBy, "cookingMethod"));
  }

  function getFilteredRestaurants() {
    const searchTerm = normalizeText(els.restaurantSearch.value);
    const typeFilter = els.restaurantTypeFilter.value;
    const priceFilter = els.restaurantPriceFilter.value;
    const cuisineFilter = normalizeText(els.restaurantCuisineFilter.value);
    const sortBy = els.restaurantSort.value || "newest";

    const filtered = state.data.restaurants.filter((restaurant) => {
      const haystack = normalizeText(
        [restaurant.name, restaurant.type, restaurant.cuisine, restaurant.priceRange, restaurant.location, restaurant.notes].join(
          " "
        )
      );

      if (searchTerm && !haystack.includes(searchTerm)) {
        return false;
      }
      if (typeFilter !== "all" && restaurant.type !== typeFilter) {
        return false;
      }
      if (priceFilter !== "all" && restaurant.priceRange !== priceFilter) {
        return false;
      }
      if (cuisineFilter && !normalizeText(restaurant.cuisine).includes(cuisineFilter)) {
        return false;
      }
      return true;
    });

    if (sortBy === "rating") {
      return filtered.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }
    if (sortBy === "type") {
      return filtered.sort((a, b) => a.type.localeCompare(b.type));
    }
    return filtered.sort((a, b) => compareItems(a, b, sortBy, "type"));
  }

  function compareItems(a, b, sortBy, fallbackField) {
    if (sortBy === "newest") {
      return toTimestamp(b.dateAdded) - toTimestamp(a.dateAdded);
    }
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "method") {
      return (a.cookingMethod || "").localeCompare(b.cookingMethod || "");
    }
    if (sortBy === "cuisine") {
      return (a.cuisine || "").localeCompare(b.cuisine || "");
    }
    return (a[fallbackField] || "").localeCompare(b[fallbackField] || "");
  }

  function handleSettingsSubmit(event) {
    event.preventDefault();
    state.settings.sheetUrl = toCleanString(els.sheetUrlInput.value);
    saveSettings();
    showToast("Settings saved.");
    closeModal(els.settingsModal);
  }

  async function pushToSheets() {
    const url = toCleanString(els.sheetUrlInput.value || state.settings.sheetUrl);
    if (!url) {
      showToast("Add your Apps Script URL in Settings first.", true);
      return;
    }

    state.settings.sheetUrl = url;
    saveSettings();
    setSyncButtonsBusy(true);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          meals: state.data.meals,
          restaurants: state.data.restaurants,
          updatedAt: new Date().toISOString()
        })
      });

      const raw = await response.text();
      let body = {};
      try {
        body = JSON.parse(raw);
      } catch (error) {
        body = {};
      }

      if (!response.ok || body.ok === false) {
        throw new Error(body.error || `Request failed with status ${response.status}`);
      }

      showToast("Pushed data to Google Sheets.");
    } catch (error) {
      showToast(`Push failed: ${error.message}`, true);
    } finally {
      setSyncButtonsBusy(false);
    }
  }

  async function pullFromSheets() {
    const url = toCleanString(els.sheetUrlInput.value || state.settings.sheetUrl);
    if (!url) {
      showToast("Add your Apps Script URL in Settings first.", true);
      return;
    }

    state.settings.sheetUrl = url;
    saveSettings();
    setSyncButtonsBusy(true);

    try {
      const response = await fetch(`${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`);
      const body = await response.json();

      if (!response.ok || body.ok === false) {
        throw new Error(body.error || `Request failed with status ${response.status}`);
      }

      if (!Array.isArray(body.meals) || !Array.isArray(body.restaurants)) {
        throw new Error("Response did not contain meals and restaurants arrays.");
      }

      const confirmed = window.confirm(
        "Pulling from Sheets will replace your current local data. Continue?"
      );
      if (!confirmed) {
        return;
      }

      state.data.meals = body.meals.map(normalizeMeal).filter((entry) => entry.name);
      state.data.restaurants = body.restaurants.map(normalizeRestaurant).filter((entry) => entry.name);

      saveData();
      populateMealMethodFilter();
      renderMeals();
      renderRestaurants();
      showToast("Pulled data from Google Sheets.");
    } catch (error) {
      showToast(`Pull failed: ${error.message}`, true);
    } finally {
      setSyncButtonsBusy(false);
    }
  }

  function setSyncButtonsBusy(isBusy) {
    els.pullSheetsBtn.disabled = isBusy;
    els.pushSheetsBtn.disabled = isBusy;
    els.pullSheetsBtn.textContent = isBusy ? "Working..." : "Pull from Sheets";
    els.pushSheetsBtn.textContent = isBusy ? "Working..." : "Push to Sheets";
  }

  function exportData() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      meals: state.data.meals,
      restaurants: state.data.restaurants
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dinner-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Backup exported.");
  }

  async function handleImportData(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const meals = payload.data && Array.isArray(payload.data.meals) ? payload.data.meals : payload.meals;
      const restaurants =
        payload.data && Array.isArray(payload.data.restaurants) ? payload.data.restaurants : payload.restaurants;

      if (!Array.isArray(meals) || !Array.isArray(restaurants)) {
        throw new Error("File must include meals and restaurants arrays.");
      }

      const confirmed = window.confirm(
        "Importing will replace your current local data. Continue?"
      );
      if (!confirmed) {
        return;
      }

      state.data.meals = meals.map(normalizeMeal).filter((entry) => entry.name);
      state.data.restaurants = restaurants.map(normalizeRestaurant).filter((entry) => entry.name);
      saveData();
      populateMealMethodFilter();
      renderMeals();
      renderRestaurants();
      showToast("Backup imported.");
    } catch (error) {
      showToast(`Import failed: ${error.message}`, true);
    } finally {
      event.target.value = "";
    }
  }

  function hydrateSettingsForm() {
    els.sheetUrlInput.value = state.settings.sheetUrl || "";
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { meals: [], restaurants: [] };
      }
      const parsed = JSON.parse(raw);
      const meals = Array.isArray(parsed.meals) ? parsed.meals.map(normalizeMeal).filter((entry) => entry.name) : [];
      const restaurants = Array.isArray(parsed.restaurants)
        ? parsed.restaurants.map(normalizeRestaurant).filter((entry) => entry.name)
        : [];
      return { meals, restaurants };
    } catch (error) {
      return { meals: [], restaurants: [] };
    }
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) {
        return { sheetUrl: "" };
      }
      const parsed = JSON.parse(raw);
      return { sheetUrl: toCleanString(parsed.sheetUrl) };
    } catch (error) {
      return { sheetUrl: "" };
    }
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
  }

  function normalizeMeal(rawMeal) {
    return {
      id: toCleanString(rawMeal.id) || createId(),
      name: toCleanString(rawMeal.name),
      cookingMethod: toCleanString(rawMeal.cookingMethod),
      cuisine: toCleanString(rawMeal.cuisine),
      notes: toCleanString(rawMeal.notes),
      dateAdded: normalizeDate(rawMeal.dateAdded)
    };
  }

  function normalizeRestaurant(rawRestaurant) {
    const rating = Number.parseInt(rawRestaurant.rating, 10);
    return {
      id: toCleanString(rawRestaurant.id) || createId(),
      name: toCleanString(rawRestaurant.name),
      type: toCleanString(rawRestaurant.type) || "Sit-down",
      cuisine: toCleanString(rawRestaurant.cuisine),
      priceRange: toCleanString(rawRestaurant.priceRange),
      location: toCleanString(rawRestaurant.location),
      rating: Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : 0,
      notes: toCleanString(rawRestaurant.notes),
      dateAdded: normalizeDate(rawRestaurant.dateAdded)
    };
  }

  function normalizeDate(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    return date.toISOString();
  }

  function formatDate(isoDate) {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
      return "unknown date";
    }
    return date.toLocaleDateString();
  }

  function toTimestamp(isoDate) {
    const timestamp = Date.parse(isoDate);
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `id-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  }

  function renderStars(rating) {
    let output = "";
    const rounded = Math.max(0, Math.min(5, Number(rating) || 0));
    for (let i = 1; i <= 5; i += 1) {
      output += i <= rounded ? "★" : "☆";
    }
    return output;
  }

  function toCleanString(value) {
    return String(value || "").trim();
  }

  function normalizeText(value) {
    return toCleanString(value).toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function showToast(message, isError = false) {
    els.toast.textContent = message;
    els.toast.style.background = isError ? "#8f1d1d" : "#111827";
    els.toast.classList.remove("hidden");

    if (toastTimer) {
      window.clearTimeout(toastTimer);
    }
    toastTimer = window.setTimeout(() => {
      els.toast.classList.add("hidden");
    }, 2800);
  }
})();
