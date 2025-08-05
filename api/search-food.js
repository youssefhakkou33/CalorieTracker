const mongoose = require('mongoose');
const axios = require('axios');

// MongoDB connection
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Food Database Schema
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

const FoodDatabase = mongoose.models.FoodDatabase || mongoose.model('FoodDatabase', foodDatabaseSchema);

// USDA API configuration
const USDA_API_KEY = process.env.USDA_API_KEY;
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// Helper function to extract nutrients from USDA response
function extractNutrients(foodItem) {
    const nutrients = {};
    
    if (foodItem.foodNutrients) {
        foodItem.foodNutrients.forEach(nutrient => {
            switch (nutrient.nutrientId) {
                case 1008: // Energy (calories)
                    nutrients.calories = nutrient.value || 0;
                    break;
                case 1003: // Protein
                    nutrients.protein = nutrient.value || 0;
                    break;
                case 1005: // Carbohydrate
                    nutrients.carbs = nutrient.value || 0;
                    break;
                case 1004: // Total lipid (fat)
                    nutrients.fats = nutrient.value || 0;
                    break;
            }
        });
    }
    
    return {
        name: foodItem.description || 'Unknown Food',
        calories: Math.round(nutrients.calories || 0),
        protein: Math.round((nutrients.protein || 0) * 100) / 100,
        carbs: Math.round((nutrients.carbs || 0) * 100) / 100,
        fats: Math.round((nutrients.fats || 0) * 100) / 100,
        fdcId: foodItem.fdcId,
        category: foodItem.foodCategory || 'general'
    };
}

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        
        // Connect to MongoDB
        await connectToDatabase();
        
        // First try local database for faster results
        const localFoods = await FoodDatabase.find({
            name: { $regex: query, $options: 'i' }
        }).limit(5);
        
        let results = localFoods.map(food => ({
            name: food.name,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fats: food.fats,
            category: food.category,
            source: 'local'
        }));
        
        // Search USDA API
        try {
            const usdaUrl = `${USDA_BASE_URL}/foods/search`;
            const params = {
                query: query,
                pageSize: 10
            };
            
            // Add API key to params if available
            if (USDA_API_KEY) {
                params.api_key = USDA_API_KEY;
            }
            
            console.log('Making USDA API request with params:', params);
            const usdaResponse = await axios.get(usdaUrl, { params });
            
            let usdaFoods = [];
            if (usdaResponse.data && usdaResponse.data.foods) {
                usdaFoods = usdaResponse.data.foods.slice(0, 8).map(extractNutrients);
            }
            
            // Combine local and USDA results
            const combinedResults = [
                ...results,
                ...usdaFoods.map(food => ({
                    ...food,
                    source: 'usda'
                }))
            ];
            
            // Remove duplicates based on name similarity
            const uniqueResults = [];
            const seenNames = new Set();
            
            combinedResults.forEach(food => {
                const normalizedName = food.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (!seenNames.has(normalizedName)) {
                    seenNames.add(normalizedName);
                    uniqueResults.push(food);
                }
            });
            
            res.json(uniqueResults.slice(0, 12));
            
        } catch (usdaError) {
            console.error('USDA API error details:', {
                message: usdaError.message,
                response: usdaError.response?.data,
                status: usdaError.response?.status,
                config: usdaError.config?.params
            });
            // Fallback to local results only
            res.json(results);
        }
        
    } catch (error) {
        console.error('Error searching foods:', error.message);
        res.status(500).json({ error: 'Failed to search foods' });
    }
}
