import sys
import os
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../"))
sys.path.append(base_dir)
print(sys.path)

import matplotlib
matplotlib.use("Agg")

import pytest
from unittest.mock import patch, MagicMock
import pandas as pd
from datetime import datetime, timedelta, date

from app.graphs import (
    check_new_user,
    get_best_and_current_streak,
    get_best_and_current_streak_by_quest,
    load_all_user_quest_completions,
    load_user_quest_completions,
    plot_multiquest_heatmap,
    plot_single_quest_heatmap
)

# ------------------------------
# Extract Data from Database
# ------------------------------

@patch("app.graphs.connect.get_connection")
@patch("app.graphs.pd.read_sql")
def test_check_new_user_new_user(mock_read_sql, mock_connect):
    """
    When the user has no quest completions, check_new_user should return True.
    """
    # Mock pd.read_sql to return empty DataFrame
    mock_read_sql.return_value = pd.DataFrame()

    # Mock connection context manager
    mock_conn = MagicMock()
    mock_connect.return_value.__enter__.return_value = mock_conn

    result = check_new_user("user_123")
    assert result is True


@patch("app.graphs.connect.get_connection")
@patch("app.graphs.pd.read_sql")
def test_check_new_user_existing_user(mock_read_sql, mock_connect):
    """
    When the user has completions, check_new_user should return False.
    """
    # Mock pd.read_sql to return a non-empty DataFrame
    mock_read_sql.return_value = pd.DataFrame({
        "quest_id": [1, 2],
        "completion_date": ["2025-08-01", "2025-08-02"]
    })

    # Mock connection context manager
    mock_conn = MagicMock()
    mock_connect.return_value.__enter__.return_value = mock_conn

    result = check_new_user("user_456")
    assert result is False

@patch("app.graphs.connect.get_connection")
def test_get_best_and_current_streak_found(mock_connect):
    """
    When the user has a best streak, should return the streak info.
    """
    # Mock cursor and its fetchone() return value
    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = (7, "Quest of Legends")

    # Mock connection and context manager
    mock_conn = MagicMock()
    mock_conn.cursor.return_value.__enter__.return_value = mock_cursor
    mock_connect.return_value.__enter__.return_value = mock_conn

    result = get_best_and_current_streak(user_id=1)
    assert result == {"best_streak": 7, "quest_title": "Quest of Legends"}


@patch("app.graphs.connect.get_connection")
def test_get_best_and_current_streak_none(mock_connect):
    """
    When the user has no streaks, should return an empty dict.
    """
    # Mock cursor and fetchone() returning None
    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = None

    mock_conn = MagicMock()
    mock_conn.cursor.return_value.__enter__.return_value = mock_cursor
    mock_connect.return_value.__enter__.return_value = mock_conn

    result = get_best_and_current_streak(user_id=42)
    assert result == {}

@patch("app.graphs.connect.get_connection")
@patch("app.graphs.datetime")  # mock datetime for deterministic 'today'
def test_get_best_and_current_streak_by_quest_with_date(mock_datetime, mock_connect):
    """
    User has best/current streak and a last completion date.
    """
    # Mock 'today' date
    mock_datetime.today.return_value = datetime(2025, 8, 28)

    # Mock cursor fetchone returning a date 3 days ago
    last_completed = date(2025, 8, 25)
    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = (5, 3, last_completed)

    mock_conn = MagicMock()
    mock_conn.cursor.return_value.__enter__.return_value = mock_cursor
    mock_connect.return_value.__enter__.return_value = mock_conn

    result = get_best_and_current_streak_by_quest(user_id=1, quest_id=1)
    assert result == {
        "best_streak": 5,
        "current_streak": 3,
        "last_completion": "3 days ago"
    }


@patch("app.graphs.connect.get_connection")
@patch("app.graphs.datetime")
def test_get_best_and_current_streak_by_quest_none_date(mock_datetime, mock_connect):
    """
    User has streak but last_completed_date is None.
    """
    mock_datetime.today.return_value = datetime(2025, 8, 28)

    mock_cursor = MagicMock()
    mock_cursor.fetchone.return_value = (2, 1, None)

    mock_conn = MagicMock()
    mock_conn.cursor.return_value.__enter__.return_value = mock_cursor
    mock_connect.return_value.__enter__.return_value = mock_conn

    result = get_best_and_current_streak_by_quest(user_id=2, quest_id=5)
    assert result == {
        "best_streak": 2,
        "current_streak": 1,
        "last_completion": "0 days ago"
    }


