-- ============================================================================
-- ETERNA Time Capsule - Database Schema (Production Server)
-- ============================================================================
-- For school server: webtech_2025A_kevin_bigirimana
-- This creates only the essential tables needed for ETERNA to work
-- ============================================================================

USE webtech_2025A_kevin_bigirimana;

-- ============================================================================
-- USERS TABLE
-- ============================================================================
-- Stores user account information
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT DEFAULT NULL,
    profile_photo VARCHAR(255) DEFAULT NULL,
    joined_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    theme_mode ENUM('light', 'dark') DEFAULT 'light',
    privacy_level ENUM('public', 'private') DEFAULT 'private',
    is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME DEFAULT NULL,
    
    UNIQUE KEY unique_email (email),
    INDEX idx_email (email),
    INDEX idx_joined_date (joined_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- CAPSULES TABLE
-- ============================================================================
-- Main table storing all time capsules
CREATE TABLE IF NOT EXISTS capsules (
    capsule_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT DEFAULT NULL,
    story_text TEXT DEFAULT NULL,
    date_of_memory DATE DEFAULT NULL,
    open_date DATETIME NOT NULL,
    location_name VARCHAR(200) DEFAULT NULL,
    capsule_type ENUM('private', 'shared', 'future') DEFAULT 'private',
    status ENUM('draft', 'sealed', 'opened', 'locked') DEFAULT 'draft',
    is_deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME DEFAULT NULL,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_open_date (open_date),
    INDEX idx_user_open_date (user_id, open_date),
    INDEX idx_deleted_status (is_deleted, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- MEDIA TABLE
-- ============================================================================
-- Stores all media files attached to capsules
CREATE TABLE IF NOT EXISTS media (
    media_id INT AUTO_INCREMENT PRIMARY KEY,
    capsule_id INT NOT NULL,
    media_type ENUM('image', 'video', 'audio', 'document') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT DEFAULT NULL,
    mime_type VARCHAR(100) DEFAULT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    display_order INT DEFAULT 0,

    FOREIGN KEY (capsule_id) REFERENCES capsules(capsule_id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_capsule_order (capsule_id, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- CAPSULE VIEWS TABLE
-- ============================================================================
-- Tracks when and by whom capsules are viewed
CREATE TABLE IF NOT EXISTS capsule_views (
    view_id INT AUTO_INCREMENT PRIMARY KEY,
    capsule_id INT NOT NULL,
    user_id INT DEFAULT NULL,
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (capsule_id) REFERENCES capsules(capsule_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_view_date (viewed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================
-- Extended user profile information
CREATE TABLE IF NOT EXISTS user_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    first_name VARCHAR(100) DEFAULT NULL,
    last_name VARCHAR(100) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    birth_date DATE DEFAULT NULL,
    location VARCHAR(255) DEFAULT NULL,
    profile_picture VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_profile (user_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- PASSWORD RESETS TABLE
-- ============================================================================
-- For password recovery functionality
CREATE TABLE IF NOT EXISTS password_resets (
    reset_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reset_code VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_reset (user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
-- Essential 6 tables created:
-- 1. users - user accounts and authentication
-- 2. capsules - time capsule data
-- 3. media - capsule attachments (images, videos, audio)
-- 4. capsule_views - view tracking
-- 5. user_profiles - extended profile information
-- 6. password_resets - password recovery
-- Ready to use with ETERNA application on production server
