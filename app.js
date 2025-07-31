// CalorieTracker App - Main JavaScript File
class CalorieTracker {
    constructor() {
        this.dailyGoals = {
            calories: 2000,
            protein: 150,
            carbs: 250,
            fats: 65
        };
        
        this.consumed = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0
        };
        
        this.foodLog = [];
        this.isConnectedToMongoDB = false;
        
        this.init();
    }
    
    init() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.updateDisplay();
        this.animateOnLoad();
        this.connectToMongoDB();
    }
    
    // MongoDB Connection Simulation (Replace with actual MongoDB connection)
    async connectToMongoDB() {
        try {
            // Simulate MongoDB connection
            console.log('Connecting to MongoDB...');
            await this.delay(1000);
            this.isConnectedToMongoDB = true;
            console.log('Connected to MongoDB successfully');
            this.showNotification('Connected to database', 'success');
        } catch (error) {
            console.error('MongoDB connection failed:', error);
            this.showNotification('Database connection failed - using local storage', 'info');
        }
    }
    
    // Setup all event listeners
    setupEventListeners() {
        // Add food button
        document.getElementById('addFoodBtn').addEventListener('click', () => this.addFood());
        
        // Settings modal
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('closeSettingsBtn').addEventListener('click', () => this.closeSettings());
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());
        document.getElementById('cancelSettingsBtn').addEventListener('click', () => this.closeSettings());
        
        // Clear log
        document.getElementById('clearLogBtn').addEventListener('click', () => this.clearLog());
        
        // Enter key support for food search
        document.getElementById('foodSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchFood();
        });
        
        // Search button
        document.getElementById('searchBtn').addEventListener('click', () => this.searchFood());
        
        // Close modal on backdrop click
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') this.closeSettings();
        });
        
        // Input validation and auto-calculation
        const inputs = ['calories', 'protein', 'carbs', 'fats'];
        inputs.forEach(input => {
            document.getElementById(input).addEventListener('input', () => this.validateInput(input));
        });
        
        // Quantity change updates totals
        document.getElementById('quantity').addEventListener('input', () => this.updateFoodTotals());
    }
    
    // Animate elements on page load
    animateOnLoad() {
        // Stagger animation for cards
        const cards = document.querySelectorAll('.animate-slide-up');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        // Animate progress bars
        setTimeout(() => this.animateProgressBars(), 500);
    }
    
    // Add food to the log
    addFood() {
        const foodName = document.getElementById('foodName').value.trim();
        const calories = parseFloat(document.getElementById('calories').value) || 0;
        const protein = parseFloat(document.getElementById('protein').value) || 0;
        const carbs = parseFloat(document.getElementById('carbs').value) || 0;
        const fats = parseFloat(document.getElementById('fats').value) || 0;
        const quantity = parseFloat(document.getElementById('quantity').value) || 1;
        
        if (!foodName) {
            this.showNotification('Please enter a food name', 'error');
            return;
        }
        
        if (calories === 0 && protein === 0 && carbs === 0 && fats === 0) {
            this.showNotification('Please enter at least one nutritional value', 'error');
            return;
        }
        
        const foodItem = {
            id: Date.now(),
            name: foodName,
            calories: calories * quantity,
            protein: protein * quantity,
            carbs: carbs * quantity,
            fats: fats * quantity,
            quantity: quantity,
            timestamp: new Date().toISOString()
        };
        
        this.foodLog.push(foodItem);
        this.consumed.calories += foodItem.calories;
        this.consumed.protein += foodItem.protein;
        this.consumed.carbs += foodItem.carbs;
        this.consumed.fats += foodItem.fats;
        
        this.updateDisplay();
        this.clearInputs();
        this.saveToStorage();
        this.animateFoodItem(foodItem);
        
        this.showNotification(`Added ${foodName} to your log!`, 'success');
    }
    
    // Search for food (API integration placeholder)
    async searchFood() {
        const query = document.getElementById('foodSearch').value.trim();
        if (!query) return;
        
        // Show loading state
        const searchBtn = document.getElementById('searchBtn');
        const originalHTML = searchBtn.innerHTML;
        searchBtn.innerHTML = '<div class="loading-spinner"></div>';
        searchBtn.disabled = true;
        
        try {
            // Simulate API call delay
            await this.delay(1000);
            
            // Mock food database
            const mockFoods = [
                { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6 },
                { name: 'Brown Rice', calories: 112, protein: 2.6, carbs: 22, fats: 0.9 },
                { name: 'Broccoli', calories: 25, protein: 3, carbs: 5, fats: 0.3 },
                { name: 'Salmon', calories: 208, protein: 22, carbs: 0, fats: 12 },
                { name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fats: 0.1 },
                { name: 'Greek Yogurt', calories: 100, protein: 10, carbs: 6, fats: 0.4 },
                { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fats: 50 },
                { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fats: 0.3 }
            ];
            
            const results = mockFoods.filter(food => 
                food.name.toLowerCase().includes(query.toLowerCase())
            );
            
            if (results.length > 0) {
                const selectedFood = results[0]; // Use first result
                this.populateInputs(selectedFood);
                this.showNotification(`Found ${selectedFood.name}!`, 'success');
            } else {
                this.showNotification('No food found. Try a different search term.', 'info');
            }
            
        } catch (error) {
            this.showNotification('Search failed. Please try again.', 'error');
        } finally {
            searchBtn.innerHTML = originalHTML;
            searchBtn.disabled = false;
        }
    }
    
    // Populate inputs with food data
    populateInputs(food) {
        document.getElementById('foodName').value = food.name;
        document.getElementById('calories').value = food.calories;
        document.getElementById('protein').value = food.protein;
        document.getElementById('carbs').value = food.carbs;
        document.getElementById('fats').value = food.fats;
        document.getElementById('quantity').value = 1;
        
        // Animate input fields
        const inputs = document.querySelectorAll('#foodName, #calories, #protein, #carbs, #fats');
        inputs.forEach((input, index) => {
            setTimeout(() => {
                input.style.transform = 'scale(1.05)';
                setTimeout(() => input.style.transform = 'scale(1)', 200);
            }, index * 50);
        });
    }
    
    // Update food totals based on quantity
    updateFoodTotals() {
        const quantity = parseFloat(document.getElementById('quantity').value) || 1;
        const baseCalories = parseFloat(document.getElementById('calories').getAttribute('data-base')) || 
                           parseFloat(document.getElementById('calories').value) || 0;
        const baseProtein = parseFloat(document.getElementById('protein').getAttribute('data-base')) || 
                          parseFloat(document.getElementById('protein').value) || 0;
        const baseCarbs = parseFloat(document.getElementById('carbs').getAttribute('data-base')) || 
                        parseFloat(document.getElementById('carbs').value) || 0;
        const baseFats = parseFloat(document.getElementById('fats').getAttribute('data-base')) || 
                       parseFloat(document.getElementById('fats').value) || 0;
        
        // Store base values if not already stored
        if (!document.getElementById('calories').getAttribute('data-base')) {
            document.getElementById('calories').setAttribute('data-base', baseCalories);
            document.getElementById('protein').setAttribute('data-base', baseProtein);
            document.getElementById('carbs').setAttribute('data-base', baseCarbs);
            document.getElementById('fats').setAttribute('data-base', baseFats);
        }
        
        // Update values
        document.getElementById('calories').value = (baseCalories * quantity).toFixed(0);
        document.getElementById('protein').value = (baseProtein * quantity).toFixed(1);
        document.getElementById('carbs').value = (baseCarbs * quantity).toFixed(1);
        document.getElementById('fats').value = (baseFats * quantity).toFixed(1);
    }
    
    // Remove food item from log
    removeFood(id) {
        const foodIndex = this.foodLog.findIndex(item => item.id === id);
        if (foodIndex === -1) return;
        
        const food = this.foodLog[foodIndex];
        
        // Animate removal
        const element = document.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.style.transform = 'translateX(-100%)';
            element.style.opacity = '0';
            setTimeout(() => element.remove(), 300);
        }
        
        // Update consumed values
        this.consumed.calories -= food.calories;
        this.consumed.protein -= food.protein;
        this.consumed.carbs -= food.carbs;
        this.consumed.fats -= food.fats;
        
        // Remove from log
        this.foodLog.splice(foodIndex, 1);
        
        this.updateDisplay();
        this.saveToStorage();
        this.showNotification('Food item removed', 'info');
    }
    
    // Clear all food log
    clearLog() {
        if (this.foodLog.length === 0) {
            this.showNotification('Food log is already empty', 'info');
            return;
        }
        
        if (confirm('Are you sure you want to clear your entire food log?')) {
            this.foodLog = [];
            this.consumed = { calories: 0, protein: 0, carbs: 0, fats: 0 };
            this.updateDisplay();
            this.saveToStorage();
            this.showNotification('Food log cleared', 'success');
        }
    }
    
    // Update all display elements
    updateDisplay() {
        this.updateMacroCards();
        this.updateFoodLog();
        this.updateSummaryChart();
        this.animateProgressBars();
    }
    
    // Update macro progress cards
    updateMacroCards() {
        // Calories
        document.getElementById('caloriesConsumed').textContent = Math.round(this.consumed.calories);
        document.getElementById('caloriesGoal').textContent = this.dailyGoals.calories;
        document.getElementById('caloriesRemaining').textContent = Math.max(0, this.dailyGoals.calories - this.consumed.calories);
        
        // Protein
        document.getElementById('proteinConsumed').textContent = this.consumed.protein.toFixed(1) + 'g';
        document.getElementById('proteinGoal').textContent = this.dailyGoals.protein + 'g';
        document.getElementById('proteinRemaining').textContent = Math.max(0, this.dailyGoals.protein - this.consumed.protein).toFixed(1) + 'g';
        
        // Carbs
        document.getElementById('carbsConsumed').textContent = this.consumed.carbs.toFixed(1) + 'g';
        document.getElementById('carbsGoal').textContent = this.dailyGoals.carbs + 'g';
        document.getElementById('carbsRemaining').textContent = Math.max(0, this.dailyGoals.carbs - this.consumed.carbs).toFixed(1) + 'g';
        
        // Fats
        document.getElementById('fatsConsumed').textContent = this.consumed.fats.toFixed(1) + 'g';
        document.getElementById('fatsGoal').textContent = this.dailyGoals.fats + 'g';
        document.getElementById('fatsRemaining').textContent = Math.max(0, this.dailyGoals.fats - this.consumed.fats).toFixed(1) + 'g';
    }
    
    // Animate progress bars
    animateProgressBars() {
        // Calories progress
        const caloriesPercent = Math.min((this.consumed.calories / this.dailyGoals.calories) * 100, 100);
        document.getElementById('caloriesProgress').style.width = caloriesPercent + '%';
        
        // Protein progress
        const proteinPercent = Math.min((this.consumed.protein / this.dailyGoals.protein) * 100, 100);
        document.getElementById('proteinProgress').style.width = proteinPercent + '%';
        
        // Carbs progress
        const carbsPercent = Math.min((this.consumed.carbs / this.dailyGoals.carbs) * 100, 100);
        document.getElementById('carbsProgress').style.width = carbsPercent + '%';
        
        // Fats progress
        const fatsPercent = Math.min((this.consumed.fats / this.dailyGoals.fats) * 100, 100);
        document.getElementById('fatsProgress').style.width = fatsPercent + '%';
    }
    
    // Update food log display
    updateFoodLog() {
        const foodLogContainer = document.getElementById('foodLog');
        const emptyState = document.getElementById('emptyState');
        
        if (this.foodLog.length === 0) {
            foodLogContainer.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        foodLogContainer.innerHTML = this.foodLog.map(food => `
            <div class="food-item bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300" data-id="${food.id}">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <h4 class="font-semibold text-lg">${food.name}</h4>
                        <div class="flex items-center space-x-6 text-sm text-gray-300 mt-2">
                            <span class="flex items-center">
                                <i class="fas fa-fire text-orange-400 mr-1"></i>
                                ${Math.round(food.calories)} kcal
                            </span>
                            <span class="flex items-center">
                                <i class="fas fa-dumbbell text-blue-400 mr-1"></i>
                                ${food.protein.toFixed(1)}g protein
                            </span>
                            <span class="flex items-center">
                                <i class="fas fa-leaf text-green-400 mr-1"></i>
                                ${food.carbs.toFixed(1)}g carbs
                            </span>
                            <span class="flex items-center">
                                <i class="fas fa-tint text-yellow-400 mr-1"></i>
                                ${food.fats.toFixed(1)}g fats
                            </span>
                        </div>
                        <p class="text-xs text-gray-400 mt-1">
                            Quantity: ${food.quantity} • ${new Date(food.timestamp).toLocaleTimeString()}
                        </p>
                    </div>
                    <button onclick="app.removeFood(${food.id})" class="ml-4 p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Update summary chart
    updateSummaryChart() {
        const totalCalories = this.consumed.calories;
        document.getElementById('totalCalories').textContent = Math.round(totalCalories);
        
        // Calculate percentages
        const proteinCalories = this.consumed.protein * 4;
        const carbsCalories = this.consumed.carbs * 4;
        const fatsCalories = this.consumed.fats * 9;
        
        const total = proteinCalories + carbsCalories + fatsCalories;
        
        if (total > 0) {
            const proteinPercent = (proteinCalories / total * 100).toFixed(0);
            const carbsPercent = (carbsCalories / total * 100).toFixed(0);
            const fatsPercent = (fatsCalories / total * 100).toFixed(0);
            
            document.getElementById('proteinPercent').textContent = proteinPercent + '%';
            document.getElementById('carbsPercent').textContent = carbsPercent + '%';
            document.getElementById('fatsPercent').textContent = fatsPercent + '%';
            
            // Update ring chart (simplified version)
            this.updateRingChart(proteinPercent, carbsPercent, fatsPercent);
        } else {
            document.getElementById('proteinPercent').textContent = '0%';
            document.getElementById('carbsPercent').textContent = '0%';
            document.getElementById('fatsPercent').textContent = '0%';
        }
    }
    
    // Update ring chart visualization
    updateRingChart(proteinPercent, carbsPercent, fatsPercent) {
        const circumference = 2 * Math.PI * 40; // radius = 40
        
        // Calculate dash offsets for each macro
        const proteinOffset = circumference - (proteinPercent / 100 * circumference);
        const carbsOffset = circumference - (carbsPercent / 100 * circumference);
        const fatsOffset = circumference - (fatsPercent / 100 * circumference);
        
        // Update circles with animation
        setTimeout(() => {
            document.getElementById('proteinArc').style.strokeDashoffset = proteinOffset;
            document.getElementById('carbsArc').style.strokeDashoffset = carbsOffset;
            document.getElementById('fatsArc').style.strokeDashoffset = fatsOffset;
        }, 100);
    }
    
    // Animate new food item
    animateFoodItem(foodItem) {
        setTimeout(() => {
            const element = document.querySelector(`[data-id="${foodItem.id}"]`);
            if (element) {
                element.classList.add('animate-bounce-in');
                setTimeout(() => element.classList.remove('animate-bounce-in'), 800);
            }
        }, 100);
    }
    
    // Settings modal functions
    openSettings() {
        const modal = document.getElementById('settingsModal');
        
        // Populate current values
        document.getElementById('caloriesGoalInput').value = this.dailyGoals.calories;
        document.getElementById('proteinGoalInput').value = this.dailyGoals.protein;
        document.getElementById('carbsGoalInput').value = this.dailyGoals.carbs;
        document.getElementById('fatsGoalInput').value = this.dailyGoals.fats;
        
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.querySelector('.transform').classList.remove('scale-95');
        }, 10);
    }
    
    closeSettings() {
        const modal = document.getElementById('settingsModal');
        modal.classList.add('opacity-0');
        modal.querySelector('.transform').classList.add('scale-95');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
    
    saveSettings() {
        const newGoals = {
            calories: parseInt(document.getElementById('caloriesGoalInput').value) || 2000,
            protein: parseInt(document.getElementById('proteinGoalInput').value) || 150,
            carbs: parseInt(document.getElementById('carbsGoalInput').value) || 250,
            fats: parseInt(document.getElementById('fatsGoalInput').value) || 65
        };
        
        this.dailyGoals = newGoals;
        this.updateDisplay();
        this.saveToStorage();
        this.closeSettings();
        this.showNotification('Daily goals updated successfully!', 'success');
    }
    
    // Clear input fields
    clearInputs() {
        document.getElementById('foodName').value = '';
        document.getElementById('calories').value = '';
        document.getElementById('protein').value = '';
        document.getElementById('carbs').value = '';
        document.getElementById('fats').value = '';
        document.getElementById('quantity').value = '1';
        document.getElementById('foodSearch').value = '';
        
        // Clear data-base attributes
        ['calories', 'protein', 'carbs', 'fats'].forEach(id => {
            document.getElementById(id).removeAttribute('data-base');
        });
    }
    
    // Input validation
    validateInput(inputId) {
        const input = document.getElementById(inputId);
        const value = parseFloat(input.value);
        
        if (value < 0) {
            input.value = 0;
        }
        
        // Add visual feedback for valid input
        input.style.borderColor = value >= 0 ? '#10B981' : '#EF4444';
        setTimeout(() => input.style.borderColor = '', 1000);
    }
    
    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="flex items-center">
                ${type === 'success' ? '<i class="fas fa-check-circle mr-2"></i>' : 
                  type === 'error' ? '<i class="fas fa-exclamation-circle mr-2"></i>' : 
                  '<i class="fas fa-info-circle mr-2"></i>'}
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Local storage functions
    saveToStorage() {
        const data = {
            dailyGoals: this.dailyGoals,
            consumed: this.consumed,
            foodLog: this.foodLog,
            timestamp: new Date().toDateString()
        };
        
        localStorage.setItem('calorieTracker', JSON.stringify(data));
        
        // If connected to MongoDB, also save there
        if (this.isConnectedToMongoDB) {
            this.saveToMongoDB(data);
        }
    }
    
    loadFromLocalStorage() {
        const saved = localStorage.getItem('calorieTracker');
        if (!saved) return;
        
        try {
            const data = JSON.parse(saved);
            
            // Check if data is from today
            if (data.timestamp === new Date().toDateString()) {
                this.dailyGoals = data.dailyGoals || this.dailyGoals;
                this.consumed = data.consumed || this.consumed;
                this.foodLog = data.foodLog || this.foodLog;
            } else {
                // New day, reset consumed and food log but keep goals
                this.dailyGoals = data.dailyGoals || this.dailyGoals;
                this.consumed = { calories: 0, protein: 0, carbs: 0, fats: 0 };
                this.foodLog = [];
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }
    
    // MongoDB operations (placeholder - implement with actual MongoDB connection)
    async saveToMongoDB(data) {
        try {
            // Placeholder for MongoDB save operation
            console.log('Saving to MongoDB:', data);
            // await fetch('/api/save-data', { method: 'POST', body: JSON.stringify(data) });
        } catch (error) {
            console.error('MongoDB save error:', error);
        }
    }
    
    // Utility function for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CalorieTracker();
});

// Service Worker registration for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
