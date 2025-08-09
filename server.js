const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/calorietracker';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB successfully');
})
.catch((error) => {
    console.error('MongoDB connection error:', error);
});

// Food Entry Schema
const foodEntrySchema = new mongoose.Schema({
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    timestamp: { type: Date, default: Date.now }
});

// Daily Log Schema
const dailyLogSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true }, // YYYY-MM-DD format
    userId: { type: String, default: 'default' }, // For multi-user support later
    dailyGoals: {
        calories: { type: Number, default: 2000 },
        protein: { type: Number, default: 150 },
        carbs: { type: Number, default: 250 },
        fats: { type: Number, default: 65 }
    },
    consumed: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fats: { type: Number, default: 0 }
    },
    foodEntries: [foodEntrySchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
dailyLogSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const DailyLog = mongoose.model('DailyLog', dailyLogSchema);

// Food Database Schema (for search functionality)
const foodDatabaseSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true },
    category: { type: String, default: 'general' },
    brand: { type: String, default: '' },
    servingSize: { type: String, default: '100g' },
    createdAt: { type: Date, default: Date.now }
});

const FoodDatabase = mongoose.model('FoodDatabase', foodDatabaseSchema);

// Load local food dataset (once at startup) and USDA dataset (optional)
const LOCAL_DATA_PATH = path.join(__dirname, 'data', 'local-foods.json');
let LOCAL_FOODS = [];
try {
    const raw = fs.readFileSync(LOCAL_DATA_PATH, 'utf-8');
    LOCAL_FOODS = JSON.parse(raw);
    console.log(`Loaded ${LOCAL_FOODS.length} foods from local dataset`);
} catch (e) {
    console.warn('Warning: Failed to load local food dataset:', e.message);
}

// Try to load USDA dataset if present
let USDA_FOODS = [];
try {
    const { loadSimplifiedUsdaFoods } = require('./utils/usda');
    USDA_FOODS = loadSimplifiedUsdaFoods(__dirname);
    if (USDA_FOODS && USDA_FOODS.length) {
        console.log(`Loaded ${USDA_FOODS.length} foods from USDA dataset`);
    } else {
        console.log('USDA dataset not found or empty; continuing with local data only');
    }
} catch (e) {
    console.log('USDA loader not available:', e.message);
}

// Get today's log
app.get('/api/daily-log', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        let dailyLog = await DailyLog.findOne({ date: today });
        
        if (!dailyLog) {
            // Create a new daily log for today
            dailyLog = new DailyLog({ date: today });
            await dailyLog.save();
        }
        
        res.json(dailyLog);
    } catch (error) {
        console.error('Error fetching daily log:', error);
        res.status(500).json({ error: 'Failed to fetch daily log' });
    }
});

// Save/update today's log
app.post('/api/daily-log', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const { dailyGoals, consumed, foodEntries } = req.body;
        
        let dailyLog = await DailyLog.findOne({ date: today });
        
        if (!dailyLog) {
            dailyLog = new DailyLog({ 
                date: today,
                dailyGoals,
                consumed,
                foodEntries
            });
        } else {
            dailyLog.dailyGoals = dailyGoals;
            dailyLog.consumed = consumed;
            dailyLog.foodEntries = foodEntries;
        }
        
        await dailyLog.save();
        res.json({ success: true, data: dailyLog });
    } catch (error) {
        console.error('Error saving daily log:', error);
        res.status(500).json({ error: 'Failed to save daily log' });
    }
});

// Add food entry to today's log
app.post('/api/add-food', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const foodEntry = req.body;
        
        let dailyLog = await DailyLog.findOne({ date: today });
        
        if (!dailyLog) {
            dailyLog = new DailyLog({ date: today });
        }
        
        // Add food entry
        dailyLog.foodEntries.push(foodEntry);
        
        // Update consumed totals
        dailyLog.consumed.calories += foodEntry.calories;
        dailyLog.consumed.protein += foodEntry.protein;
        dailyLog.consumed.carbs += foodEntry.carbs;
        dailyLog.consumed.fats += foodEntry.fats;
        
        await dailyLog.save();
        res.json({ success: true, data: dailyLog });
    } catch (error) {
        console.error('Error adding food:', error);
        res.status(500).json({ error: 'Failed to add food' });
    }
});

