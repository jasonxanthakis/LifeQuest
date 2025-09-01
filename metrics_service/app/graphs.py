from datetime import datetime, timedelta
import io
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from app.db import connect

# ------------------------------
# Extract Data from Database
# ------------------------------

def check_new_user(user_id: str) -> bool:
    """
    Checks if a user is new (are the tables empty).
    Returns a boolean.
    """
    with connect.get_connection() as conn:
        query = """
        SELECT quest_id, completion_date
        FROM quest_completions
        WHERE user_id = %s
        ORDER BY completion_date
        """
        df = pd.read_sql(query, conn, params=(user_id,))

    if df.empty:
        return True
    
    return False

def get_best_and_current_streak(user_id: int) -> dict:
    """
    Load best streak ever (and the corresponding quest) and the current streak for all quests.
    Returns a tuple with best streak, best streak quest and current streak.
    """

    with connect.get_connection() as conn:
        query = """
        SELECT qcs.best_streak, q.quest_title
        FROM quest_completion_summary qcs
        JOIN quests q ON qcs.quest_id = q.id
        WHERE qcs.user_id = %s
        ORDER BY qcs.best_streak DESC
        LIMIT 1
        """

        with conn.cursor() as cur1:
            cur1.execute(query=query, params=(user_id,), prepare=False)
            result = cur1.fetchone()

    if result is None:
        return {}

    return {
        'best_streak' : result[0],
        'quest_title' : result[1]
    }

def get_best_and_current_streak_by_quest(user_id: int, quest_id: int) -> dict:
    """
    Load best streak and current streak for given quest and given user.
    Returns a tuple with best streak, current streak and last date of completion.
    """
    result = None

    with connect.get_connection() as conn:
        query = """
        SELECT best_streak, current_streak, last_completed_date
        FROM quest_completion_summary
        WHERE user_id = %s AND quest_id = %s;
        """
        with conn.cursor() as cur1:
            cur1.execute(query=query, params=(user_id, quest_id), prepare=False)
            result = cur1.fetchone()
    
    if result == None:
        return {}
    
    days = 0
    saved_date = result[2] if result[2] else None
    if saved_date != None:
        today = datetime.today().date()
        delta = today - saved_date
        days = delta.days
    days = str(days) + " day ago" if days == 1 else str(days) + " days ago"
    
    return {
        "best_streak": result[0],
        "current_streak": result[1],
        "last_completion": days
    }

def load_all_user_quest_completions(user_id: int, months: int = 6) -> pd.DataFrame:
    """
    Load all quest completions for a given user across all quests.
    Returns a DataFrame with quest_id, completion_date.
    By default limits to the last `months` months.
    """
    with connect.get_connection() as conn:
        query = """
        SELECT quest_id, completion_date
        FROM quest_completions
        WHERE user_id = %s
        ORDER BY completion_date
        """
        df = pd.read_sql(query, conn, params=[user_id])

    df["completion_date"] = pd.to_datetime(df["completion_date"])

    # Optionally filter to last N months
    if months is not None:
        cutoff = pd.to_datetime("today") - pd.DateOffset(months=months)
        df = df[df["completion_date"] >= cutoff]
    
    return df

def load_user_quest_completions(user_id: int, quest_id: int, months: int = 6) -> pd.DataFrame:
    """
    Load quest completion data for a given user & quest.
    Returns a pandas DataFrame with completion_date and status.
    By default limits to the last `months` months.
    """
    with connect.get_connection() as conn:
        query = """
            SELECT qc.completion_date, qc.status, qc.points_earned
            FROM quest_completions qc
            WHERE qc.user_id = %s
              AND qc.quest_id = %s
            ORDER BY qc.completion_date
        """
        df = pd.read_sql(query, conn, params=(user_id, quest_id))

    if df.empty:
        return df

    # Ensure datetime
    df["completion_date"] = pd.to_datetime(df["completion_date"])

    # Optionally filter to last N months
    if months is not None:
        cutoff = pd.to_datetime("today") - pd.DateOffset(months=months)
        df = df[df["completion_date"] >= cutoff]

    return df

# ------------------------------
# Plot Graphs
# ------------------------------

