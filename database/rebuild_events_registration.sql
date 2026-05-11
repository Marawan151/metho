-- Rebuild events + registrations to match the current app schema.
-- Removes all events and registrations; keeps users and logins intact.
--
-- Apply with a local MySQL client (adjust user/host/password):
--   mysql -h 127.0.0.1 -u root -p eventdb < database/rebuild_events_registration.sql

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS events;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    slug VARCHAR(120) NOT NULL,
    title VARCHAR(200) NOT NULL,
    summary VARCHAR(400) DEFAULT NULL,
    description TEXT,
    location VARCHAR(220) NOT NULL DEFAULT '',
    starts_at DATETIME NOT NULL,
    ends_at DATETIME NULL,
    capacity INT UNSIGNED NOT NULL DEFAULT 100,
    price_cents INT UNSIGNED NOT NULL DEFAULT 0,
    published TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_events_slug (slug),
    KEY idx_events_starts (starts_at),
    KEY idx_events_published (published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE registrations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    public_ref CHAR(10) NOT NULL,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    total_cents INT UNSIGNED NOT NULL DEFAULT 0,
    status VARCHAR(24) NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_reg_ref (public_ref),
    KEY idx_reg_event (event_id),
    KEY idx_reg_user (user_id),
    CONSTRAINT fk_reg_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_reg_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