// Remove food entry from today's log
app.delete('/api/remove-food/:entryId', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const entryId = req.params.entryId;
        
        const dailyLog = await DailyLog.findOne({ date: today });
        
        if (!dailyLog) {
            return res.status(404).json({ error: 'Daily log not found' });
        }
        
        const foodEntry = dailyLog.foodEntries.id(entryId);
        if (!foodEntry) {
            return res.status(404).json({ error: 'Food entry not found' });
        }
        
        // Update consumed totals
        dailyLog.consumed.calories -= foodEntry.calories;
        dailyLog.consumed.protein -= foodEntry.protein;
        dailyLog.consumed.carbs -= foodEntry.carbs;
        dailyLog.consumed.fats -= foodEntry.fats;
        
        // Remove food entry
        foodEntry.remove();
        
        await dailyLog.save();
        res.json({ success: true, data: dailyLog });
    } catch (error) {
        console.error('Error removing food:', error);
        res.status(500).json({ error: 'Failed to remove food' });
    }
});

// Search foods using local JSON dataset (and optional MongoDB if present)
app.get('/api/search-food', async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        const q = query.trim().toLowerCase();
        const matchesFromJson = (LOCAL_FOODS || [])
            .filter(item => typeof item.name === 'string' && item.name.toLowerCase().includes(q))
            .slice(0, 20)
            .map(item => ({
                name: item.name,
                calories: Number(item.calories) || 0,
                protein: Number(item.protein) || 0,
                carbs: Number(item.carbs) || 0,
                fats: Number(item.fats) || 0,
                category: item.category || 'general',
                source: 'local'
            }));

        // Search USDA dataset if available
        let matchesFromUsda = [];
        if (USDA_FOODS && USDA_FOODS.length) {
            matchesFromUsda = USDA_FOODS
                .filter(item => typeof item.name === 'string' && item.name.toLowerCase().includes(q))
                .slice(0, 20)
                .map(item => ({
                    name: item.name,
                    calories: Number(item.calories) || 0,
                    protein: Number(item.protein) || 0,
                    carbs: Number(item.carbs) || 0,
                    fats: Number(item.fats) || 0,
                    category: item.category || 'General',
                    source: 'usda'
                }));
        }

        // Optionally include results from MongoDB if connected and data exists
        let matchesFromDb = [];
        try {
            if (mongoose.connection.readyState === 1) {
                const localFoods = await FoodDatabase.find({
                    name: { $regex: query, $options: 'i' }
                }).limit(20);
                matchesFromDb = localFoods.map(food => ({
                    name: food.name,
                    calories: food.calories,
                    protein: food.protein,
                    carbs: food.carbs,
                    fats: food.fats,
                    category: food.category,
                    source: 'local'
                }));
            }
        } catch (dbErr) {
            console.warn('Warning: local DB search failed, using JSON only:', dbErr.message);
        }

        // Merge and de-duplicate by normalized name
    const combined = [...matchesFromUsda, ...matchesFromJson, ...matchesFromDb];
        const seen = new Set();
        const unique = [];
        for (const f of combined) {
            const key = (f.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(f);
            }
        }

    res.json(unique.slice(0, 20));
    } catch (error) {
        console.error('Error searching foods:', error.message);
        res.status(500).json({ error: 'Failed to search foods' });
    }
});

// Removed external USDA details route; all data is served from local sources

// Add food to database
app.post('/api/food-database', async (req, res) => {
    try {
        const foodData = req.body;
        const food = new FoodDatabase(foodData);
        await food.save();
        res.json({ success: true, data: food });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Food already exists in database' });
        }
        console.error('Error adding food to database:', error);
        res.status(500).json({ error: 'Failed to add food to database' });
    }
});

