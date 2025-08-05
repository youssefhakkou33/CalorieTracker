# 🥗 CalorieTracker - Modern Nutrition Tracking App

A sleek, modern calorie and macro tracker with MongoDB integration and USDA food database access.

## ✨ Features

- **Real-time Food Search**: Search from 380,000+ foods using USDA API + local database
- **Automatic Search**: Type to search - no clicking required
- **Weight-based Tracking**: Precise gram measurements for accurate nutrition
- **MongoDB Integration**: Cloud database storage for your daily logs
- **Glass Morphism UI**: Beautiful, modern interface with smooth animations
- **Responsive Design**: Works perfectly on desktop and mobile

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Production)

This app is optimized for Vercel deployment with serverless functions:

1. **Fork/Clone this repository**
2. **Set up environment variables** in Vercel dashboard:
   ```
   MONGODB_URI=your_mongodb_connection_string
   USDA_API_KEY=your_usda_api_key
   ```
3. **Deploy to Vercel**: Connect your GitHub repo to Vercel
4. **Done!** Your app will be live with full functionality

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed instructions.

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/youssefhakkou33/CalorieTracker.git
cd CalorieTracker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and USDA API key

# Seed the database (optional)
npm run seed

# Start the server
npm start
```

Visit `http://localhost:3000` to use the app.

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Tailwind CSS, Vanilla JavaScript
- **Backend**: Node.js, Express.js (local) / Vercel Serverless Functions (production)
- **Database**: MongoDB Atlas
- **API**: USDA FoodData Central API
- **Deployment**: Vercel

## 📱 How to Use

1. **Search for Food**: Start typing any food name - results appear automatically
2. **Select Food**: Click on any search result to populate nutrition fields
3. **Adjust Weight**: Change the weight (in grams) to match your serving
4. **Add to Log**: Click "Add Food" to track your consumption
5. **Monitor Progress**: View your daily macro progress in real-time

## 🎯 Key Features Explained

### Smart Search System
- **Local Database**: 101 common foods for instant results
- **USDA Integration**: 380,000+ foods with official nutrition data
- **Auto-complete**: Real-time search as you type
- **Duplicate Detection**: Smart filtering of similar foods

### Precise Tracking
- **Weight-based**: Enter nutrition per 100g, specify actual weight
- **Real-time Calculation**: Values update automatically as you adjust weight
- **Macro Breakdown**: Track calories, protein, carbs, and fats
- **Visual Progress**: Progress bars and percentage breakdowns

### Modern Interface
- **Glass Morphism**: Beautiful translucent design elements
- **Smooth Animations**: Engaging micro-interactions
- **Responsive**: Works on all devices and screen sizes
- **Dark Theme**: Eye-friendly interface for any time of day

## 🔑 Environment Variables

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/calorietracker
USDA_API_KEY=your_usda_api_key_here
```

## 📦 Project Structure

```
CalorieTracker/
├── api/                    # Vercel serverless functions
│   ├── search-food.js     # Food search endpoint
│   ├── daily-log.js       # Daily log management
│   └── add-food.js        # Add food to log
├── scripts/               # Database scripts
│   └── seedDatabase.js    # Seed local food database
├── index.html            # Main application
├── app.js               # Frontend logic
├── styles.css           # Custom styles
├── server.js            # Local development server
├── vercel.json          # Vercel configuration
└── package.json         # Dependencies

```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **USDA FoodData Central** for providing comprehensive nutrition data
- **MongoDB Atlas** for cloud database hosting
- **Vercel** for seamless deployment platform

---

**Live Demo**: [Deploy your own instance on Vercel](https://vercel.com/new/clone?repository-url=https://github.com/youssefhakkou33/CalorieTracker)

Built with ❤️ for better nutrition tracking

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/CalorieTracker.git
   cd CalorieTracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/calorietracker
   PORT=3000
   ```

