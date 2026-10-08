const moodView = document.getElementById("mood-view");
const moodGrid = document.getElementById("mood-grid");
const moodsError = document.getElementById("moods-error");
const recipeView = document.getElementById("recipe-view");
const recipeDeck = document.getElementById("recipe-deck");
const recipeCard = document.getElementById("recipe-card");
const statusEl = document.getElementById("status");
const errorEl = document.getElementById("error");
const changeMoodBtn = document.getElementById("change-mood-btn");
const saveBtn = document.getElementById("save-btn");
const profileBtn = document.getElementById("profile-btn");
const savedView = document.getElementById("saved-view");
const savedList = document.getElementById("saved-list");
const savedEmpty = document.getElementById("saved-empty");
const savedError = document.getElementById("saved-error");
const backFromSavedBtn = document.getElementById("back-from-saved-btn");
const backToSavedBtn = document.getElementById("back-to-saved-btn");

const desktopQuery = window.matchMedia("(min-width: 768px)");

const state = {
  moods: [],
  currentMood: null,
  deck: [],
  activeIndex: 0,
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

function saveButtonClass(saved) {
  return saved
    ? "shrink-0 rounded-full border border-amber-700 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
    : "shrink-0 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-100";
}

function updateSaveButton() {
  const saved = Boolean(state.currentRecipe && state.currentRecipe.saved);
  saveBtn.textContent = saved ? "Saved" : "Save";
  saveBtn.className = saveButtonClass(saved);
}

function hideAllViews() {
  moodView.classList.add("hidden");
  recipeView.classList.add("hidden");
  savedView.classList.add("hidden");
}

function applyDeckLayout() {
  if (!state.deck.length) return;
  const tracks = state.deck.map((_, index) => (index === state.activeIndex ? "5fr" : "1fr")).join(" ");
  if (desktopQuery.matches) {
    recipeDeck.style.gridTemplateColumns = tracks;
    recipeDeck.style.gridTemplateRows = "1fr";
  } else {
    recipeDeck.style.gridTemplateRows = tracks;
    recipeDeck.style.gridTemplateColumns = "1fr";
  }
}

function setActiveCard(index) {
  state.activeIndex = index;
  const items = recipeDeck.querySelectorAll(".recipe-card-item");
  items.forEach((item, itemIndex) => {
    const active = itemIndex === index;
    item.classList.toggle("is-active", active);
    item.setAttribute("data-active", active ? "true" : "false");
  });
  applyDeckLayout();
}

function appendSection(parent, heading, items, tag) {
  const block = document.createElement("div");
  const title = document.createElement("h4");
  title.className = "text-xs font-semibold uppercase tracking-wide text-stone-500";
  title.textContent = heading;
  const list = document.createElement(tag === "ol" ? "ol" : "ul");
  list.className =
    tag === "ol"
      ? "mt-2 list-decimal space-y-1 pl-5 text-sm text-stone-800"
      : "mt-2 list-disc space-y-1 pl-5 text-sm text-stone-800";
  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  }
  block.append(title, list);
  parent.appendChild(block);
}

