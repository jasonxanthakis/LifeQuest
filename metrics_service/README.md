# LifeQuest Data API Server Microservice

This is the data microservice API of the LifeQuest application, responsible for pushing data and data visualisations (in the form of SVGs) to the frontend. It is built using Python and FastAPI and uses matplotlib and seaborn to generate plots and send them to the front-end in SVG format. It also contains a script used to generate mock users (with Faker) that have been 'using' the app for 100 days, for the sake of testing and demonstrating the functionlity of the metrics page. It is currently hosted on [Render](https://lifequest-metrics.onrender.com).

## Prerequisites
- Python 3
- Docker (for containerisation)

## How to Run Locally
1. Clone this repository to your local machine
2. Change directory to the metrics_service folder using the `cd ./metrics_service` command
3. Create a python virtual library with the command `python -m venv <your-venv-name>` (optional)
    - Optional: you can also set up and activate a conda environment or use your global environment instead
4. Activate your virtual environment with `source ./<your-venv-name>/Scripts/activate` for BASH and command prompt users (optional)
    - Note: PowerShell users must instead call the file directly `./<your-venv-name>/Scripts/activate.ps1`
    - Note: Users who created a conda environment or are using the global python environment should ignore instruction 4
5. Run the command `pip install -r requirements.txt` to install all python libraries needed to run
    - Optional: if you want to run the tests and the Faker script, run the command `pip install -r requirements-dev.txt` instead
6. To run the server use one of these commands: `python ./app/main.py` or `uvicorn app.main:app --host 0.0.0.0 --port 8000`
    - Optional: you can also try running it in dev mode with the command `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` (unreliable)

## Testing
1. Follow steps 1-4 in the above section
2. Use the command `pytest` to run all unit and integration tests
    - Note: use the command `pytest --cov` to run the tests with a coverage report