def plot_multiquest_heatmap(df: pd.DataFrame, user_id: int) -> str:
    """
    GitHub-style contribution grid for all quests of a user.
    Uses shades of green depending on number of completions.
    Returns SVG string.
    """
    if df.empty:
        fig, ax = plt.subplots(figsize=(6, 3))
        ax.text(0.5, 0.5, "No completions available", ha="center", va="center")
        ax.axis("off")
        buf = io.StringIO()
        fig.savefig(buf, format="svg")
        plt.close(fig)
        return buf.getvalue()

    # Ensure datetime
    df["completion_date"] = pd.to_datetime(df["completion_date"])

    # Build continuous date range
    date_range = pd.date_range(df["completion_date"].min(), df["completion_date"].max())
    all_days = pd.DataFrame({"completion_date": date_range})

    # Count total completions per day (across all quests)
    daily = df.groupby("completion_date").size().reset_index(name="count")
    df = all_days.merge(daily, on="completion_date", how="left").fillna(0)

    # Helpers
    df["weekday"] = df["completion_date"].dt.weekday  # 0=Mon
    df["week_start"] = df["completion_date"] - pd.to_timedelta(
        df["completion_date"].dt.weekday, unit="D"
    )

    # Set up figure
    fig, ax = plt.subplots(figsize=(12, 3))

    # Map week_start to column index
    week_starts = sorted(df["week_start"].unique())
    week_to_col = {w: i for i, w in enumerate(week_starts)}

    # Normalize counts for colormap
    max_count = df["count"].max()
    norm = plt.Normalize(vmin=0, vmax=max_count if max_count > 0 else 1)
    cmap = plt.cm.Greens

    # Plot completions as colored squares
    for _, row in df.iterrows():
        col = week_to_col[row["week_start"]]
        row_pos = row["weekday"]
        color = cmap(norm(row["count"]))
        ax.add_patch(plt.Rectangle(
            (col, row_pos), 1, 1,
            facecolor=color,
            edgecolor="white"
        ))

    # Y axis labels
    ax.set_yticks([i + 0.5 for i in range(7)])
    ax.set_yticklabels(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], rotation=0)

    # X axis month labels
    month_starts = (
        df.groupby(df["completion_date"].dt.to_period("M"))["week_start"]
        .min()
        .sort_values()
        .drop_duplicates()
    )
    xticks = []
    xlabels = []
    for d in month_starts:
        if d in week_to_col:
            xticks.append(week_to_col[d] + 0.5)
            xlabels.append(d.strftime("%b"))
    ax.set_xticks(xticks)
    ax.set_xticklabels(xlabels, rotation=0)

    # Limits and style
    ax.set_xlim(0, len(week_starts))
    ax.set_ylim(0, 7)
    ax.invert_yaxis()
    ax.tick_params(axis="x", which="both", bottom=False, top=False)
    ax.set_xlabel("")
    ax.set_ylabel("")

    # Return as SVG
    buf = io.StringIO()
    fig.savefig(buf, format="svg")
    plt.close(fig)
    svg = buf.getvalue()
    svg = svg.replace('<svg ', '<svg class="calendar_heatmap" ')
    return svg

def plot_single_quest_heatmap(df: pd.DataFrame, user_id: int, quest_id: int) -> str:
    """
    GitHub-style activity heatmap for a single quest.
    Shades of green indicate number of completions per day.
    Returns SVG string.
    """
    if df.empty:
        fig, ax = plt.subplots(figsize=(6, 3))
        ax.text(0.5, 0.5, "No completions available", ha="center", va="center")
        ax.axis("off")
        buf = io.StringIO()
        fig.savefig(buf, format="svg")
        plt.close(fig)
        return buf.getvalue()

    # Ensure datetime
    df["completion_date"] = pd.to_datetime(df["completion_date"])

    # Count completions per day
    daily = df.groupby("completion_date").size().reset_index(name="count")

    # Build continuous date range and merge
    date_range = pd.date_range(daily["completion_date"].min(), daily["completion_date"].max())
    heatmap_df = pd.DataFrame({"completion_date": date_range})
    heatmap_df = heatmap_df.merge(daily, on="completion_date", how="left").fillna(0)

    # Helpers
    heatmap_df["weekday"] = heatmap_df["completion_date"].dt.weekday  # 0=Mon
    heatmap_df["week_start"] = heatmap_df["completion_date"] - pd.to_timedelta(
        heatmap_df["completion_date"].dt.weekday, unit="D"
    )

    # Set up figure
    fig, ax = plt.subplots(figsize=(12, 3))

    # Map week_start to column index
    week_starts = sorted(heatmap_df["week_start"].unique())
    week_to_col = {w: i for i, w in enumerate(week_starts)}

    # Normalize counts for colormap
    max_count = heatmap_df["count"].max()
    norm = plt.Normalize(vmin=0, vmax=max_count if max_count > 0 else 1)
    cmap = plt.cm.Greens

    # Plot squares
    for _, row in heatmap_df.iterrows():
        col = week_to_col[row["week_start"]]
        row_pos = row["weekday"]
        color = cmap(norm(row["count"]))
        ax.add_patch(plt.Rectangle(
            (col, row_pos), 1, 1,
            facecolor=color,
            edgecolor="white"
        ))

    # Y axis labels
    ax.set_yticks([i + 0.5 for i in range(7)])
    ax.set_yticklabels(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], rotation=0)

    # X axis month labels
    month_starts = (
        heatmap_df.groupby(heatmap_df["completion_date"].dt.to_period("M"))["week_start"]
        .min()
        .sort_values()
        .drop_duplicates()
    )
    xticks = []
    xlabels = []
    for d in month_starts:
        if d in week_to_col:
            xticks.append(week_to_col[d] + 0.5)
            xlabels.append(d.strftime("%b"))
    ax.set_xticks(xticks)
    ax.set_xticklabels(xlabels, rotation=0)

    # Limits and style
    ax.set_xlim(0, len(week_starts))
    ax.set_ylim(0, 7)
    ax.invert_yaxis()
    ax.tick_params(axis="x", which="both", bottom=False, top=False)
    ax.set_xlabel("")
    ax.set_ylabel("")

    fig.tight_layout()

    # Return as SVG
    buf = io.StringIO()
    fig.savefig(buf, format="svg")
    plt.close(fig)
    svg = buf.getvalue()
    svg = svg.replace('<svg ', '<svg class="calendar_heatmap" ')
    return svg