4. **Start the application**
   ```bash
   # For development (with auto-restart)
   npm run dev
   
   # For production
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 Usage

### Adding Food
1. Use the search bar to find common foods
2. Or manually enter food details (name, calories, macros)
3. Adjust quantity as needed
4. Click "Add Food" to log the entry

### Setting Goals
1. Click the settings icon in the top-right
2. Enter your daily calorie and macro goals
3. Save to update your targets

### Tracking Progress
- View real-time progress bars for all macros
- Check the summary ring chart for macro distribution
- Monitor daily food log with detailed breakdowns

## 🛠️ Technical Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom animations and transitions
- **Tailwind CSS**: Utility-first styling
- **JavaScript ES6+**: Modern vanilla JavaScript
- **Font Awesome**: Icons

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB

### Features
- **Responsive Design**: Mobile-first approach
- **Progressive Web App**: Service worker ready
- **Glass Morphism**: Modern UI design trend
- **Smooth Animations**: CSS keyframes and transitions
- **Local Storage**: Offline functionality

## 🎨 Design Features

### Animations
- **Fade In**: Elements appear smoothly on load
- **Slide Up**: Cards animate upward on appearance
- **Bounce In**: Food items bounce in when added
- **Progress Bars**: Smooth width transitions
- **Hover Effects**: Interactive element responses

### Visual Elements
- **Gradient Backgrounds**: Dynamic color schemes
- **Glass Morphism**: Frosted glass effect cards
- **Ring Charts**: Animated SVG progress rings
- **Notifications**: Toast-style feedback messages
- **Modal Dialogs**: Smooth overlay interactions

## 📊 API Endpoints

### Daily Log
- `GET /api/daily-log` - Get today's nutrition log
- `POST /api/daily-log` - Save/update daily log
- `POST /api/add-food` - Add food entry
- `DELETE /api/remove-food/:entryId` - Remove food entry

### Food Database
- `GET /api/search-food?query=food` - Search foods
- `POST /api/food-database` - Add new food to database

### Analytics
- `GET /api/weekly-summary` - Get weekly nutrition summary
- `PUT /api/daily-goals` - Update daily goals

## 🔧 Configuration

### MongoDB Setup
1. **Local MongoDB**: Install MongoDB locally
   ```bash
   # macOS with Homebrew
   brew install mongodb-community
   brew services start mongodb/brew/mongodb-community
   ```

2. **MongoDB Atlas**: Create free cluster at [mongodb.com](https://mongodb.com)
   - Get connection string
   - Update `.env` file

### Environment Variables
```bash
MONGODB_URI=mongodb://localhost:27017/calorietracker  # Database URL
PORT=3000                                             # Server port
```

## 📁 Project Structure

```
CalorieTracker/
├── index.html          # Main HTML file
├── app.js             # Frontend JavaScript
├── styles.css         # Custom CSS styles
├── server.js          # Express.js server
├── package.json       # Dependencies
├── .env.example       # Environment template
├── README.md          # Documentation
└── scripts/           # Utility scripts
    └── seedDatabase.js # Database seeding
```

## 🎯 Roadmap

### Planned Features
- [ ] User authentication system
- [ ] Meal planning functionality
- [ ] Barcode scanning for foods
- [ ] Recipe calculator
- [ ] Export data to CSV/PDF
- [ ] Social sharing features
- [ ] Weekly/monthly analytics
- [ ] Custom food categories
- [ ] Meal templates
- [ ] Integration with fitness trackers

### Technical Improvements
- [ ] Unit tests
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Performance monitoring
- [ ] Caching strategy
- [ ] API rate limiting
- [ ] Data backup system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tailwind CSS** for the utility-first CSS framework
- **Font Awesome** for the beautiful icons
- **MongoDB** for the flexible database solution
- **Express.js** for the lightweight web framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/CalorieTracker/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

---

**Built with ❤️ for a healthier lifestyle**