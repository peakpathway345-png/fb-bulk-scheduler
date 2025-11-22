require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('./config/passport');
const { startPublisher } = require('./workers/publisher');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fb-bulk-scheduler-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/posts', require('./routes/posts'));

// Home route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.sendFile(__dirname + '/public/dashboard.html');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Facebook Bulk Scheduler'
  });
});

// Start background publisher
startPublisher();

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Facebook Bulk Scheduler - Server Running ║
║   Port: ${PORT}                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}               ║
║   Background Publisher: Active              ║
╚════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});
