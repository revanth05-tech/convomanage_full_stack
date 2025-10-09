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

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'Please log in to view that resource');
  res.redirect('/login');
}

function isLoggedIn(req, res, next) {
  return next();
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'public', 'images', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.user._id + '-' + Date.now() + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed!'), false);
};

const upload = multer({ storage, fileFilter });

router.use('/images/uploads', express.static(path.join(__dirname, '..', 'public', 'images', 'uploads')));

router.get('/', (req, res) => {
  res.render('index', { title: 'Welcome', page: 'home', user: req.user || null });
});

router.get('/register', isLoggedIn, (req, res) => {
  if (req.isAuthenticated()) {
    return res.render('register', { 
      title: 'Register', 
      page: 'register',
      message: 'You are already registered and logged in!'
    });
  }
  res.render('register', { title: 'Register', page: 'register' });
});

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

router.get('/login', isLoggedIn, (req, res) => {
  if (req.isAuthenticated()) {
    return res.render('login', { 
      title: 'Login', 
      page: 'login',
      message: 'You are already logged in!' 
    });
  }
  res.render('login', { title: 'Login', page: 'login' });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    const totalAttendees = await Attendee.countDocuments({});
    const totalSpeakers = await Speaker.countDocuments({});
    const totalSessions = await Session.countDocuments({});
    const totalConferences = await Conference.countDocuments({});

    const conferences = await Conference.find();
    const attendees = await Attendee.find({}).populate('conference');

    res.render('dashboard', { 
      currentUser: req.user,
      totalAttendees,
      totalSpeakers,
      totalSessions,
      totalConferences,
      conferences,
      attendees,
      page: 'dashboard'
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading dashboard');
    res.redirect('/');
  }
});

router.get('/profile', ensureAuthenticated, (req, res) => {
  res.render('profile', { title: 'Profile', page: 'profile', user: req.user });
});

router.get('/profile', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch related data for this user
    const userConferences = await Conference.find({ createdBy: userId });
    const userSpeakers = await Speaker.find({ createdBy: userId });
    const userAttendees = await Attendee.find({ createdBy: userId });

    res.render('profile', {
      title: 'Profile',
      page: 'profile',
      user: req.user,
      conferences: userConferences,
      speakers: userSpeakers,
      attendees: userAttendees
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading your profile data');
    res.redirect('/dashboard');
  }
});

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

router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);
    req.flash('success', 'You are logged out');
    res.redirect('/login');
  });
});

module.exports = router;
