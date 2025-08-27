from fastapi import FastAPI, Response
from app.graphs import load_all_user_quest_completions, load_user_quest_completions, plot_multiquest_heatmap, plot_single_quest_heatmap

app = FastAPI()

@app.get("/charts/calendar-all.svg")
def multiquest_heatmap(userId: str):
    df = load_all_user_quest_completions(user_id=int(userId))
    svg = plot_multiquest_heatmap(df=df, user_id=int(userId))
    return Response(content=svg, media_type="image/svg+xml")