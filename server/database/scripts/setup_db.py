import psycopg

DB_URL = "postgresql://postgres.myrngdupyyrkzicrnwji:byte-quest@aws-1-eu-west-2.pooler.supabase.com:6543/postgres"

sql = """
DROP TABLE IF EXISTS hero_items;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS battle;
DROP TABLE IF EXISTS enemy;
DROP TABLE IF EXISTS hero;
DROP TABLE IF EXISTS user_quest_streaks;
DROP TABLE IF EXISTS user_quests;
DROP TABLE IF EXISTS quests;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(50) NOT NULL,
    username VARCHAR(30) NOT NULL,
    password_hash CHAR(64) NOT NULL,
    email VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL
);

CREATE TABLE quests (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    quest_title VARCHAR(50) NOT NULL,
    description VARCHAR(60) NOT NULL,
    category VARCHAR(30) NOT NULL,
    points_value INT NOT NULL,
    complete BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE user_quest_streaks (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    quest_id INT NOT NULL REFERENCES quests(id),
    active_streak BOOLEAN NOT NULL DEFAULT TRUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    current_streak INT NOT NULL,
    best_streak INT NOT NULL
);

CREATE TABLE hero (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    current_level INT NOT NULL,
    hero_name VARCHAR(30) NOT NULL,
    total_points INT NOT NULL,
    total_XP INT NOT NULL,
    next_enemy VARCHAR(30) NOT NULL
);

CREATE TABLE enemy (
    enemy_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    enemy_name VARCHAR(30) NOT NULL,
    enemy_XP INT NOT NULL,
    enemy_level INT NOT NULL
);

CREATE TABLE battle (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    enemy_id INT NOT NULL REFERENCES enemy(enemy_id),
    hero_id INT NOT NULL REFERENCES hero(id),
    winner VARCHAR(30) NOT NULL
);

CREATE TABLE items (
    item_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    item_name VARCHAR(30) NOT NULL,
    description VARCHAR(50) NOT NULL,
    item_damage INT NOT NULL,
    item_cost INT NOT NULL
);

CREATE TABLE hero_items (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hero_id INT NOT NULL REFERENCES hero(id),
    item_id INT NOT NULL REFERENCES items(item_id),
    is_equipped BOOLEAN
);

INSERT INTO enemy (enemy_name, enemy_XP, enemy_level) VALUES
('Goblin', 50, 1),
('Orc', 150, 3),
('Dragon', 1000, 10);

INSERT INTO items (item_name, description, item_damage, item_cost) VALUES
('Iron Sword', 'Basic sword for beginners', 10, 100),
('Magic Wand', 'Casts low-level spells', 15, 150),
('Healing Potion', 'Restores 50 HP', 0, 50);
"""

with psycopg.connect(DB_URL) as conn:
    with conn.cursor() as cur:
        cur.execute(sql)
        conn.commit()

print("Database tables created and seed data inserted!")
