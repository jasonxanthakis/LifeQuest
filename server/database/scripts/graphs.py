# scripts/graphs.py

import psycopg
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import seaborn as sns

# Database connection
DB_URL = "postgresql://postgres.myrngdupyyrkzicrnwji:byte-quest@aws-1-eu-west-2.pooler.supabase.com:6543/postgres"
conn = psycopg.connect(DB_URL)

# Load user_quest_streaks with user info
query = """
SELECT u.id AS user_id, u.username, u.full_name, s.quest_id, s.start_date, s.end_date,
       s.current_streak, s.best_streak, s.active_streak
FROM user_quest_streaks s
JOIN users u ON u.id = s.user_id
"""
df = pd.read_sql(query, conn)
conn.close()

# Convert dates
df['start_date'] = pd.to_datetime(df['start_date'])
df['end_date'] = pd.to_datetime(df['end_date'])
df['month'] = df['end_date'].dt.to_period('M')

# Limit to last 6 months
six_months_ago = pd.to_datetime('today') - pd.DateOffset(months=6)
df_last6 = df[df['end_date'] >= six_months_ago]

# ------------------------------
# 1️⃣ Monthly Progression Line Chart
# ------------------------------
monthly_avg = df_last6.groupby('month')['current_streak'].mean()
plt.figure(figsize=(10,6))
monthly_avg.plot(marker='o', linestyle='-')
plt.title("Average Current Streak Per Month (Last 6 Months)")
plt.xlabel("Month")
plt.ylabel("Average Current Streak")
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig("monthly_progression_line.png")
plt.close()

# ------------------------------
# 2️⃣ Active Users per Month Bar Chart
# ------------------------------
active_users = df_last6[df_last6['active_streak']==True].groupby('month')['user_id'].nunique()
plt.figure(figsize=(10,6))
active_users.plot(kind='bar', color='skyblue')
plt.title("Active Users Per Month (Last 6 Months)")
plt.xlabel("Month")
plt.ylabel("Number of Active Users")
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig("active_users_per_month.png")
plt.close()

# ------------------------------
# 3️⃣ Streak Distribution Histogram
# ------------------------------
plt.figure(figsize=(10,6))
plt.hist(df_last6['current_streak'], bins=range(0, 22), color='green', edgecolor='black')
plt.title("Distribution of Current Streaks")
plt.xlabel("Current Streak Length")
plt.ylabel("Number of Streaks")
plt.tight_layout()
plt.savefig("streak_distribution_histogram.png")
plt.close()

# ------------------------------
# 4️⃣ Top Quests by Average Streak
# ------------------------------
avg_streak_quest = df_last6.groupby('quest_id')['current_streak'].mean().sort_values()
plt.figure(figsize=(10,6))
avg_streak_quest.plot(kind='barh', color='orange')
plt.title("Average Current Streak per Quest (Last 6 Months)")
plt.xlabel("Average Current Streak")
plt.ylabel("Quest ID")
plt.tight_layout()
plt.savefig("top_quests_avg_streak.png")
plt.close()

# ------------------------------
# 5️⃣ User Progression Heatmap
# ------------------------------
heatmap_data = df_last6.pivot_table(index='username', columns='month', values='current_streak', fill_value=0)
plt.figure(figsize=(12,8))
sns.heatmap(heatmap_data, cmap="YlGnBu", linewidths=.5)
plt.title("User Streaks Over Last 6 Months")
plt.xlabel("Month")
plt.ylabel("Username")
plt.tight_layout()
plt.savefig("user_progression_heatmap.png")
plt.close()

# ------------------------------
# 6️⃣ Cumulative Streak Growth Area Chart
# ------------------------------
cum_streak = df_last6.groupby('month')['current_streak'].sum().cumsum()
plt.figure(figsize=(10,6))
cum_streak.plot(kind='area', color='lightcoral', alpha=0.6)
plt.title("Cumulative Streak Growth Over Last 6 Months")
plt.xlabel("Month")
plt.ylabel("Cumulative Streaks")
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig("cumulative_streak_growth.png")
plt.close()

print("All graphs generated successfully!")
