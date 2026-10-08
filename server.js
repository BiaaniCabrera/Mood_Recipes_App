const fs = require("fs");
const path = require("path");
const express = require("express");
const Database = require("better-sqlite3");

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "recipes.db");

const MOODS = [
  { id: "happy", label: "Happy", emoji: "☀️" },
  { id: "sad", label: "Sad", emoji: "🌧️" },
  { id: "stressed", label: "Stressed", emoji: "💨" },
  { id: "tired", label: "Tired", emoji: "🌙" },
  { id: "nostalgic", label: "Nostalgic", emoji: "📷" },
  { id: "adventurous", label: "Adventurous", emoji: "🌶️" },
];

const SEED_RECIPES = [
  {
    title: "Lemon Berry Parfait",
    mood: "happy",
    description: "Bright layers of yogurt, berries, and honey for a sunny snack.",
    ingredients: "1 cup Greek yogurt\n1 cup mixed berries\n2 tbsp honey\n1/4 cup granola",
    instructions:
      "Spoon yogurt into a glass.\nAdd berries and a drizzle of honey.\nTop with granola and serve.",
    time_minutes: 10,
  },
  {
    title: "Mango Salsa Tacos",
    mood: "happy",
    description: "Colorful tacos with sweet mango salsa and lime.",
    ingredients:
      "8 small tortillas\n2 ripe mangoes, diced\n1/2 red onion, minced\n1 lime\n1 cup cooked black beans\nFresh cilantro",
    instructions:
      "Toss mango, onion, lime juice, and cilantro.\nWarm tortillas and fill with beans.\nSpoon salsa on top and eat immediately.",
    time_minutes: 20,
  },
  {
    title: "Sunshine Pasta Salad",
    mood: "happy",
    description: "A cold pasta salad with cherry tomatoes, basil, and lemon.",
    ingredients:
      "8 oz pasta\n1 cup cherry tomatoes\n1/4 cup olive oil\n1 lemon\nHandful of basil\nSalt and pepper",
    instructions:
      "Cook pasta, drain, and cool.\nHalve tomatoes and toss with oil, lemon, salt, and pepper.\nFold in pasta and torn basil.",
    time_minutes: 25,
  },
  {
    title: "Classic Tomato Soup",
    mood: "sad",
    description: "A warm bowl of tomato soup with a grilled cheese on the side.",
    ingredients:
      "1 can crushed tomatoes\n1 onion\n2 garlic cloves\n2 cups vegetable broth\n2 tbsp butter\nSalt, pepper, and cream",
    instructions:
      "Sauté onion and garlic in butter.\nAdd tomatoes and broth; simmer 15 minutes.\nBlend until smooth and finish with a splash of cream.",
    time_minutes: 30,
  },
  {
    title: "Banana Bread",
    mood: "sad",
    description: "Soft, sweet banana bread that fills the kitchen with comfort.",
    ingredients:
      "3 ripe bananas\n1/3 cup melted butter\n1/2 cup sugar\n1 egg\n1 tsp vanilla\n1 1/2 cups flour\n1 tsp baking soda",
    instructions:
      "Mash bananas and mix with butter, sugar, egg, and vanilla.\nStir in flour and baking soda.\nBake at 350°F (175°C) for 50 minutes.",
    time_minutes: 60,
  },
  {
    title: "Mac and Cheese",
    mood: "sad",
    description: "Creamy stovetop macaroni with extra cheddar.",
    ingredients:
      "8 oz elbow pasta\n2 tbsp butter\n2 tbsp flour\n1 1/2 cups milk\n2 cups shredded cheddar\nSalt and pepper",
    instructions:
      "Cook pasta until tender.\nMake a roux with butter and flour, then whisk in milk.\nMelt in cheese, fold pasta, and season.",
    time_minutes: 25,
  },
  {
    title: "Five-Minute Hummus Plate",
    mood: "stressed",
    description: "No cooking: hummus, crunchy veg, and pita for a calm snack.",
    ingredients:
      "1 cup hummus\n1 cucumber\n1 carrot\nPita or crackers\nOlive oil and paprika",
    instructions:
      "Spread hummus on a plate.\nSlice cucumber and carrot.\nDrizzle oil, dust paprika, and dip.",
    time_minutes: 5,
  },
  {
    title: "Sheet-Pan Salmon and Broccoli",
    mood: "stressed",
    description: "One pan, little cleanup, and dinner in under half an hour.",
    ingredients:
      "2 salmon fillets\n1 head broccoli\n2 tbsp olive oil\n1 lemon\nSalt, pepper, garlic powder",
    instructions:
      "Toss broccoli with oil and seasoning on a sheet pan.\nAdd salmon, lemon slices, and more seasoning.\nRoast at 400°F (200°C) for 15 minutes.",
    time_minutes: 25,
  },
  {
    title: "Ginger Green Smoothie",
    mood: "stressed",
    description: "A cool blend of spinach, banana, and ginger to reset.",
    ingredients:
      "1 banana\n1 handful spinach\n1 tsp fresh ginger\n1 cup almond milk\n1 tsp honey",
    instructions:
      "Add everything to a blender.\nBlend until smooth.\nPour and sip slowly.",
    time_minutes: 5,
  },
  {
    title: "Egg Drop Soup",
    mood: "tired",
    description: "A light, soothing soup that comes together in one pot.",
    ingredients:
      "3 cups chicken or vegetable broth\n2 eggs\n1 tsp soy sauce\n1 tsp cornstarch\nGreen onions and white pepper",
    instructions:
      "Bring broth to a simmer with soy sauce.\nWhisk cornstarch with a splash of water and stir in.\nDrizzle beaten eggs while stirring, then top with green onion.",
    time_minutes: 15,
  },
  {
    title: "Avocado Toast with Egg",
    mood: "tired",
    description: "Toast, mashed avocado, and a fried egg for low-effort fuel.",
    ingredients:
      "2 slices bread\n1 avocado\n2 eggs\nSalt, pepper, chili flakes\nLemon juice",
    instructions:
      "Toast the bread and mash avocado with lemon, salt, and pepper.\nFry or poach the eggs.\nSpread avocado, add eggs, and finish with chili flakes.",
    time_minutes: 10,
  },
  {
    title: "Overnight Oats",
    mood: "tired",
    description: "Mix tonight, eat tomorrow. Almost no work when you are worn out.",
    ingredients:
      "1/2 cup oats\n1/2 cup milk\n1 tbsp chia seeds\n1 tbsp maple syrup\nFruit for topping",
    instructions:
      "Stir oats, milk, chia, and maple in a jar.\nRefrigerate overnight.\nTop with fruit in the morning.",
    time_minutes: 5,
  },
  {
    title: "Baked Potato with Butter",
    mood: "nostalgic",
    description: "A fluffy baked potato with butter, salt, and chives.",
    ingredients:
      "2 russet potatoes\n2 tbsp butter\nSalt and pepper\nChives or green onion\nSour cream (optional)",
    instructions:
      "Prick potatoes and bake at 425°F (220°C) for 45–60 minutes.\nSplit open and fluff the inside.\nAdd butter, salt, pepper, and chives.",
    time_minutes: 60,
  },
  {
    title: "Cinnamon Apple Oatmeal",
    mood: "nostalgic",
    description: "Warm oats simmered with apple and cinnamon.",
    ingredients:
      "1 cup oats\n2 cups milk or water\n1 apple, diced\n1 tsp cinnamon\n1 tbsp brown sugar or maple",
    instructions:
      "Simmer oats with milk, apple, and cinnamon.\nCook until creamy, about 8 minutes.\nSweeten to taste and serve warm.",
    time_minutes: 15,
  },
  {
    title: "Hot Chocolate and Toast",
    mood: "nostalgic",
    description: "Rich cocoa and buttery toast for a quiet evening.",
    ingredients:
      "2 cups milk\n2 tbsp cocoa powder\n2 tbsp sugar\nPinch of salt\nBread and butter",
    instructions:
      "Warm milk with cocoa, sugar, and salt, whisking until smooth.\nToast and butter the bread.\nPour cocoa into mugs and dunk.",
    time_minutes: 10,
  },
  {
    title: "Chili-Lime Shrimp Bowls",
    mood: "adventurous",
    description: "Quick shrimp with chili, lime, and rice for a little heat.",
    ingredients:
      "1 lb shrimp\n2 cups cooked rice\n2 tbsp olive oil\n1 tsp chili powder\n1 lime\nCilantro and avocado",
    instructions:
      "Toss shrimp with oil, chili, salt, and lime zest.\nSauté 2–3 minutes per side until pink.\nServe over rice with avocado, cilantro, and lime juice.",
    time_minutes: 20,
  },
  {
    title: "Miso Ramen Hack",
    mood: "adventurous",
    description: "Instant noodles upgraded with miso, egg, and greens.",
    ingredients:
      "1 pack ramen\n1 tbsp miso paste\n1 egg\nHandful of spinach\nGreen onion and sesame oil",
    instructions:
      "Boil noodles, then stir in miso instead of (or with) the packet.\nPoach or boil the egg and add spinach to wilt.\nFinish with green onion and a drop of sesame oil.",
    time_minutes: 12,
  },
  {
    title: "Spiced Chickpea Wraps",
    mood: "adventurous",
    description: "Crispy spiced chickpeas tucked into a wrap with yogurt sauce.",
    ingredients:
      "1 can chickpeas\n1 tsp cumin\n1 tsp smoked paprika\nTortillas or flatbread\nYogurt, lemon, garlic\nLettuce or cucumber",
    instructions:
      "Roast or pan-fry chickpeas with oil and spices until crisp.\nMix yogurt with lemon and garlic.\nFill wraps with chickpeas, veg, and sauce.",
    time_minutes: 25,
  },
];

function initDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      mood TEXT NOT NULL,
      description TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      instructions TEXT NOT NULL,
      time_minutes INTEGER
    );
    CREATE TABLE IF NOT EXISTS saved_recipes (
      recipe_id INTEGER PRIMARY KEY,
      saved_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (recipe_id) REFERENCES recipes(id)
    );
  `);

  const count = db.prepare("SELECT COUNT(*) AS n FROM recipes").get().n;
  if (count === 0) {
    const insert = db.prepare(`
      INSERT INTO recipes (title, mood, description, ingredients, instructions, time_minutes)
      VALUES (@title, @mood, @description, @ingredients, @instructions, @time_minutes)
    `);
    const tx = db.transaction((recipes) => {
      for (const recipe of recipes) insert.run(recipe);
    });
    tx(SEED_RECIPES);
  }

  db.prepare("UPDATE recipes SET mood = 'nostalgic' WHERE mood = 'cozy'").run();

  return db;
}

function withSavedFlag(recipe) {
  if (!recipe) return recipe;
  const row = db.prepare("SELECT 1 AS n FROM saved_recipes WHERE recipe_id = ?").get(recipe.id);
  return { ...recipe, saved: Boolean(row) };
}

const db = initDb();
const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/app", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/moods", (_req, res) => {
  res.json(MOODS);
});

app.get("/api/recipes", (req, res) => {
  const mood = String(req.query.mood || "").toLowerCase();
  const validMood = MOODS.some((m) => m.id === mood);
  if (!validMood) {
    return res.status(400).json({ error: "Unknown mood. Use one of: " + MOODS.map((m) => m.id).join(", ") });
  }

  const exclude = String(req.query.exclude || "")
    .split(",")
    .map((id) => Number.parseInt(id, 10))
    .filter((id) => Number.isInteger(id) && id > 0);

  let recipe = null;
  if (exclude.length > 0) {
    const placeholders = exclude.map(() => "?").join(",");
    recipe = db
      .prepare(
        `SELECT * FROM recipes WHERE mood = ? AND id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT 1`
      )
      .get(mood, ...exclude);
  }

  if (!recipe) {
    recipe = db.prepare("SELECT * FROM recipes WHERE mood = ? ORDER BY RANDOM() LIMIT 1").get(mood);
  }

  if (!recipe) {
    return res.status(404).json({ error: "No recipes found for that mood." });
  }

  res.json(withSavedFlag(recipe));
});

app.get("/api/saved", (_req, res) => {
  const recipes = db
    .prepare(
      `SELECT r.* FROM recipes r
       INNER JOIN saved_recipes s ON s.recipe_id = r.id
       ORDER BY s.saved_at DESC`
    )
    .all()
    .map((recipe) => ({ ...recipe, saved: true }));
  res.json(recipes);
});

app.post("/api/saved", (req, res) => {
  const recipeId = Number.parseInt(req.body && req.body.recipeId, 10);
  if (!Number.isInteger(recipeId) || recipeId <= 0) {
    return res.status(400).json({ error: "A valid recipeId is required." });
  }

  const recipe = db.prepare("SELECT * FROM recipes WHERE id = ?").get(recipeId);
  if (!recipe) {
    return res.status(404).json({ error: "Recipe not found." });
  }

  db.prepare("INSERT OR IGNORE INTO saved_recipes (recipe_id) VALUES (?)").run(recipeId);
  res.json(withSavedFlag(recipe));
});

app.delete("/api/saved/:id", (req, res) => {
  const recipeId = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(recipeId) || recipeId <= 0) {
    return res.status(400).json({ error: "A valid recipe id is required." });
  }

  db.prepare("DELETE FROM saved_recipes WHERE recipe_id = ?").run(recipeId);
  const recipe = db.prepare("SELECT * FROM recipes WHERE id = ?").get(recipeId);
  if (!recipe) {
    return res.json({ id: recipeId, saved: false });
  }
  res.json(withSavedFlag(recipe));
});

app.listen(PORT, () => {
  console.log(`Mood recipe app running at http://localhost:${PORT}`);
});
