from fastapi import FastAPI, Response
from app.graphs import *

app = FastAPI()

@app.get("/data/streak_summary_all")
def best_and_current_streak(userId: str):
    data = get_best_and_current_streak(int(userId))
    return data

@app.get("/data/streak_summary_one")
def best_and_current_streak_per_quest(userId: str, questId: str):
    data = get_best_and_current_streak_by_quest(int(userId), int(questId))
    return data

@app.get("/charts/calendar-all.svg")
def multiquest_heatmap(userId: str):
    df = load_all_user_quest_completions(user_id=int(userId))
    svg = plot_multiquest_heatmap(df=df, user_id=int(userId))
    return Response(content=svg, media_type="image/svg+xml")

@app.get("/charts/calendar-one.svg")
def multiquest_heatmap(userId: str, questId: str):
    df = load_user_quest_completions(user_id=int(userId), quest_id=int(questId))
    svg = plot_single_quest_heatmap(df=df, user_id=int(userId), quest_id=int(questId))
    return Response(content=svg, media_type="image/svg+xml")