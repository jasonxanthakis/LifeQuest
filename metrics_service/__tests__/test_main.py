import sys
import os
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../"))
sys.path.append(base_dir)
print(sys.path)

from app.main import app

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

client = TestClient(app)

# -----------------------------
# Test /data/is_new_user
# -----------------------------
def test_check_if_new_user():
    with patch("app.main.check_new_user", return_value=True) as mock_fn:
        response = client.get("/data/is_new_user", params={"userId": "123"})
        mock_fn.assert_called_once_with(user_id=123)
        assert response.status_code == 200
        assert response.json() == {"new": True, "test": "test"}

# -----------------------------
# Test /data/streak_summary_all
# -----------------------------
def test_best_and_current_streak():
    fake_data = {"best": 10, "current": 3}
    with patch("app.main.get_best_and_current_streak", return_value=fake_data) as mock_fn:
        response = client.get("/data/streak_summary_all", params={"userId": "42"})
        mock_fn.assert_called_once_with(user_id=42)
        assert response.status_code == 200
        assert response.json() == fake_data

# -----------------------------
# Test /data/streak_summary_one
# -----------------------------
def test_best_and_current_streak_per_quest():
    fake_data = {"best": 5, "current": 2}
    with patch("app.main.get_best_and_current_streak_by_quest", return_value=fake_data) as mock_fn:
        response = client.get("/data/streak_summary_one", params={"userId": "1", "questId": "99"})
        mock_fn.assert_called_once_with(1, 99)
        assert response.status_code == 200
        assert response.json() == fake_data

# -----------------------------
# Test /charts/calendar-all.svg
# -----------------------------
def test_multiquest_heatmap():
    fake_svg = "<svg>FAKE</svg>"
    with patch("app.main.load_all_user_quest_completions", return_value="fake_df") as mock_load, \
         patch("app.main.plot_multiquest_heatmap", return_value=fake_svg) as mock_plot:
        response = client.get("/charts/calendar-all.svg", params={"userId": "7"})
        mock_load.assert_called_once_with(user_id=7)
        mock_plot.assert_called_once_with(df="fake_df", user_id=7)
        assert response.status_code == 200
        assert response.text == fake_svg
        assert response.headers["content-type"] == "image/svg+xml"

# -----------------------------
# Test /charts/calendar-one.svg
# -----------------------------
def test_single_quest_heatmap():
    fake_svg = "<svg>ONE</svg>"
    with patch("app.main.load_user_quest_completions", return_value="fake_df") as mock_load, \
         patch("app.main.plot_single_quest_heatmap", return_value=fake_svg) as mock_plot:
        response = client.get("/charts/calendar-one.svg", params={"userId": "3", "questId": "11"})
        mock_load.assert_called_once_with(user_id=3, quest_id=11)
        mock_plot.assert_called_once_with(df="fake_df", user_id=3, quest_id=11)
        assert response.status_code == 200
        assert response.text == fake_svg
        assert response.headers["content-type"] == "image/svg+xml"