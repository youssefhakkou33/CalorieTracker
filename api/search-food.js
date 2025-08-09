const path = require('path');
const fs = require('fs');
let USDA_FOODS = [];
let LOCAL_FOODS = [];

// Lazy-load datasets once per runtime
function ensureDatasetsLoaded(baseDir) {
  if (!USDA_FOODS.length) {
    try {
      const { loadSimplifiedUsdaFoods } = require('../utils/usda');
      USDA_FOODS = loadSimplifiedUsdaFoods(baseDir);
    } catch (e) {
      // ignore if utility not available in serverless
      USDA_FOODS = [];
    }
  }
  if (!LOCAL_FOODS.length) {
    try {
      const p = path.join(baseDir, 'data', 'local-foods.json');
      if (fs.existsSync(p)) {
        LOCAL_FOODS = JSON.parse(fs.readFileSync(p, 'utf-8'));
      }
    } catch {
      LOCAL_FOODS = [];
    }
  }
}

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

    // Ensure datasets are loaded
    const baseDir = path.join(__dirname, '..');
    ensureDatasetsLoaded(baseDir);

    const q = query.toLowerCase();
    const fromUsda = (USDA_FOODS || [])
      .filter(f => typeof f.name === 'string' && f.name.toLowerCase().includes(q))
      .slice(0, 20)
      .map(f => ({
        name: f.name,
        calories: Number(f.calories) || 0,
        protein: Number(f.protein) || 0,
        carbs: Number(f.carbs) || 0,
        fats: Number(f.fats) || 0,
        category: f.category || 'General',
        source: 'usda'
      }));

    const fromLocal = (LOCAL_FOODS || [])
      .filter(f => typeof f.name === 'string' && f.name.toLowerCase().includes(q))
      .slice(0, 20)
      .map(f => ({
        name: f.name,
        calories: Number(f.calories) || 0,
        protein: Number(f.protein) || 0,
        carbs: Number(f.carbs) || 0,
        fats: Number(f.fats) || 0,
        category: f.category || 'general',
        source: 'local'
      }));

    // Merge and dedupe by normalized name
    const combined = [...fromUsda, ...fromLocal];
    const seen = new Set();
    const unique = [];
    for (const f of combined) {
      const key = (f.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(f);
      }
    }

    return res.status(200).json(unique.slice(0, 25));

  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
};
