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
const attendeesRouter = require('./routes/attendees');
const conferencesRouter = require('./routes/conferences');

const app = express();

// -------------------- MongoDB Connection --------------------
mongoose.connect(process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/convomanage', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  autoIndex: true,
  maxPoolSize: 10
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});

// -------------------- View Engine --------------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// -------------------- Middleware --------------------
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie-secret'));
app.use(express.static(path.join(__dirname, 'public')));

// -------------------- Session --------------------
app.use(session({
  secret: process.env.SESSION_SECRET || 'session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/convomanage',
    touchAfter: 24 * 3600,
    crypto: { secret: process.env.CRYPTO_SECRET || 'crypto-secret' },
    autoRemove: 'native',
    ttl: 24 * 60 * 60
  }),
  name: 'sessionId',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: 'lax'
  }
}));

// -------------------- Passport --------------------
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// -------------------- Flash --------------------
app.use(flash());

// -------------------- Global Variables --------------------
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.currentPath = req.path;
  next();
});

// -------------------- Routes --------------------
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/attendees', attendeesRouter);
app.use('/conferences', conferencesRouter);

// -------------------- 404 Handler --------------------
app.use((req, res, next) => {
  next(createError(404));
});

// -------------------- Error Handler --------------------
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
