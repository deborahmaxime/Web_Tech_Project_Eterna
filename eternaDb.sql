CREATE DATABASE eternaDb;
USE eternaDb;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150),
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT,
    profile_photo VARCHAR(255),
    joined_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    theme_mode ENUM('Day', 'Night') DEFAULT 'Day',
    privacy_level ENUM('Public', 'Private') DEFAULT 'Private'
);


CREATE TABLE capsules (
    capsule_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    story_text TEXT,
    date_of_memory DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    location_name VARCHAR(200),
    is_public BOOLEAN DEFAULT FALSE,
    views_count INT DEFAULT 0,

    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE media (
    media_id INT AUTO_INCREMENT PRIMARY KEY,
    capsule_id INT NOT NULL,
    media_type ENUM('image', 'video', 'Voice note') NOT NULL,
    media_url VARCHAR(255) NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (capsule_id) REFERENCES capsules(capsule_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    capsule_id INT NOT NULL,
    user_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (capsule_id) REFERENCES capsules(capsule_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE favorites (
    favorite_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    capsule_id INT NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (user_id, capsule_id),

    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    FOREIGN KEY (capsule_id) REFERENCES capsules(capsule_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE backups (
    backup_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    backup_type ENUM('PDF', 'Video', 'Archive', 'Image', 'Voice_note') NOT NULL,
    auto_backup_enabled BOOLEAN DEFAULT FALSE,
    last_backup_date DATETIME,
    cloud_storage_path VARCHAR(255),

    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE contacts (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    contact_name VARCHAR(150) NOT NULL,
    contact_email VARCHAR(150) NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);



