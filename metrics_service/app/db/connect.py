import psycopg
import os
from dotenv import load_dotenv
from pathlib import Path

def get_connection():
    env_path = Path(__file__).parent / "../../.env"
    env_path = env_path.resolve()
    load_dotenv(dotenv_path=env_path)

    DATABASE_URL = os.getenv("DB_URL")

    return psycopg.connect(DATABASE_URL, autocommit=True)