function renderDeck(recipes) {
  state.deck = recipes;
  state.activeIndex = 0;
  recipeDeck.replaceChildren();
  const tone = moodStyles[state.currentMood] || "bg-white border-stone-200";

  recipes.forEach((recipe, index) => {
    const item = document.createElement("li");
    item.className = `recipe-card-item relative cursor-pointer overflow-hidden rounded-2xl border shadow-sm ${tone}`;
    item.tabIndex = 0;

    const collapsed = document.createElement("h3");
    collapsed.className = "collapsed-title";
    collapsed.textContent = recipe.title;

    const body = document.createElement("div");
    body.className = "expanded-body";

    const header = document.createElement("div");
    header.className = "flex items-start justify-between gap-3";

    const titles = document.createElement("div");
    const mood = document.createElement("p");
    mood.className = "text-xs font-semibold uppercase tracking-wide text-amber-800";
    mood.textContent = moodLabel(recipe.mood);
    const title = document.createElement("h3");
    title.className = "mt-1 text-xl font-bold text-stone-900";
    title.textContent = recipe.title;
    const time = document.createElement("p");
    time.className = "mt-1 text-sm text-stone-600";
    time.textContent = recipe.time_minutes ? `About ${recipe.time_minutes} minutes` : "";
    titles.append(mood, title, time);

    const save = document.createElement("button");
    save.type = "button";
    save.className = saveButtonClass(recipe.saved);
    save.textContent = recipe.saved ? "Saved" : "Save";
    save.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleSaveRecipe(recipe, save);
    });

    header.append(titles, save);

    const description = document.createElement("p");
    description.className = "mt-3 text-sm text-stone-800";
    description.textContent = recipe.description;

    const details = document.createElement("div");
    details.className = "mt-4 grid gap-4";
    appendSection(details, "Ingredients", splitLines(recipe.ingredients), "ul");
    appendSection(details, "Steps", splitLines(recipe.instructions), "ol");

    body.append(header, description, details);
    item.append(collapsed, body);

    const activate = () => setActiveCard(index);
    item.addEventListener("mouseenter", activate);
    item.addEventListener("focus", activate);
    item.addEventListener("click", activate);

    recipeDeck.appendChild(item);
  });

  setActiveCard(0);
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

async function fetchDeck() {
  if (!state.currentMood) return;
  clearError();
  statusEl.textContent = "Finding recipes…";
  recipeDeck.classList.add("hidden");

  try {
    const params = new URLSearchParams({ mood: state.currentMood, all: "1" });
    const res = await fetch(`/api/recipes?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not load recipes.");
    renderDeck(data);
    recipeDeck.classList.remove("hidden");
    statusEl.textContent = "";
  } catch (err) {
    showError(err.message || "Something went wrong.");
    statusEl.textContent = "";
  }
}

function showMoodView() {
  state.currentMood = null;
  state.deck = [];
  state.activeIndex = 0;
  state.currentRecipe = null;
  state.fromSaved = false;
  recipeCard.classList.add("hidden");
  recipeDeck.classList.add("hidden");
  clearError();
  statusEl.textContent = "";
  hideAllViews();
  moodView.classList.remove("hidden");
}

function showRecipeView(moodId) {
  state.currentMood = moodId;
  state.deck = [];
  state.currentRecipe = null;
  state.fromSaved = false;
  hideAllViews();
  recipeView.classList.remove("hidden");
  recipeCard.classList.add("hidden");
  backToSavedBtn.classList.add("hidden");
  fetchDeck();
}

function openSavedRecipe(recipe) {
  state.currentMood = recipe.mood;
  state.fromSaved = true;
  state.deck = [];
  hideAllViews();
  recipeView.classList.remove("hidden");
  recipeDeck.classList.add("hidden");
  backToSavedBtn.classList.remove("hidden");
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

async function toggleSaveRecipe(recipe, button) {
  if (!recipe || !button) return;
  button.disabled = true;
  try {
    const res = recipe.saved
      ? await fetch(`/api/saved/${recipe.id}`, { method: "DELETE" })
      : await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId: recipe.id }),
        });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not update saved recipes.");
    recipe.saved = data.saved;
    const inDeck = state.deck.find((item) => item.id === recipe.id);
    if (inDeck && inDeck !== recipe) inDeck.saved = data.saved;
    if (state.currentRecipe && state.currentRecipe.id === recipe.id) {
      state.currentRecipe.saved = data.saved;
      updateSaveButton();
    }
    button.textContent = recipe.saved ? "Saved" : "Save";
    button.className = saveButtonClass(recipe.saved);
  } catch (err) {
    showError(err.message || "Could not update saved recipes.");
  } finally {
    button.disabled = false;
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

changeMoodBtn.addEventListener("click", showMoodView);
saveBtn.addEventListener("click", () => toggleSaveRecipe(state.currentRecipe, saveBtn));
profileBtn.addEventListener("click", showSavedView);
backFromSavedBtn.addEventListener("click", showMoodView);
backToSavedBtn.addEventListener("click", showSavedView);
desktopQuery.addEventListener("change", applyDeckLayout);

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
