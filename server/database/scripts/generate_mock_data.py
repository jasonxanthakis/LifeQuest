# scripts/generate_mock_data.py

import psycopg
from faker import Faker
import random
from datetime import date

# ---------------------------
# DB connection
# ---------------------------
DB_URL = "postgresql://postgres.myrngdupyyrkzicrnwji:byte-quest@aws-1-eu-west-2.pooler.supabase.com:6543/postgres"
conn = psycopg.connect(DB_URL)
cur = conn.cursor()

fake = Faker()

NUM_USERS = 60

# ---------------------------
# Get existing quests
# ---------------------------
cur.execute("SELECT id, quest_title FROM quests;")
quests = cur.fetchall()
quest_ids = [q[0] for q in quests]  # list of valid quest IDs

# ---------------------------
# Generate fake users and streaks
# ---------------------------
for _ in range(NUM_USERS):
    full_name = fake.name()
    username = fake.user_name()
    password_hash = fake.sha256()
    email = fake.email()
    date_of_birth = fake.date_of_birth(minimum_age=18, maximum_age=50)

    cur.execute("""
        INSERT INTO users (full_name, username, password_hash, email, date_of_birth)
        VALUES (%s, %s, %s, %s, %s) RETURNING id
    """, (full_name, username, password_hash, email, date_of_birth))
    user_id = cur.fetchone()[0]

    # 1–5 streaks per user
    num_streaks = random.randint(1, 5)
    selected_quests = random.sample(quest_ids, num_streaks)

    for quest_id in selected_quests:
        start_date = fake.date_between(start_date='-180d', end_date='-30d')
        end_date = fake.date_between(start_date=start_date, end_date='today')
        current_streak = random.randint(0, 20)
        best_streak = max(current_streak, random.randint(0, 25))
        active_streak = random.choice([True, False])

        cur.execute("""
            INSERT INTO user_quest_streaks
            (user_id, quest_id, active_streak, start_date, end_date, current_streak, best_streak)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (user_id, quest_id, active_streak, start_date, end_date, current_streak, best_streak))

conn.commit()
cur.close()
conn.close()

print(f"Inserted {NUM_USERS} users with random quest streaks!")
