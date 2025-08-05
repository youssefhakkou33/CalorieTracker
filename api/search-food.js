const axios = require('axios');

// Simplified search function for serverless deployment
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Local food database for fallback
    const localFoods = [
      { name: 'Apple, raw', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, source: 'local' },
      { name: 'Banana, raw', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, source: 'local' },
      { name: 'Orange, raw', calories: 47, protein: 0.9, carbs: 12, fats: 0.1, source: 'local' },
      { name: 'Chicken breast, grilled', calories: 165, protein: 31, carbs: 0, fats: 3.6, source: 'local' },
      { name: 'Rice, white, cooked', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, source: 'local' },
      { name: 'Broccoli, raw', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, source: 'local' },
      { name: 'Salmon, grilled', calories: 206, protein: 22, carbs: 0, fats: 12, source: 'local' },
      { name: 'Egg, whole, raw', calories: 155, protein: 13, carbs: 1.1, fats: 11, source: 'local' },
      { name: 'Avocado, raw', calories: 160, protein: 2, carbs: 9, fats: 15, source: 'local' },
      { name: 'Bread, whole wheat', calories: 247, protein: 13, carbs: 41, fats: 4.2, source: 'local' }
    ];

    let foods = [];

    // Try USDA API first
    if (process.env.USDA_API_KEY) {
      try {
        const response = await axios.get('https://api.nal.usda.gov/fdc/v1/foods/search', {
          params: {
            query: query,
            api_key: process.env.USDA_API_KEY,
            pageSize: 15,
            dataType: ['Foundation', 'SR Legacy']
          },
          timeout: 5000
        });

        if (response.data && response.data.foods) {
          foods = response.data.foods.map(food => {
            const nutrients = food.foodNutrients || [];
            
            const getNumericValue = (nutrientId) => {
              const nutrient = nutrients.find(n => n.nutrientId === nutrientId);
              return nutrient ? parseFloat(nutrient.value) || 0 : 0;
            };

            return {
              name: food.description || 'Unknown',
              calories: getNumericValue(1008) || 0,
              protein: getNumericValue(1003) || 0,
              carbs: getNumericValue(1005) || 0,
              fats: getNumericValue(1004) || 0,
              fiber: getNumericValue(1079) || 0,
              sugar: getNumericValue(2000) || 0,
              sodium: getNumericValue(1093) || 0,
              source: 'USDA'
            };
          });
        }
      } catch (usdaError) {
        console.log('USDA API error:', usdaError.message);
        // Continue to local search if USDA fails
      }
    }

    // If no USDA results, search local database
    if (foods.length === 0) {
      const queryLower = query.toLowerCase();
      foods = localFoods.filter(food => 
        food.name.toLowerCase().includes(queryLower)
      );
    }

    return res.status(200).json({
      foods: foods.slice(0, 25),
      source: foods.length > 0 ? (foods[0].source === 'USDA' ? 'USDA' : 'local') : 'none',
      total: foods.length,
      query: query
    });

  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      query: req.query.query || 'none'
    });
  }
};
