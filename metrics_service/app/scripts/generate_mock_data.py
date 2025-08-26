import psycopg
from faker import Faker
import random
from datetime import date, datetime, timedelta
import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).parent / "../../.env"
env_path = env_path.resolve()
load_dotenv(dotenv_path=env_path)

# ---------------------------
# DB connection
# ---------------------------

DB_URL = os.getenv("DB_URL")
conn = psycopg.connect(DB_URL, autocommit=True)

fake = Faker()

NUM_USERS = 10
QUESTS_PER_USER = 5
DAYS_HISTORY = 100

users_data = []
quests_data = []
quest_completions_data = []
quest_summary_data = []

user_id_counter = 1
quest_id_counter = 1

# ---------------------------
# Get existing quests
# ---------------------------
# cur.execute("SELECT id, quest_title FROM quests;")
# quests = cur.fetchall()
# quest_ids = [q[0] for q in quests]  # list of valid quest IDs


# Generate fake users and streaks
for user_id in range(NUM_USERS):
    full_name = fake.name()
    username = fake.user_name()[:30]
    password_hash = fake.password(length=60)
    email = fake.email()[:50]
    date_of_birth = fake.date_of_birth(minimum_age=18, maximum_age=60)

    # cur.execute("""
    #     INSERT INTO users (full_name, username, password, email, date_of_birth)
    #     VALUES (%s, %s, %s, %s, %s) RETURNING id
    # """, (full_name, username, password_hash, email, date_of_birth))
    # user_id = cur.fetchone()[0]

    users_data.append((full_name, username, password_hash, email, date_of_birth))

    # Generate Quests per User
    for quest_id in range((user_id-1)*QUESTS_PER_USER + 1, user_id*QUESTS_PER_USER + 1):
        quest_title = fake.sentence(nb_words=4)[:50]
        description = fake.sentence(nb_words=10)[:100]
        category = random.choice(["Health", "Productivity", "Learning", "Fitness"])
        points_value = random.randint(5, 50)
        completed = False

        # cur.execute("""
        #     INSERT INTO quests
        #     (user_id, quest_title, description, category, points_value, completed)
        #     VALUES (%s, %s, %s, %s, %s, %s)
        # """, (user_id, quest_title, description, category, points_value, completed))

        quests_data.append((user_id_counter, quest_title, description, category, points_value, completed))

        # cur.execute("""
        #     INSERT INTO user_quest_streaks
        #     (user_id, quest_id, active_streak, start_date, end_date, current_streak, best_streak)
        #     VALUES (%s, %s, %s, %s, %s, %s, %s)
        # """, (user_id, quest_id, active_streak, start_date, end_date, current_streak, best_streak))

        # Generate Quest Completions and Summary
        last_completed_date = None
        best_streak = 0
        current_streak = 0
        streak_counter = 0
        start_date = datetime.today() - timedelta(days=DAYS_HISTORY)

        for day_offset in range(DAYS_HISTORY):
            completion_date = start_date + timedelta(days=day_offset)
            # Randomly decide if quest was completed on this day
            status = random.random() < 0.7  # 70% chance completed
            points_earned = points_value if status else 0
            
            if status:
                streak_counter += 1
                last_completed_date = completion_date.date()
            else:
                streak_counter = 0
            
            best_streak = max(best_streak, streak_counter)
            current_streak = streak_counter

            if status:
                # cur.execute("""
                #     INSERT INTO quest_completions 
                #     (quest_id, user_id, completion_date, status, points_earned)
                #     VALUES (%s, %s, %s, %s, %s)
                # """, (quest_id, user_id, completion_date, status, points_earned))

                quest_completions_data.append((quest_id_counter, user_id_counter, completion_date.date(), status, points_earned))

        # cur.execute("""
        #     INSERT INTO quest_completion_summary 
        #     (quest_id, user_id, last_completed_date, best_streak, current_streak)
        #     VALUES (%s, %s, %s, %s, %s)
        # """, (quest_id, user_id, last_completed_date, best_streak, current_streak))

        quest_summary_data.append((quest_id_counter, user_id_counter, last_completed_date, best_streak, current_streak))
        quest_id_counter += 1

    user_id_counter += 1

print("Connecting to database...")

# Users
with conn.cursor() as cur1:
    for row in users_data:
        cur1.execute("""
            INSERT INTO users (full_name, username, password, email, date_of_birth)
            VALUES (%s, %s, %s, %s, %s)
        """, row, prepare=False)

print("Users table seeded...")

# Quests
with conn.cursor() as cur2:
    for row in quests_data:
        cur2.execute("""
            INSERT INTO quests (user_id, quest_title, description, category, points_value, completed)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, row, prepare=False)

print("Quests table seeded...")

# Quest Completions
with conn.cursor() as cur3:
    for row in quest_completions_data:
        cur3.execute("""
            INSERT INTO quest_completions (quest_id, user_id, completion_date, status, points_earned)
            VALUES (%s, %s, %s, %s, %s)
        """, row, prepare=False)

print("Quests completions table seeded...")

# Quest Summary
with conn.cursor() as cur4:
    for row in quest_summary_data:
        cur4.execute("""
            INSERT INTO quest_completion_summary (quest_id, user_id, last_completed_date, best_streak, current_streak)
            VALUES (%s, %s, %s, %s, %s)
        """, row, prepare=False)

print("Quests completions summary table seeded...")

conn.close()

print(f"Inserted {NUM_USERS} users with {QUESTS_PER_USER} quests each and historical completions!")