@patch("app.graphs.connect.get_connection")
@patch("app.graphs.pd.read_sql")
def test_load_all_user_quest_completions_empty(mock_read_sql, mock_connect):
    # Provide empty DataFrame with correct columns
    mock_read_sql.return_value = pd.DataFrame(columns=["quest_id", "completion_date"])
    mock_conn = MagicMock()
    mock_connect.return_value.__enter__.return_value = mock_conn

    df = load_all_user_quest_completions(user_id=1)
    assert df.empty


@patch("app.graphs.connect.get_connection")
@patch("app.graphs.pd.read_sql")
def test_load_all_user_quest_completions_with_data(mock_read_sql, mock_connect):
    from app.graphs import load_all_user_quest_completions
    import pandas as pd
    from datetime import datetime

    # DataFrame with proper datetime objects
    data = {
        "quest_id": [1, 2, 3],
        "completion_date": [
            datetime(2025, 8, 1),
            datetime(2025, 5, 1),
            datetime(2024, 12, 1),
        ]
    }
    mock_read_sql.return_value = pd.DataFrame(data)

    # Mock connection
    mock_conn = MagicMock()
    mock_connect.return_value.__enter__.return_value = mock_conn

    # Patch pd.Timestamp to control "today"
    with patch("app.graphs.pd.Timestamp", side_effect=lambda x: pd.Timestamp("2025-08-28") if x == "today" else pd.Timestamp(x)):
        df = load_all_user_quest_completions(user_id=1, months=6)

    # Only rows within last 6 months
    assert len(df) == 2
    assert df["completion_date"].min() >= pd.Timestamp("2025-02-28")

@patch("app.graphs.connect.get_connection")
@patch("app.graphs.pd.read_sql")
def test_load_user_quest_completions_empty(mock_read_sql, mock_connect):
    """
    DB returns empty DataFrame → function should return empty DataFrame.
    """
    mock_read_sql.return_value = pd.DataFrame(columns=["completion_date", "status", "points_earned"])
    mock_conn = MagicMock()
    mock_connect.return_value.__enter__.return_value = mock_conn

    df = load_user_quest_completions(user_id=1, quest_id=1)
    assert df.empty


@patch("app.graphs.connect.get_connection")
@patch("app.graphs.pd.read_sql")
def test_load_user_quest_completions_with_data(mock_read_sql, mock_connect):
    """
    DB returns several completions; ensure filtering by months works.
    """
    data = {
        "completion_date": [
            datetime(2025, 8, 1),
            datetime(2025, 5, 1),
            datetime(2024, 12, 1),
        ],
        "status": ["done", "done", "done"],
        "points_earned": [10, 5, 8],
    }
    mock_read_sql.return_value = pd.DataFrame(data)

    mock_conn = MagicMock()
    mock_connect.return_value.__enter__.return_value = mock_conn

    # Patch pd.Timestamp to fix "today" for cutoff
    with patch("app.graphs.pd.Timestamp", side_effect=lambda x: pd.Timestamp("2025-08-28") if x=="today" else pd.Timestamp(x)):
        df = load_user_quest_completions(user_id=1, quest_id=1, months=6)

    # Only rows within last 6 months
    assert len(df) == 2
    assert df["completion_date"].min() >= pd.Timestamp("2025-02-28")

# ------------------------------
# Plot Graphs
# ------------------------------

def test_plot_multiquest_heatmap_empty():
    df = pd.DataFrame(columns=["completion_date", "quest_id"])
    svg = plot_multiquest_heatmap(df, user_id=1)
    assert "<svg" in svg
    assert "No completions available" in svg


def test_plot_multiquest_heatmap_with_data():
    data = {
        "completion_date": [
            datetime(2025, 8, 25),
            datetime(2025, 8, 26),
            datetime(2025, 8, 27),
        ],
        "quest_id": [1, 2, 1],
    }
    df = pd.DataFrame(data)
    svg = plot_multiquest_heatmap(df, user_id=1)
    assert "<svg" in svg
    assert 'class="calendar_heatmap"' in svg

def test_plot_single_quest_heatmap_empty():
    df = pd.DataFrame(columns=["completion_date", "quest_id"])
    svg = plot_single_quest_heatmap(df, user_id=1, quest_id=1)
    assert "<svg" in svg
    assert "No completions available" in svg


def test_plot_single_quest_heatmap_with_data():
    data = {
        "completion_date": [
            datetime(2025, 8, 25),
            datetime(2025, 8, 26),
            datetime(2025, 8, 27),
        ],
        "quest_id": [1, 1, 1],
    }
    df = pd.DataFrame(data)
    svg = plot_single_quest_heatmap(df, user_id=1, quest_id=1)
    assert "<svg" in svg
    assert 'class="calendar_heatmap"' in svg