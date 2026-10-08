const moodView = document.getElementById("mood-view");
const moodGrid = document.getElementById("mood-grid");
const moodsError = document.getElementById("moods-error");
const recipeView = document.getElementById("recipe-view");
const recipeCard = document.getElementById("recipe-card");
const statusEl = document.getElementById("status");
const errorEl = document.getElementById("error");
const anotherBtn = document.getElementById("another-btn");
const changeMoodBtn = document.getElementById("change-mood-btn");
const saveBtn = document.getElementById("save-btn");
const savedNavBtn = document.getElementById("saved-nav-btn");
const savedView = document.getElementById("saved-view");
const savedList = document.getElementById("saved-list");
const savedEmpty = document.getElementById("saved-empty");
const savedError = document.getElementById("saved-error");
const backFromSavedBtn = document.getElementById("back-from-saved-btn");
const backToSavedBtn = document.getElementById("back-to-saved-btn");

const state = {
  moods: [],
  currentMood: null,
  seenIds: [],
  currentRecipe: null,
  fromSaved: false,
};

const moodStyles = {
  happy: "bg-amber-50 hover:bg-amber-100 border-amber-200",
  sad: "bg-sky-50 hover:bg-sky-100 border-sky-200",
  stressed: "bg-rose-50 hover:bg-rose-100 border-rose-200",
  tired: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200",
  nostalgic: "bg-orange-50 hover:bg-orange-100 border-orange-200",
  adventurous: "bg-lime-50 hover:bg-lime-100 border-lime-200",
};

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}

function clearError() {
  errorEl.textContent = "";
  errorEl.classList.add("hidden");
}

