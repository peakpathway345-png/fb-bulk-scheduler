-- Facebook Bulk Scheduler Database Schema
-- Run this on Railway PostgreSQL database

-- Table: facebook_accounts
CREATE TABLE IF NOT EXISTS facebook_accounts (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    token_expiry TIMESTAMP,
    name VARCHAR(255),
    email VARCHAR(255),
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: facebook_pages
CREATE TABLE IF NOT EXISTS facebook_pages (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES facebook_accounts(id) ON DELETE CASCADE,
    page_id VARCHAR(255) UNIQUE NOT NULL,
    page_name VARCHAR(255) NOT NULL,
    page_access_token TEXT NOT NULL,
    category VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: scheduled_posts
CREATE TABLE IF NOT EXISTS scheduled_posts (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES facebook_accounts(id) ON DELETE CASCADE,
    page_id INTEGER REFERENCES facebook_pages(id) ON DELETE CASCADE,
    post_type VARCHAR(50) NOT NULL, -- 'photo', 'video', 'reel'
    caption TEXT,
    media_url TEXT NOT NULL,
    media_path TEXT,
    schedule_time TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'published', 'failed'
    facebook_post_id VARCHAR(255),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

-- Table: upload_batches
CREATE TABLE IF NOT EXISTS upload_batches (
    id SERIAL PRIMARY KEY,
    batch_name VARCHAR(255),
    total_posts INTEGER,
    completed_posts INTEGER DEFAULT 0,
    failed_posts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_schedule_time ON scheduled_posts(schedule_time);
CREATE INDEX IF NOT EXISTS idx_facebook_pages_account_id ON facebook_pages(account_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for facebook_accounts
CREATE TRIGGER update_facebook_accounts_updated_at 
    BEFORE UPDATE ON facebook_accounts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
