var express = require('express');
var router = express.Router();

// ✅ Import models
const User = require('./users');
const post = require('./post');

// ✅ Import passport (you forgot this)
const passport = require('passport');

/* --------------------------
   ROUTES
---------------------------*/

// Home Page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Register Page (GET)
router.get('/register', (req, res, next) => {
  res.render('register', { title: 'Register' });
});

// Register Handle (POST)
router.post('/register', (req, res, next) => {
  const data = new User({
    username: req.body.username, // Using passport-local-mongoose username field
  });

  // ✅ Use User.register from passport-local-mongoose
  User.register(data, req.body.password)
    .then(() => {
      // ✅ Fixed spelling: authenticate (not authencticate)
      passport.authenticate('local')(req, res, () => {
        // Redirect to dashboard after successful register + login
        res.redirect('/dashboard');
      });
    })
    .catch(err => {
      console.log(err);
      res.redirect('/register');
    });
});

// Login Page (GET)
router.get('/login', (req, res, next) => {
  res.render('login', { title: 'Login' });
});

// Login Handle (POST)
router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',  // redirect if success
    failureRedirect: '/login'       // redirect if fail
  })
);

// Dashboard Page (GET) ✅ Changed from POST → GET
router.get('/dashboard', (req, res, next) => {
  res.render('dashboard', { title: 'Dashboard' });
});

module.exports = router;
