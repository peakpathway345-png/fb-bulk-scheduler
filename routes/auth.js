const express = require('express');
const router = express.Router();
const passport = require('../config/passport');

// Facebook OAuth login
router.get('/facebook', passport.authenticate('facebook', {
  scope: ['pages_manage_posts', 'pages_read_engagement', 'pages_manage_metadata', 'pages_show_list']
}));

// Facebook OAuth callback
router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication
    res.redirect('/dashboard');
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.redirect('/');
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        profile_picture: req.user.profile_picture
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;
