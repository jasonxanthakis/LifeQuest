DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS quests;
DROP TABLE IF EXISTS user_quests;
DROP TABLE IF EXISTS user_quest_streaks;
DROP TABLE IF EXISTS hero;
DROP TABLE IF EXISTS enemy; 
DROP TABLE IF EXISTS battle;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS hero_items;

CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY,
    username VARCHAR(30) NOT NULL,
    password_hash CHAR(60) NOT NULL,
    email VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE quests (
    id INT GENERATED ALWAYS AS IDENTITY,
    quest_title VARCHAR(50) NOT NULL,
    description VARCHAR(60) NOT NULL,
    category VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE user_quest_streaks (
    id INT GENERATED ALWAYS AS IDENTITY,
    user_id INT NOT NULL,
    quest_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    current_streak INT NOT NULL,
    best_streak INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (quest_id) REFERENCES quests(id)
);

CREATE TABLE hero (
    id INT GENERATED ALWAYS AS IDENTITY,
    user_id INT NOT NULL,
    current_level INT NOT NULL,
    hero_name VARCHAR(30) NOT NULL,
    total_XP INT NOT NULL,
    next_enemy VARCHAR(30) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE enemy (
    id INT GENERATED ALWAYS AS IDENTITY,
    hero_id INT NOT NULL,
    enemy_name VARCHAR(30) NOT NULL,
    enemy_XP INT NOT NULL,
    enemy_level INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (hero_id) REFERENCES hero(id)
);

CREATE TABLE battle (
    id INT GENERATED ALWAYS AS IDENTITY,
    enemy_id INT NOT NULL,
    hero_id INT NOT NULL,
    winner VARCHAR(30) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (enemy_id) REFERENCES enemy(id),
    FOREIGN KEY (hero_id) REFERENCES hero(id)
);

CREATE TABLE items (
    id INT GENERATED ALWAYS AS IDENTITY,
    item_name VARCHAR(30) NOT NULL,
    description VARCHAR(50) NOT NULL,
    item_cost INT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE hero_items (
    id INT GENERATED ALWAYS AS IDENTITY,
    hero_id INT NOT NULL,
    item_id INT NOT NULL,
    is_equipped BOOLEAN,
    PRIMARY KEY (id),
    FOREIGN KEY (hero_id) REFERENCES hero(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);
