const mongoose = require('mongoose');

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

// Daily Log Schemas
const foodEntrySchema = new mongoose.Schema({
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true },
    weight: { type: Number, default: 100 },
    timestamp: { type: Date, default: Date.now }
});

const dailyLogSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true },
    goals: {
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

const DailyLog = mongoose.models.DailyLog || mongoose.model('DailyLog', dailyLogSchema);

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        // Connect to MongoDB
        await connectToDatabase();
        
        const today = new Date().toISOString().split('T')[0];
        const { entryId } = req.query;
        
        const dailyLog = await DailyLog.findOne({ date: today });
        
        if (!dailyLog) {
            return res.status(404).json({ error: 'Daily log not found' });
        }
        
        // Find the food entry to remove
        const foodEntry = dailyLog.foodEntries.id(entryId);
        if (!foodEntry) {
            return res.status(404).json({ error: 'Food entry not found' });
        }
        
        // Update consumed totals
        dailyLog.consumed.calories -= foodEntry.calories;
        dailyLog.consumed.protein -= foodEntry.protein;
        dailyLog.consumed.carbs -= foodEntry.carbs;
        dailyLog.consumed.fats -= foodEntry.fats;
        
        // Remove the entry
        dailyLog.foodEntries.pull(entryId);
        
        await dailyLog.save();
        res.json({ success: true, data: dailyLog });
    } catch (error) {
        console.error('Error removing food:', error);
        res.status(500).json({ error: 'Failed to remove food' });
    }
}
