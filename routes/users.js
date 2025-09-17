const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');

router.post('/register', (req, res, next) => {
  const { name, email, password } = req.body;

  const user = new User({ name, email }); // matches your schema
  User.register(user, password)
    .then(() => {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/dashboard');
      });
    })
    .catch(err => {
      console.log(err);
      res.redirect('/register');
    });
});

module.exports = router;
