from datetime import datetime, timedelta
import io
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv
from pathlib import Path

# ------------------------------
# Load environment variables
# ------------------------------
env_path = Path(__file__).parent / "../../../.env"
load_dotenv(dotenv_path=env_path.resolve())
DB_URL = os.getenv("DB_URL")

if not DB_URL:
    raise ValueError("DB_URL not found in environment variables")

# ------------------------------
# Create SQLAlchemy engine
# ------------------------------
engine = create_engine(DB_URL)

# ------------------------------
# Chart functions
# ------------------------------
def monthly_progression_line_chart(df_last6):
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

def active_users_per_month_bar_chart(df_last6):
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

def streak_distribution_histogram(df_last6):
    plt.figure(figsize=(10,6))
    plt.hist(df_last6['current_streak'], bins=range(0, 22), color='green', edgecolor='black')
    plt.title("Distribution of Current Streaks")
    plt.xlabel("Current Streak Length")
    plt.ylabel("Number of Streaks")
    plt.tight_layout()
    plt.savefig("streak_distribution_histogram.png")
    plt.close()

def top_quests_by_average_streak(df_last6):
    avg_streak_quest = df_last6.groupby('quest_id')['current_streak'].mean().sort_values()
    plt.figure(figsize=(10,6))
    avg_streak_quest.plot(kind='barh', color='orange')
    plt.title("Average Current Streak per Quest (Last 6 Months)")
    plt.xlabel("Average Current Streak")
    plt.ylabel("Quest ID")
    plt.tight_layout()
    plt.savefig("top_quests_avg_streak.png")
    plt.close()



def user_progression_heatmap(df_last6):
    """
    Create a GitHub-style heatmap of user streaks across the last 6 months.
    Each box = 1 day, colored by streak length.
    """

    # Ensure datetime
    df_last6['end_date'] = pd.to_datetime(df_last6['end_date'])

    # Filter last 6 months
    six_months_ago = df_last6['end_date'].max() - pd.DateOffset(months=6)
    df_last6 = df_last6[df_last6['end_date'] >= six_months_ago]

    # If nothing left, warn
    if df_last6.empty:
        print("⚠️ No data available in the last 6 months.")
        return

    # Create daily timeline
    all_days = pd.date_range(start=six_months_ago, end=df_last6['end_date'].max(), freq="D")

    users = df_last6['username'].unique()
    fig, axes = plt.subplots(len(users), 1, figsize=(16, 3 * len(users)), constrained_layout=True)

    if len(users) == 1:
        axes = [axes]

    for ax, user in zip(axes, users):
        user_df = df_last6[df_last6['username'] == user]

        # 🔧 Ensure unique per day: take MAX streak of that day
        user_df = user_df.groupby('end_date')['current_streak'].max()

        # Align to full timeline
        user_df = user_df.reindex(all_days).fillna(0).to_frame(name="current_streak")
        user_df['week'] = user_df.index.isocalendar().week.astype(int)
        user_df['weekday'] = user_df.index.weekday

        # Pivot so rows = weekdays, cols = weeks
        heatmap_data = user_df.pivot(index='weekday', columns='week', values='current_streak')

        # Debug check
        print(f"\n📊 User: {user}")
        print(heatmap_data.head())

        # Plot like GitHub
        sns.heatmap(
            heatmap_data,
            ax=ax,
            cmap="Greens",   # closer to GitHub look
            cbar=False,
            linewidths=1,
            linecolor='white',
            square=True
        )

        ax.set_title(f"Streak Heatmap for {user}", fontsize=14)
        ax.set_ylabel("")
        ax.set_xlabel("")

        # GitHub-style weekdays
        ax.set_yticks([i + 0.5 for i in range(7)])
        ax.set_yticklabels(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], rotation=0)

    plt.savefig("github_style_multiuser_heatmap.png")
    plt.close()
    print("✅ GitHub-style streak heatmap created")

def cumulative_streak_growth_area_chart(df_last6):
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

# ------------------------------
# Main execution
# ------------------------------
if __name__ == "__main__":
    print("Loading user streaks data from database...")

    query = """
        SELECT u.id AS user_id, u.username, u.full_name, s.quest_id,
               s.start_date, s.end_date, s.current_streak, s.best_streak, s.active_streak
        FROM user_quest_streaks s
        JOIN users u ON u.id = s.user_id
    """
    df_last6 = pd.read_sql(query, engine)

    if df_last6.empty:
        print("No streak data found in the database. Exiting.")
        exit(0)

    # Add month column for charts
    df_last6['month'] = pd.to_datetime(df_last6['end_date']).dt.to_period('M')

    print("Generating charts...")

    try:
        monthly_progression_line_chart(df_last6)
        print("✅ Monthly progression line chart created")

        active_users_per_month_bar_chart(df_last6)
        print("✅ Active users per month bar chart created")

        streak_distribution_histogram(df_last6)
        print("✅ Streak distribution histogram created")

        top_quests_by_average_streak(df_last6)
        print("✅ Top quests by average streak chart created")

        user_progression_heatmap(df_last6)
        print("✅ User progression heatmap created")

        cumulative_streak_growth_area_chart(df_last6)
        print("✅ Cumulative streak growth area chart created")

        print("All charts generated successfully!")

    except Exception as e:
        print("⚠️ Error generating charts:", e)


















"""
# ------------------------------
# Active Users per Month Bar Chart
# ------------------------------
def active_users_per_month_bar_chart(df_last6):
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
# Streak Distribution Histogram
# ------------------------------
def streak_distribution_histogram(df_last6):
    plt.figure(figsize=(10,6))
    plt.hist(df_last6['current_streak'], bins=range(0, 22), color='green', edgecolor='black')
    plt.title("Distribution of Current Streaks")
    plt.xlabel("Current Streak Length")
    plt.ylabel("Number of Streaks")
    plt.tight_layout()
    plt.savefig("streak_distribution_histogram.png")
    plt.close()

# ------------------------------
# Top Quests by Average Streak
# ------------------------------
def top_quests_by_average_streak(df_last6):
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
# User Progression Heatmap
# ------------------------------
def user_progression_hashmap(df_last6):
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
# Cumulative Streak Growth Area Chart
# ------------------------------
def cumulative_streak_growth_area_chart(df_last6):
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
"""

