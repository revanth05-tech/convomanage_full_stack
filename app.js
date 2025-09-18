require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const flash = require('connect-flash');
const User = require('./models/user');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// MongoDB connection configuration
const mongoConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  autoIndex: true,
  maxPoolSize: 10
};

// MongoDB connection with error handling
mongoose.connect(process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/convomanage', mongoConfig)
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// MongoDB connection error handling
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Enable mongoose debug mode in development
if (app.get('env') === 'development') {
  mongoose.set('debug', true);
}

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie-secret'));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/convomanage',
    touchAfter: 24 * 3600,
    crypto: {
      secret: process.env.CRYPTO_SECRET || 'crypto-secret'
    },
    autoRemove: 'native',
    ttl: 24 * 60 * 60 // = 1 day
  }),
  name: 'sessionId', // Don't use default connect.sid
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    sameSite: 'lax'
  }
};

// Use secure cookies in production
if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sessionConfig.cookie.secure = true;
}

app.use(session(sessionConfig));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash messages
app.use(flash());

// Global variables and custom middleware
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.currentPath = req.path;
  // Add CSRF token to all views
  res.locals.csrfToken = req.csrfToken?.() || '';
  next();
});

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// 404 handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;