// Get weekly summary
app.get('/api/weekly-summary', async (req, res) => {
    try {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        
        const startDate = weekAgo.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];
        
        const weeklyLogs = await DailyLog.find({
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });
        
        // Calculate weekly averages
        const summary = {
            days: weeklyLogs.length,
            averages: {
                calories: 0,
                protein: 0,
                carbs: 0,
                fats: 0
            },
            totals: {
                calories: 0,
                protein: 0,
                carbs: 0,
                fats: 0
            },
            dailyLogs: weeklyLogs
        };
        
        if (weeklyLogs.length > 0) {
            const totals = weeklyLogs.reduce((acc, log) => {
                acc.calories += log.consumed.calories;
                acc.protein += log.consumed.protein;
                acc.carbs += log.consumed.carbs;
                acc.fats += log.consumed.fats;
                return acc;
            }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
            
            summary.totals = totals;
            summary.averages = {
                calories: Math.round(totals.calories / weeklyLogs.length),
                protein: Math.round(totals.protein / weeklyLogs.length),
                carbs: Math.round(totals.carbs / weeklyLogs.length),
                fats: Math.round(totals.fats / weeklyLogs.length)
            };
        }
        
        res.json(summary);
    } catch (error) {
        console.error('Error fetching weekly summary:', error);
        res.status(500).json({ error: 'Failed to fetch weekly summary' });
    }
});

// Update daily goals
app.put('/api/daily-goals', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const { dailyGoals } = req.body;
        
        let dailyLog = await DailyLog.findOne({ date: today });
        
        if (!dailyLog) {
            dailyLog = new DailyLog({ date: today, dailyGoals });
        } else {
            dailyLog.dailyGoals = dailyGoals;
        }
        
        await dailyLog.save();
        res.json({ success: true, data: dailyLog });
    } catch (error) {
        console.error('Error updating daily goals:', error);
        res.status(500).json({ error: 'Failed to update daily goals' });
    }
});

// Initialize food database with common foods
async function initializeFoodDatabase() {
    try {
        const count = await FoodDatabase.countDocuments();
        if (count === 0) {
            const commonFoods = [
                { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6, category: 'protein' },
                { name: 'Brown Rice', calories: 112, protein: 2.6, carbs: 22, fats: 0.9, category: 'grain' },
                { name: 'Broccoli', calories: 25, protein: 3, carbs: 5, fats: 0.3, category: 'vegetable' },
                { name: 'Salmon', calories: 208, protein: 22, carbs: 0, fats: 12, category: 'protein' },
                { name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, category: 'vegetable' },
                { name: 'Greek Yogurt', calories: 100, protein: 10, carbs: 6, fats: 0.4, category: 'dairy' },
                { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fats: 50, category: 'nuts' },
                { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, category: 'fruit' },
                { name: 'Oatmeal', calories: 68, protein: 2.4, carbs: 12, fats: 1.4, category: 'grain' },
                { name: 'Eggs', calories: 155, protein: 13, carbs: 1.1, fats: 11, category: 'protein' },
                { name: 'Spinach', calories: 7, protein: 0.9, carbs: 1.1, fats: 0.1, category: 'vegetable' },
                { name: 'Avocado', calories: 160, protein: 2, carbs: 9, fats: 15, category: 'fruit' },
                { name: 'Quinoa', calories: 120, protein: 4.4, carbs: 22, fats: 1.9, category: 'grain' },
                { name: 'Turkey Breast', calories: 135, protein: 30, carbs: 0, fats: 1, category: 'protein' },
                { name: 'Cottage Cheese', calories: 98, protein: 11, carbs: 3.4, fats: 4.3, category: 'dairy' }
            ];
            
            await FoodDatabase.insertMany(commonFoods);
            console.log('Food database initialized with common foods');
        }
    } catch (error) {
        console.error('Error initializing food database:', error);
    }
}

// Serve the main HTML file for any non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the app`);
    
    // Initialize food database
    await initializeFoodDatabase();
});

module.exports = app;
