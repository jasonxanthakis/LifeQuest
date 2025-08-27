-- ========================================
-- LIFEQUEST DATABASE SCHEMA (FULL RESET)
-- ========================================

-- ---------------------------
-- Drop existing tables
-- ---------------------------
DROP TABLE IF EXISTS hero_items CASCADE;
DROP TABLE IF EXISTS battle CASCADE;
DROP TABLE IF EXISTS hero CASCADE;
DROP TABLE IF EXISTS quest_completion_summary CASCADE;
DROP TABLE IF EXISTS quest_completions CASCADE;
DROP TABLE IF EXISTS user_quest_streaks CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS quests CASCADE;
DROP TABLE IF EXISTS enemy CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ---------------------------
-- Users table
-- ---------------------------
CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(50) NOT NULL,
    username VARCHAR(30) NOT NULL UNIQUE,
    password CHAR(60) NOT NULL,
    email VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL
);

-- ---------------------------
-- Quests table
-- ---------------------------
CREATE TABLE quests (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    quest_title VARCHAR(50) NOT NULL,
    description VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL,
    points_value INT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_user_quest_title UNIQUE(user_id, quest_title)
);

-- ---------------------------
-- User quest streaks table
-- ---------------------------
CREATE TABLE user_quest_streaks (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    quest_id INT NOT NULL REFERENCES quests(id),
    active_streak BOOLEAN NOT NULL DEFAULT TRUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    current_streak INT NOT NULL,
    best_streak INT NOT NULL,
    CONSTRAINT uq_user_quest_streak UNIQUE (user_id, quest_id)
);

-- ---------------------------
-- Quest completions table
-- ---------------------------
CREATE TABLE quest_completions (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    quest_id INT NOT NULL REFERENCES quests(id),
    user_id INT NOT NULL REFERENCES users(id),
    completion_date DATE NOT NULL,
    status BOOLEAN NOT NULL DEFAULT TRUE,
    points_earned INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_quest_completion UNIQUE (quest_id, user_id, completion_date)
);

-- ---------------------------
-- Quest completion summary table
-- ---------------------------
CREATE TABLE quest_completion_summary (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    quest_id INT NOT NULL REFERENCES quests(id),
    user_id INT NOT NULL REFERENCES users(id),
    last_completed_date DATE,
    best_streak INT NOT NULL DEFAULT 0,
    current_streak INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_quest_completion_summary UNIQUE (quest_id, user_id)
);

-- ---------------------------
-- Hero table
-- ---------------------------
CREATE TABLE hero (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    current_level INT NOT NULL,
    hero_name VARCHAR(30) NOT NULL,
    total_points INT NOT NULL,
    health INT NOT NULL,
    damage INT NOT NULL,
    defense INT NOT NULL,
    next_enemy VARCHAR(30) NOT NULL
);

-- ---------------------------
-- Enemy table
-- ---------------------------
CREATE TABLE enemy (
    enemy_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    enemy_name VARCHAR(30) NOT NULL,
    enemy_level INT NOT NULL,
    enemy_health INT NOT NULL,
    enemy_damage INT NOT NULL,
    enemy_defense INT NOT NULL,
    power INT NOT NULL
);

-- Predefined enemies
INSERT INTO enemy (enemy_name, enemy_level, enemy_health, enemy_damage, enemy_defense, power) VALUES
('Goblin', 1, 90, 12, 8, 30),
('Zombie', 2, 160, 19, 14, 50),
('Centaur', 3, 240, 25, 19, 70),
('Golum', 4, 340, 34, 25, 95),
('Witch', 5, 420, 43, 32, 120),
('Giant', 6, 520, 55, 40, 150),
('Werewolf', 7, 630, 69, 49, 185),
('Minotaur', 8, 740, 83, 58, 220),
('Basilisk', 9, 860, 99, 68, 260),
('Dragon', 10, 990, 115, 78, 300);

-- ---------------------------
-- Battle table
-- ---------------------------
CREATE TABLE battle (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    enemy_id INT NOT NULL REFERENCES enemy(enemy_id),
    hero_id INT NOT NULL REFERENCES hero(id),
    winner VARCHAR(30) NOT NULL
);

-- ---------------------------
-- Items table
-- ---------------------------
CREATE TABLE items (
    item_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    item_name VARCHAR(50) NOT NULL,
    description VARCHAR(200) NOT NULL,
    item_health INT NOT NULL,
    item_damage INT NOT NULL,
    item_defense INT NOT NULL,
    item_cost INT NOT NULL,
    power INT NOT NULL
);

-- Predefined items
INSERT INTO items (item_name, description, item_health, item_damage, item_defense, item_cost, power) VALUES
('Health Potion', 'Restores 50 HP instantly. Perfect for tough battles!', 50, 0, 0, 5, 5),
('Magic Sword', 'A powerful weapon that increases attack damage by 15.', 0, 15, 0, 10, 10),
('Shield of Protection', 'Reduces incoming damage by 20%. Essential for defense.', 0, 0, 20, 15, 16),
('Mana Crystal', 'Restores 75 HP and increases spell power temporarily.', 75, 20, 0, 15, 32),
('Lucky Charm', 'Increases your chance of inflicting damage by 15%.', 20, 30, 20, 20, 54),
('Premium Quest Scroll', 'Unlocks special loot with HP, armor, and weaponry.', 50, 50, 50, 30, 105);

-- ---------------------------
-- Hero Items table
-- ---------------------------
CREATE TABLE hero_items (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hero_id INT NOT NULL REFERENCES hero(id),
    item_id INT NOT NULL REFERENCES items(item_id),
    is_equipped BOOLEAN DEFAULT FALSE
);

COMMIT;
