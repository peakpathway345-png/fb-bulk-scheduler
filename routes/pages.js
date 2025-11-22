const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../config/database');

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Fetch user's Facebook pages
router.get('/fetch', isAuthenticated, async (req, res) => {
  try {
    const accessToken = req.user.access_token;
    
    // Fetch pages from Facebook API
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/me/accounts`,
      {
        params: {
          access_token: accessToken,
          fields: 'id,name,access_token,category'
        }
      }
    );

    const pages = response.data.data;

    // Save pages to database
    for (const page of pages) {
      await pool.query(
        `INSERT INTO facebook_pages (account_id, page_id, page_name, page_access_token, category)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (page_id) 
         DO UPDATE SET page_name = $3, page_access_token = $4, category = $5, is_active = true`,
        [req.user.id, page.id, page.name, page.access_token, page.category]
      );
    }

    res.json({ success: true, pages });
  } catch (error) {
    console.error('Error fetching pages:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch pages', 
      details: error.response?.data || error.message 
    });
  }
});

// Get saved pages for current user
router.get('/list', isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM facebook_pages WHERE account_id = $1 AND is_active = true`,
      [req.user.id]
    );
    res.json({ pages: result.rows });
  } catch (error) {
    console.error('Error listing pages:', error);
    res.status(500).json({ error: 'Failed to list pages' });
  }
});

// Toggle page active status
router.post('/toggle/:pageId', isAuthenticated, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { isActive } = req.body;

    await pool.query(
      'UPDATE facebook_pages SET is_active = $1 WHERE id = $2 AND account_id = $3',
      [isActive, pageId, req.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error toggling page:', error);
    res.status(500).json({ error: 'Failed to update page' });
  }
});

module.exports = router;
