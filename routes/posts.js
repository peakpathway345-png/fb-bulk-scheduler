const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../config/database');

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

// Bulk upload posts
router.post('/bulk-upload', isAuthenticated, upload.array('media', 50), async (req, res) => {
  try {
    const { posts } = req.body; // Array of post objects with caption, schedule_time, page_ids
    const files = req.files;

    if (!posts || !files || files.length === 0) {
      return res.status(400).json({ error: 'No posts or files provided' });
    }

    const postsData = JSON.parse(posts);
    const insertedPosts = [];

    // Create batch record
    const batchResult = await pool.query(
      'INSERT INTO upload_batches (batch_name, total_posts) VALUES ($1, $2) RETURNING id',
      [`Batch ${new Date().toISOString()}`, postsData.length * postsData[0].page_ids.length]
    );
    const batchId = batchResult.rows[0].id;

    // Insert scheduled posts
    for (let i = 0; i < postsData.length; i++) {
      const post = postsData[i];
      const file = files[i];

      if (!file) continue;

      const mediaUrl = `/uploads/${file.filename}`;
      const mediaPath = file.path;

      // Determine post type
      const postType = file.mimetype.startsWith('video') ? 'video' : 'photo';

      // Insert post for each selected page
      for (const pageId of post.page_ids) {
        const result = await pool.query(
          `INSERT INTO scheduled_posts 
           (account_id, page_id, post_type, caption, media_url, media_path, schedule_time, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
           RETURNING *`,
          [
            req.user.id,
            pageId,
            postType,
            post.caption,
            mediaUrl,
            mediaPath,
            post.schedule_time
          ]
        );
        insertedPosts.push(result.rows[0]);
      }
    }

    res.json({
      success: true,
      message: `${insertedPosts.length} posts scheduled successfully`,
      posts: insertedPosts,
      batchId
    });
  } catch (error) {
    console.error('Error bulk uploading:', error);
    res.status(500).json({ error: 'Failed to upload posts', details: error.message });
  }
});

// Get scheduled posts
router.get('/scheduled', isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sp.*, fp.page_name, fp.page_id as fb_page_id
       FROM scheduled_posts sp
       JOIN facebook_pages fp ON sp.page_id = fp.id
       WHERE sp.account_id = $1
       ORDER BY sp.schedule_time DESC`,
      [req.user.id]
    );
    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get post statistics
router.get('/stats', isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'published') as published,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) as total
       FROM scheduled_posts
       WHERE account_id = $1`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Delete scheduled post
router.delete('/:postId', isAuthenticated, async (req, res) => {
  try {
    const { postId } = req.params;
    await pool.query(
      'DELETE FROM scheduled_posts WHERE id = $1 AND account_id = $2',
      [postId, req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;
