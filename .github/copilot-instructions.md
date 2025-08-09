# CalorieTracker AI Agent Instructions

## Architecture Overview

This is a **dual-deployment nutrition tracker** with a hybrid Express/Vercel serverless architecture:

- **Local Dev**: `server.js` Express server serves static files + API routes
- **Production**: Vercel serves static files, `api/*.js` serverless functions handle API
- **Frontend**: Vanilla JS class-based (`app.js`) with Tailwind CSS glass morphism UI
- **Data**: MongoDB (daily logs) + JSON datasets (food search) + localStorage (offline fallback)

## Critical File Relationships

### Data Flow Architecture
```
Frontend (app.js) → /api/search-food → data/local-foods.json + MongoDB FoodDatabase
                 → /api/daily-log → MongoDB (DailyLog schema)
                 → localStorage (offline fallback)
```

### Dual Environment Pattern
- **server.js**: Express routes (`/api/search-food`) load `data/local-foods.json` + MongoDB FoodDatabase
- **api/search-food.js**: Vercel serverless equivalent with identical local JSON loading logic
- Both must stay synchronized for feature parity between local/production

## Food Search System

The app prioritizes **local-first food search** for speed and offline capability:

1. **Local JSON** (`data/local-foods.json`): 101 curated common foods, primary search source
2. **MongoDB FoodDatabase**: Seeded foods for consistent local DB augmentation  
3. **USDA JSON** (`utils/usda.js`): Optional large dataset, use sparingly due to size

### Search Implementation Pattern
```javascript
// Both server.js and api/search-food.js follow this pattern:
const fromLocal = JSON.parse(readFileSync('data/local-foods.json')).filter(...)
const fromDb = await FoodDatabase.find({ name: { $regex: query, $options: 'i' }})
const combined = [...fromLocal, ...fromDb]
// Dedupe by normalized name, return array (not wrapped object)
```

## Key Development Patterns

### Weight-Based Nutrition Calculation
- All nutrition values stored as **per-100g base values**
- Frontend calculates actual values: `(baseValue * weight) / 100`
- Store base values in `data-base` attributes when populating from search

### Frontend State Management
```javascript
// CalorieTracker class manages three data stores:
this.dailyGoals = { calories: 2000, protein: 150, ... }  // User preferences
this.consumed = { calories: 0, protein: 0, ... }         // Running totals
this.foodLog = [{ id, name, calories, protein, ... }]    // Daily entries
```

### Schema Constraints
- **DailyLog**: One document per date (YYYY-MM-DD), embedded foodEntries array
- **FoodDatabase**: Unique food names, used for local search augmentation
- **Food entries**: Always include `calories`, `protein`, `carbs`, `fats`, `weight`/`quantity`

## Development Workflows

### Local Setup
```bash
npm install
cp .env.example .env  # Add MONGODB_URI
npm run seed          # Optional: populate FoodDatabase
npm start            # Express server on :3000
```

### Adding New Food Data Sources
1. Add foods to `data/local-foods.json` for immediate search availability
2. Ensure both `server.js` and `api/search-food.js` handle new JSON structure
3. Test search returns consistent array format (not wrapped objects)
4. Optional: Update `scripts/seedDatabase.js` to populate MongoDB FoodDatabase

### Database Operations
- **Seeding**: `npm run seed` runs `scripts/seedDatabase.js`
- **Daily logs**: Auto-created on first access, date-keyed (YYYY-MM-DD)
- **Connection**: Graceful degradation to localStorage if MongoDB unavailable

## Deployment Considerations

### Vercel Serverless Functions
- Functions in `api/*.js` have 30s max duration (`vercel.json`)
- Must handle cold starts - cache datasets in module scope
- CORS headers required for all API responses

### Data Loading Strategy
```javascript
// Pattern for serverless dataset loading:
let CACHED_FOODS = [];
function ensureLoaded(baseDir) {
  if (!CACHED_FOODS.length) {
    CACHED_FOODS = loadFromFile();
  }
}
```

### Environment Variables
- `MONGODB_URI`: Required for persistence (optional for demo mode)
- Local development auto-connects to `mongodb://localhost:27017/calorietracker`
- No external API keys needed - all food data is local

## UI/UX Patterns

### Real-time Search
- 500ms debounced auto-search on input
- Manual search on Enter/button click shows loading state
- Results dropdown auto-hides on outside click
- Search populates form with `data-base` attributes for weight scaling

### Animation System
- Cards use `animate-slide-up` with staggered delays
- Progress bars animate width changes
- Food items get `animate-bounce-in` on addition
- Glass morphism: `bg-white/10 backdrop-blur-md` pattern

### Notification Pattern
```javascript
this.showNotification(message, type) // 'success', 'error', 'info'
// Creates toast with auto-remove after 3s
```

## Common Gotchas

- **Frontend expects arrays**: API must return `[{food1}, {food2}]`, not `{foods: [...], total: n}`
- **MongoDB optional**: App degrades gracefully to localStorage-only mode
- **Date format**: Daily logs keyed as `YYYY-MM-DD` strings, not Date objects
- **Duplicate detection**: Normalize food names (lowercase, alphanumeric only) for deduplication
- **Weight calculations**: Base values always per-100g, scale in frontend only

## Testing Commands

```bash
# Test search endpoint
curl "http://localhost:3000/api/search-food?query=chicken"

# Test daily log
curl "http://localhost:3000/api/daily-log"

# Verify local data loading
node -e "console.log(JSON.parse(require('fs').readFileSync('./data/local-foods.json')).length)"
```

When modifying food data sources or API responses, always test both local Express server and Vercel deployment paths for consistency.
