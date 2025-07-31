# CalorieTracker - Modern Macro & Calorie Tracking App

A sleek, modern calorie and macro tracking application built with JavaScript, HTML, CSS, Tailwind CSS, and MongoDB. Features beautiful animations, a responsive design, and comprehensive nutrition tracking.

## 🌟 Features

- **Modern UI/UX**: Sleek glass-morphism design with smooth animations
- **Macro Tracking**: Track calories, protein, carbs, and fats
- **Progress Visualization**: Animated progress bars and ring charts
- **Food Database**: Searchable database of common foods
- **Daily Goals**: Customizable daily nutrition targets
- **Real-time Updates**: Instant feedback with smooth animations
- **Responsive Design**: Works perfectly on desktop and mobile
- **MongoDB Integration**: Persistent data storage
- **Local Storage Backup**: Works offline with local storage fallback

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