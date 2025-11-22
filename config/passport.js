const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const pool = require('./database');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      'SELECT * FROM facebook_accounts WHERE id = $1',
      [id]
    );
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.CALLBACK_URL || 'http://localhost:3000/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'email', 'picture.type(large)'],
    scope: ['pages_manage_posts', 'pages_read_engagement', 'pages_manage_metadata', 'pages_show_list']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if account already exists
      const existingAccount = await pool.query(
        'SELECT * FROM facebook_accounts WHERE user_id = $1',
        [profile.id]
      );

      if (existingAccount.rows.length > 0) {
        // Update existing account
        const updateResult = await pool.query(
          `UPDATE facebook_accounts 
           SET access_token = $1, name = $2, email = $3, profile_picture = $4, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $5 RETURNING *`,
          [
            accessToken,
            profile.displayName,
            profile.emails ? profile.emails[0].value : null,
            profile.photos ? profile.photos[0].value : null,
            profile.id
          ]
        );
        return done(null, updateResult.rows[0]);
      } else {
        // Create new account
        const insertResult = await pool.query(
          `INSERT INTO facebook_accounts (user_id, access_token, name, email, profile_picture) 
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [
            profile.id,
            accessToken,
            profile.displayName,
            profile.emails ? profile.emails[0].value : null,
            profile.photos ? profile.photos[0].value : null
          ]
        );
        return done(null, insertResult.rows[0]);
      }
    } catch (error) {
      return done(error, null);
    }
  }
));

module.exports = passport;
