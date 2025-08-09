// Utility to load and simplify USDA FoundationFoods JSON into app-friendly items
const fs = require('fs');
const path = require('path');

// Nutrient IDs in USDA
const NUTRIENTS = {
  calories: 1008, // Energy (kcal)
  protein: 1003,  // Protein (g)
  carbs: 1005,    // Carbohydrate, by difference (g)
  fats: 1004,     // Total lipid (fat) (g)
};

let cache = null;
let cachedPath = null;

function getNumeric(nutrients, nutrientId) {
  if (!Array.isArray(nutrients)) return 0;
  const found = nutrients.find(
    (n) => n && (n.nutrientId === nutrientId || (n.nutrient && n.nutrient.id === nutrientId))
  );
  const val = found ? (found.value ?? found.amount) : 0;
  const num = Number(val);
  return Number.isFinite(num) ? num : 0;
}

function simplifyUsdaFood(food) {
  const description = food.description || food.foodDescription || food.name || 'Unknown';
  const nutrients = food.foodNutrients || [];
  const category =
    (food.foodCategory && (food.foodCategory.description || food.foodCategory.name)) || 'General';
  return {
    name: description,
    calories: getNumeric(nutrients, NUTRIENTS.calories),
    protein: getNumeric(nutrients, NUTRIENTS.protein),
    carbs: getNumeric(nutrients, NUTRIENTS.carbs),
    fats: getNumeric(nutrients, NUTRIENTS.fats),
    category,
    source: 'usda-json',
  };
}

function readJsonSafe(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// Loads USDA foods from a JSON file and simplifies them. Caches results.
function loadSimplifiedUsdaFoods(baseDir) {
  // Allow overriding file via env (absolute or relative)
  const override = process.env.USDA_JSON_FILE_ABSOLUTE || process.env.USDA_JSON_FILE;

  const attemptPaths = [];
  if (override) {
    // If absolute override exists, use it; if relative, resolve from baseDir
    const p = path.isAbsolute(override) ? override : path.join(baseDir, override);
    attemptPaths.push(p);
  }
  // Fallbacks within data/
  attemptPaths.push(
    path.join(baseDir, 'data', 'FoodData_Central_foundation_food_json_2025-04-24.json')
  );
  attemptPaths.push(path.join(baseDir, 'data', 'foods.json'));
  attemptPaths.push(path.join(baseDir, 'data', 'usda-foods.json'));

  let filePath = null;
  for (const p of attemptPaths) {
    try {
      if (fs.existsSync(p)) {
        filePath = p;
        break;
      }
    } catch {}
  }

  if (!filePath) {
    // No file available
    cache = cache || [];
    cachedPath = null;
    return cache;
  }

  // Return cached if same file loaded
  if (cache && cachedPath === filePath) return cache;

  const data = readJsonSafe(filePath);
  if (!data) {
    cache = [];
    cachedPath = null;
    return cache;
  }

  // Accept multiple shapes:
  // 1) { FoundationFoods: [ ... ] }
  // 2) [ ...foods... ]
  const foodsArray = Array.isArray(data)
    ? data
    : Array.isArray(data.FoundationFoods)
    ? data.FoundationFoods
    : [];

  const simplified = foodsArray
    .filter((f) => f && Array.isArray(f.foodNutrients) && f.foodNutrients.length)
    .map(simplifyUsdaFood)
    // filter out items without any macro value and with empty name
    .filter(
      (f) =>
        f.name &&
        (Number.isFinite(f.calories) ||
          Number.isFinite(f.protein) ||
          Number.isFinite(f.carbs) ||
          Number.isFinite(f.fats))
    );

  cache = simplified;
  cachedPath = filePath;
  return cache;
}

module.exports = {
  loadSimplifiedUsdaFoods,
  simplifyUsdaFood,
};
