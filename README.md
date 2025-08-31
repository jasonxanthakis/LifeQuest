# LifeQuest

LifeQuest is desktop and mobile web app designed and built by the ByteQuest developer team. Life quest is a battle-themed gamified experience where users become the hero of their own health journey. It transforms habit-building and habit-breaking into a battle-themed gamified experience. 

### The Game
- Each player has a personalised hero and sets their own goals - whether breaking bad habits or building new healthy routines. 
- These goals turn into daily quests, and progress is tracked through a clear metrics table, giving users visibility and accountability.
- Every completed quest earns points that can be spent in the in-game shop to equip and upgrade the hero, strengthening them for future battles.  
- The user can then have the hero fight against pre-generated enemies in the dungeon. Enemies progressively grow in difficulty.
- This app makes lifestyle change engaging, rewarding, and fun and overall helps users stay motivated, and eager to keep coming back.

### ByteQuest Team
- [Jason Xanthakis](https://github.com/jasonxanthakis)
- [Ria Patterson](https://github.com/riapatterson)
- [Katelyn Lai](https://github.com/katelynlai)
- [David Buari](https://github.com/davidbuari)

## Project Folder Structure
- Each individual component to be deployed is in a separate folder. There are currently three components:
    1. The front-end website (in the `website` folder)
    2. The main API server and main gateway (in the `server` folder)
    3. The data visualisation microservice written in Python (in the `metrics_service` folder)

## How to Access the Website
- The app is currently hosted on Render's free service, which periodically shuts off unused services every 15 minutes.
- To guarantee the game starts, follow these steps:
    1. Use this [link](https://lifequest-api.onrender.com) to start up the main server
    2. Use this [link](https://lifequest-metrics.onrender.com) to start up the metrics server
    3. Use this [link](https://lifequest-bagl.onrender.com) to access the website (works on desktop, laptop and mobile)

## Existing bugs
- The main server is meant to record completed tasks every midnight (GMT). This feature is currently incomplete.
- There is meant to be a scaling factor for enemies after level 10. This feature is still in development.
- End-to-end testing with playwright was not completed.

## Future Features
### Minor improvements
- Quest streaks could offer bonus points or a multiplier
- The backend should prevent multiple users accessing an account at the same time
- Password hashing could also include a pepper
- More quest categories could be added
- More hero items could be added

### Major expansions/changes
- Quests could be predefined for consistency (minor modification based on users need should still be possible (e.g. no of cigarettes))
- Dungeon battle could change from a simulated battle to an animated battle
- The item system needs a revamp. Options include: limitations to no of equipable items, unique items, special item effects, ...
- More mechanics can be added, such as purchasable spells, skills unlocked by certain quests, unique title buffs based on achievements, ...
- Hero could be converted into an avatar. Could build on this to allow for cosmetics and third party mods