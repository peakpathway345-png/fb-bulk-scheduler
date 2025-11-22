const cron = require('node-cron');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const pool = require('../config/database');

// Check and publish scheduled posts every minute
const startPublisher = () => {
  console.log('📢 Background publisher started - checking every minute');

  cron.schedule('* * * * *', async () => {
    try {
      // Get posts that are due to be published
      const result = await pool.query(
        `SELECT sp.*, fp.page_access_token, fp.page_id as fb_page_id
         FROM scheduled_posts sp
         JOIN facebook_pages fp ON sp.page_id = fp.id
         WHERE sp.status = 'pending' 
         AND sp.schedule_time <= NOW()
         AND fp.is_active = true
         ORDER BY sp.schedule_time ASC
         LIMIT 10`
      );

      const postsToPublish = result.rows;

      if (postsToPublish.length > 0) {
        console.log(`🚀 Found ${postsToPublish.length} posts to publish`);
      }

      for (const post of postsToPublish) {
        try {
          await publishPost(post);
        } catch (error) {
          console.error(`❌ Failed to publish post ${post.id}:`, error.message);
          
          // Update retry count
          const newRetryCount = post.retry_count + 1;
          
          if (newRetryCount >= 3) {
            // Mark as failed after 3 retries
            await pool.query(
              `UPDATE scheduled_posts 
               SET status = 'failed', error_message = $1, retry_count = $2
               WHERE id = $3`,
              [error.message, newRetryCount, post.id]
            );
          } else {
            // Increment retry count
            await pool.query(
              'UPDATE scheduled_posts SET retry_count = $1 WHERE id = $2',
              [newRetryCount, post.id]
            );
          }
        }
      }
    } catch (error) {
      console.error('❌ Cron job error:', error);
    }
  });
};

// Publish a single post to Facebook
async function publishPost(post) {
  const { id, fb_page_id, page_access_token, post_type, caption, media_path } = post;

  console.log(`📤 Publishing post ${id} to page ${fb_page_id}`);

  try {
    let response;

    if (post_type === 'photo') {
      // Upload photo
      const formData = new FormData();
      formData.append('source', fs.createReadStream(media_path));
      formData.append('caption', caption || '');
      formData.append('access_token', page_access_token);

      response = await axios.post(
        `https://graph.facebook.com/v18.0/${fb_page_id}/photos`,
        formData,
        {
          headers: formData.getHeaders(),
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );
    } else if (post_type === 'video') {
      // Upload video
      const formData = new FormData();
      formData.append('source', fs.createReadStream(media_path));
      formData.append('description', caption || '');
      formData.append('access_token', page_access_token);

      response = await axios.post(
        `https://graph.facebook.com/v18.0/${fb_page_id}/videos`,
        formData,
        {
          headers: formData.getHeaders(),
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 120000 // 2 minutes timeout for videos
        }
      );
    }

    const facebookPostId = response.data.id || response.data.post_id;

    // Mark as published
    await pool.query(
      `UPDATE scheduled_posts 
       SET status = 'published', facebook_post_id = $1, published_at = NOW()
       WHERE id = $2`,
      [facebookPostId, id]
    );

    console.log(`✅ Post ${id} published successfully. Facebook ID: ${facebookPostId}`);
  } catch (error) {
    console.error(`❌ Error publishing post ${id}:`, error.response?.data || error.message);
    throw error;
  }
}

module.exports = { startPublisher };
