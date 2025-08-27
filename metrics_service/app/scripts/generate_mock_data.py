import psycopg
from faker import Faker
import random
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from pathlib import Path

# ---------------------------
# Load environment variables
# ---------------------------
env_path = Path(__file__).parent / "../../../.env"
load_dotenv(dotenv_path=env_path.resolve())

DB_URL = os.getenv("DB_URL")
if not DB_URL:
    raise ValueError("DB_URL not found in environment variables")

conn = psycopg.connect(DB_URL, autocommit=True)
fake = Faker()

# ---------------------------
# Configuration
# ---------------------------
NUM_USERS = 10
QUESTS_PER_USER = 5
DAYS_HISTORY = 120  # 4 months

# ---------------------------
# Data holders
# ---------------------------
users_data = []
hero_data = []
quests_data = []
quest_completions_data = []
user_streaks_data = []

user_id_counter = 1
quest_id_counter = 1

# ---------------------------
# Generate mock data
# ---------------------------
for _ in range(NUM_USERS):
    # User info
    full_name = fake.name()
    username = fake.user_name()[:30]
    password_hash = "$2b$12$KHKXDq4xysddaTiWAEtHMu81mZ2xpjg5gqN7Vq3uBUEC.tbQVh9Ae"
    email = fake.email()[:50]
    date_of_birth = fake.date_of_birth(minimum_age=18, maximum_age=60)

    users_data.append((full_name, username, password_hash, email, date_of_birth))
    hero_data.append((user_id_counter, 1, username, 0, 50, 5, 5, '???'))

    # Generate quests
    quest_ids_for_user = []
    for _ in range(QUESTS_PER_USER):
        quest_title = fake.sentence(nb_words=4)[:50]
        description = fake.sentence(nb_words=10)[:100]
        category = random.choice(["Health", "Productivity", "Learning", "Fitness"])
        points_value = random.randint(5, 50)
        completed = False

        quests_data.append((user_id_counter, quest_title, description, category, points_value, completed))
        quest_ids_for_user.append(quest_id_counter)
        quest_id_counter += 1

    # Generate daily completions and streaks
    streak_counter = 0
    start_date = datetime.today() - timedelta(days=DAYS_HISTORY)
    for day_offset in range(DAYS_HISTORY):
        date = start_date + timedelta(days=day_offset)

        # Mark user as active every day
        streak_counter += 1
        for qid in quest_ids_for_user:
            # Increase chance of completion per day to reduce zeros
            activity_prob = random.uniform(0.7, 1.0)  # 70%-100% chance
            status = random.random() < activity_prob
            points_earned = random.randint(5, 50) if status else 0

            quest_completions_data.append(
                (qid, user_id_counter, date.date(), status, points_earned)
            )

            # Daily streak snapshot
            user_streaks_data.append((
                user_id_counter,
                qid,
                True,  # active streak
                date.date(),
                date.date(),
                streak_counter,
                streak_counter  # for simplicity best_streak = streak_counter
            ))

    user_id_counter += 1

# ---------------------------
# Insert data into DB
# ---------------------------
with conn.cursor() as cur:
    # Users
    for row in users_data:
        cur.execute("""
            INSERT INTO users (full_name, username, password, email, date_of_birth)
            VALUES (%s, %s, %s, %s, %s)
        """, row, prepare=False)
    print("Users table seeded...")

    # Heroes
    for row in hero_data:
        cur.execute("""
            INSERT INTO hero (user_id, current_level, hero_name, total_points, health, damage, defense, next_enemy)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, row, prepare=False)
    print("Hero table seeded...")

    # Quests
    for row in quests_data:
        cur.execute("""
            INSERT INTO quests (user_id, quest_title, description, category, points_value, completed)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, row, prepare=False)
    print("Quests table seeded...")

    # Quest Completions
    for row in quest_completions_data:
        cur.execute("""
            INSERT INTO quest_completions (quest_id, user_id, completion_date, status, points_earned)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (quest_id, user_id, completion_date) DO NOTHING
        """, row, prepare=False)
    print("Quest completions table seeded...")

    # User streaks
    for row in user_streaks_data:
        cur.execute("""
            INSERT INTO user_quest_streaks (user_id, quest_id, active_streak, start_date, end_date, current_streak, best_streak)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (user_id, quest_id, end_date) DO NOTHING
        """, row, prepare=False)
    print("User streaks table seeded...")

conn.close()
print(f"Inserted {NUM_USERS} users with {QUESTS_PER_USER} quests each and {DAYS_HISTORY} days of activity!")