function splitLines(text) {
  return String(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function renderList(el, items, tag) {
  el.replaceChildren();
  for (const item of items) {
    const li = document.createElement(tag);
    li.textContent = item;
    el.appendChild(li);
  }
}

function moodLabel(moodId) {
  const mood = state.moods.find((m) => m.id === moodId);
  return mood ? `${mood.emoji} ${mood.label}` : moodId;
}

function updateSaveButton() {
  const saved = Boolean(state.currentRecipe && state.currentRecipe.saved);
  saveBtn.textContent = saved ? "Saved" : "Save";
  saveBtn.className = saved
    ? "shrink-0 rounded-full border border-amber-700 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
    : "shrink-0 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100";
}

function setRecipeSource(fromSaved) {
  state.fromSaved = fromSaved;
  anotherBtn.classList.toggle("hidden", fromSaved);
  backToSavedBtn.classList.toggle("hidden", !fromSaved);
}

function hideAllViews() {
  moodView.classList.add("hidden");
  recipeView.classList.add("hidden");
  savedView.classList.add("hidden");
}

function renderRecipe(recipe) {
  state.currentRecipe = recipe;
  document.getElementById("recipe-mood").textContent = moodLabel(recipe.mood);
  document.getElementById("recipe-title").textContent = recipe.title;
  document.getElementById("recipe-time").textContent = recipe.time_minutes
    ? `About ${recipe.time_minutes} minutes`
    : "";
  document.getElementById("recipe-description").textContent = recipe.description;
  renderList(document.getElementById("recipe-ingredients"), splitLines(recipe.ingredients), "li");
  renderList(document.getElementById("recipe-instructions"), splitLines(recipe.instructions), "li");
  updateSaveButton();
  recipeCard.classList.remove("hidden");
}

async function fetchRecipe() {
  if (!state.currentMood) return;
  clearError();
  statusEl.textContent = "Finding a recipe…";
  anotherBtn.disabled = true;

  const params = new URLSearchParams({ mood: state.currentMood });
  if (state.seenIds.length) params.set("exclude", state.seenIds.join(","));

  try {
    const res = await fetch(`/api/recipes?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not load a recipe.");

    if (state.seenIds.includes(data.id)) {
      state.seenIds = [data.id];
    } else {
      state.seenIds.push(data.id);
    }

    renderRecipe(data);
    statusEl.textContent = "";
  } catch (err) {
    showError(err.message || "Something went wrong.");
    statusEl.textContent = "";
  } finally {
    anotherBtn.disabled = false;
  }
}

function showMoodView() {
  state.currentMood = null;
  state.seenIds = [];
  state.currentRecipe = null;
  state.fromSaved = false;
  recipeCard.classList.add("hidden");
  clearError();
  statusEl.textContent = "";
  hideAllViews();
  moodView.classList.remove("hidden");
}

function showRecipeView(moodId) {
  state.currentMood = moodId;
  state.seenIds = [];
  state.currentRecipe = null;
  setRecipeSource(false);
  hideAllViews();
  recipeView.classList.remove("hidden");
  recipeCard.classList.add("hidden");
  fetchRecipe();
}

function openSavedRecipe(recipe) {
  state.currentMood = recipe.mood;
  setRecipeSource(true);
  hideAllViews();
  recipeView.classList.remove("hidden");
  clearError();
  statusEl.textContent = "";
  renderRecipe(recipe);
}

function renderMoods(moods) {
  moodGrid.replaceChildren();
  for (const mood of moods) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = [
      "flex flex-col items-center justify-center gap-2 rounded-2xl border px-4 py-8 text-center shadow-sm transition",
      moodStyles[mood.id] || "bg-white hover:bg-stone-100 border-stone-200",
    ].join(" ");
    button.innerHTML = `<span class="text-3xl">${mood.emoji}</span><span class="font-semibold text-stone-900">${mood.label}</span>`;
    button.addEventListener("click", () => showRecipeView(mood.id));
    moodGrid.appendChild(button);
  }
}

async function toggleSave() {
  if (!state.currentRecipe) return;
  saveBtn.disabled = true;
  const recipeId = state.currentRecipe.id;
  try {
    const res = state.currentRecipe.saved
      ? await fetch(`/api/saved/${recipeId}`, { method: "DELETE" })
      : await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId }),
        });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not update saved recipes.");
    state.currentRecipe = { ...state.currentRecipe, saved: data.saved };
    updateSaveButton();
  } catch (err) {
    showError(err.message || "Could not update saved recipes.");
  } finally {
    saveBtn.disabled = false;
  }
}

async function showSavedView() {
  hideAllViews();
  savedView.classList.remove("hidden");
  savedEmpty.classList.add("hidden");
  savedError.classList.add("hidden");
  savedList.replaceChildren();

  try {
    const res = await fetch("/api/saved");
    const recipes = await res.json();
    if (!res.ok) throw new Error("Could not load saved recipes.");

    if (!recipes.length) {
      savedEmpty.classList.remove("hidden");
      return;
    }

    for (const recipe of recipes) {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className =
        "w-full rounded-2xl border border-stone-200 bg-white px-5 py-4 text-left shadow-sm hover:bg-stone-50";
      button.innerHTML = `<p class="font-semibold text-stone-900">${recipe.title}</p><p class="mt-1 text-sm text-stone-500">${moodLabel(recipe.mood)}</p>`;
      button.addEventListener("click", () => openSavedRecipe(recipe));
      item.appendChild(button);
      savedList.appendChild(item);
    }
  } catch (_err) {
    savedError.textContent = "Could not load saved recipes. Try again.";
    savedError.classList.remove("hidden");
  }
}

anotherBtn.addEventListener("click", fetchRecipe);
changeMoodBtn.addEventListener("click", showMoodView);
saveBtn.addEventListener("click", toggleSave);
savedNavBtn.addEventListener("click", showSavedView);
backFromSavedBtn.addEventListener("click", showMoodView);
backToSavedBtn.addEventListener("click", showSavedView);

async function init() {
  try {
    const res = await fetch("/api/moods");
    const moods = await res.json();
    if (!res.ok) throw new Error("Could not load moods.");
    state.moods = moods;
    renderMoods(moods);
  } catch (_err) {
    moodsError.textContent = "Could not load moods. Refresh and try again.";
    moodsError.classList.remove("hidden");
  }
}

init();
