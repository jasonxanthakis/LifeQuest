import sys
import os
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../"))
sys.path.append(base_dir)
print(sys.path)

import pytest
from unittest.mock import patch, MagicMock
from app.db import connect

def test_get_connection_uses_database_url_from_env(monkeypatch):
    # Arrange: fake DB URL
    fake_url = "postgresql://testuser:testpass@localhost:5432/testdb"
    monkeypatch.setenv("DB_URL", fake_url)

    # Mock connection object
    mock_conn = MagicMock()

    # IMPORTANT: patch inside connect.py namespace
    with patch("app.db.connect.psycopg.connect", return_value=mock_conn) as mock_connect:
        # Act
        conn = connect.get_connection()

        # Assert
        mock_connect.assert_called_once_with(fake_url, autocommit=True)
        assert conn is mock_conn
