const mongoose = require('mongoose');
require('dotenv').config();

const FoodDatabase = require('../models/FoodDatabase');

// Extended food database for seeding
const foods = [
    // Proteins
    { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6, category: 'protein', servingSize: '100g' },
    { name: 'Salmon', calories: 208, protein: 22, carbs: 0, fats: 12, category: 'protein', servingSize: '100g' },
    { name: 'Turkey Breast', calories: 135, protein: 30, carbs: 0, fats: 1, category: 'protein', servingSize: '100g' },
    { name: 'Lean Beef', calories: 250, protein: 26, carbs: 0, fats: 15, category: 'protein', servingSize: '100g' },
    { name: 'Tuna', calories: 132, protein: 28, carbs: 0, fats: 1, category: 'protein', servingSize: '100g' },
    { name: 'Eggs', calories: 155, protein: 13, carbs: 1.1, fats: 11, category: 'protein', servingSize: '100g' },
    { name: 'Greek Yogurt', calories: 100, protein: 10, carbs: 6, fats: 0.4, category: 'dairy', servingSize: '100g' },
    { name: 'Cottage Cheese', calories: 98, protein: 11, carbs: 3.4, fats: 4.3, category: 'dairy', servingSize: '100g' },
    { name: 'Tofu', calories: 76, protein: 8, carbs: 1.9, fats: 4.8, category: 'protein', servingSize: '100g' },
    { name: 'Tempeh', calories: 190, protein: 19, carbs: 9, fats: 11, category: 'protein', servingSize: '100g' },

    // Carbohydrates
    { name: 'Brown Rice', calories: 112, protein: 2.6, carbs: 22, fats: 0.9, category: 'grain', servingSize: '100g' },
    { name: 'White Rice', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, category: 'grain', servingSize: '100g' },
    { name: 'Quinoa', calories: 120, protein: 4.4, carbs: 22, fats: 1.9, category: 'grain', servingSize: '100g' },
    { name: 'Oatmeal', calories: 68, protein: 2.4, carbs: 12, fats: 1.4, category: 'grain', servingSize: '100g' },
    { name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, category: 'vegetable', servingSize: '100g' },
    { name: 'White Potato', calories: 77, protein: 2, carbs: 17, fats: 0.1, category: 'vegetable', servingSize: '100g' },
    { name: 'Pasta', calories: 131, protein: 5, carbs: 25, fats: 1.1, category: 'grain', servingSize: '100g' },
    { name: 'Whole Wheat Bread', calories: 247, protein: 13, carbs: 41, fats: 4.2, category: 'grain', servingSize: '100g' },
    { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, category: 'fruit', servingSize: '100g' },
    { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, category: 'fruit', servingSize: '100g' },

    // Vegetables
    { name: 'Broccoli', calories: 25, protein: 3, carbs: 5, fats: 0.3, category: 'vegetable', servingSize: '100g' },
    { name: 'Spinach', calories: 7, protein: 0.9, carbs: 1.1, fats: 0.1, category: 'vegetable', servingSize: '100g' },
    { name: 'Kale', calories: 35, protein: 2.9, carbs: 4.4, fats: 1.5, category: 'vegetable', servingSize: '100g' },
    { name: 'Carrots', calories: 41, protein: 0.9, carbs: 10, fats: 0.2, category: 'vegetable', servingSize: '100g' },
    { name: 'Bell Pepper', calories: 20, protein: 0.9, carbs: 4.6, fats: 0.2, category: 'vegetable', servingSize: '100g' },
    { name: 'Tomato', calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, category: 'vegetable', servingSize: '100g' },
    { name: 'Cucumber', calories: 15, protein: 0.7, carbs: 3.6, fats: 0.1, category: 'vegetable', servingSize: '100g' },
    { name: 'Lettuce', calories: 5, protein: 0.4, carbs: 1, fats: 0.1, category: 'vegetable', servingSize: '100g' },

    // Fats
    { name: 'Avocado', calories: 160, protein: 2, carbs: 9, fats: 15, category: 'fruit', servingSize: '100g' },
    { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fats: 50, category: 'nuts', servingSize: '100g' },
    { name: 'Walnuts', calories: 654, protein: 15, carbs: 14, fats: 65, category: 'nuts', servingSize: '100g' },
    { name: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fats: 100, category: 'oil', servingSize: '100g' },
    { name: 'Peanut Butter', calories: 588, protein: 25, carbs: 20, fats: 50, category: 'nuts', servingSize: '100g' },
    { name: 'Chia Seeds', calories: 486, protein: 17, carbs: 42, fats: 31, category: 'seeds', servingSize: '100g' },
    { name: 'Flax Seeds', calories: 534, protein: 18, carbs: 29, fats: 42, category: 'seeds', servingSize: '100g' },

    // Dairy
    { name: 'Milk', calories: 42, protein: 3.4, carbs: 5, fats: 1, category: 'dairy', servingSize: '100ml' },
    { name: 'Cheese', calories: 113, protein: 7, carbs: 1, fats: 9, category: 'dairy', servingSize: '100g' },
    { name: 'Yogurt', calories: 59, protein: 10, carbs: 3.6, fats: 0.4, category: 'dairy', servingSize: '100g' },

    // Legumes
    { name: 'Black Beans', calories: 132, protein: 8.9, carbs: 24, fats: 0.5, category: 'legume', servingSize: '100g' },
    { name: 'Chickpeas', calories: 164, protein: 8.9, carbs: 27, fats: 2.6, category: 'legume', servingSize: '100g' },
    { name: 'Lentils', calories: 116, protein: 9, carbs: 20, fats: 0.4, category: 'legume', servingSize: '100g' },

    // Snacks
    { name: 'Dark Chocolate', calories: 546, protein: 7.9, carbs: 46, fats: 31, category: 'snack', servingSize: '100g' },
    { name: 'Popcorn', calories: 375, protein: 12, carbs: 74, fats: 4.5, category: 'snack', servingSize: '100g' },
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/calorietracker', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB');

        // Clear existing data
        await mongoose.connection.db.collection('fooddatabases').deleteMany({});
        console.log('Cleared existing food database');

        // Insert new data
        const FoodDatabase = mongoose.model('FoodDatabase', new mongoose.Schema({
            name: { type: String, required: true, unique: true },
            calories: { type: Number, required: true },
            protein: { type: Number, required: true },
            carbs: { type: Number, required: true },
            fats: { type: Number, required: true },
            category: { type: String, default: 'general' },
            brand: { type: String, default: '' },
            servingSize: { type: String, default: '100g' },
            createdAt: { type: Date, default: Date.now }
        }));

        await FoodDatabase.insertMany(foods);
        console.log(`Inserted ${foods.length} foods into the database`);

        console.log('Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
