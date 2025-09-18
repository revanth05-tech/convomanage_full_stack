// filepath: c:\Users\osait\Desktop\convomanage\routes\index.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Please log in to view that resource');
  res.redirect('/login');
}

// GET home page.
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
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', { 
    title: 'Dashboard', 
    page: 'dashboard',
    user: req.user 
  });
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