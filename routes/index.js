const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Attendee = require('../models/attendee');
const Speaker = require('../models/speaker');
const Session = require('../models/session');
const Conference = require('../models/conference');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Please log in to view that resource');
  res.redirect('/login');
}

// Multer setup for profile image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'public', 'images', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.user._id + '-' + Date.now() + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Serve uploads folder as static
router.use('/images/uploads', express.static(path.join(__dirname, '..', 'public', 'images', 'uploads')));

// GET home page
router.get('/', (req, res) => {
  res.render('index', { title: 'Welcome', page: 'home' });
});

// GET register page
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register', page: 'register' });
});

// POST register handle
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = new User({ name, email });
    await User.register(user, password);
    passport.authenticate('local')(req, res, function () {
      req.flash('success', 'Registration successful! Welcome.');
      res.redirect('/dashboard');
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/register');
  }
});

// GET login page
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login', page: 'login' });
});

// POST login handle
router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true
}));

// GET dashboard page
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    const totalAttendees = await Attendee.countDocuments({});
    const totalSpeakers = await Speaker.countDocuments({});
    const totalSessions = await Session.countDocuments({});
    const totalConferences = await Conference.countDocuments({});

    res.render('dashboard', { 
      currentUser: req.user,
      totalAttendees,
      totalSpeakers,
      totalSessions,
      totalConferences,
      page: 'dashboard'
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading dashboard');
    res.redirect('/');
  }
});

// GET profile page
router.get('/profile', ensureAuthenticated, (req, res) => {
  res.render('profile', { title: 'Profile', page: 'profile', user: req.user });
});

// POST profile image upload
router.post('/upload-profile', ensureAuthenticated, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      req.flash('error', 'Please select an image to upload');
      return res.redirect('/profile');
    }
    req.user.profileImage = req.file.filename;
    await req.user.save();
    req.flash('success', 'Profile image updated!');
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to upload image');
    res.redirect('/profile');
  }
});

// GET logout handle
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success', 'You are logged out');
    res.redirect('/login');
  });
});

module.exports = router;
