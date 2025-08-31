# LifeQuest Main API Server

This is the main server and main gateway of the LifeQuest application. All front-end HTTP requests pass through this server, acting as a main gateway. It handles the bulk of HTTP requests, and passes all requests related to data for the metrics page to the data microservice. It also handles authentication using jsonwebtoken. 

It consists of a RESTful API built using node.js and express.js. Additionally, it offers a script that sets up/resets a Postgresql database hosted on supabase. It is currently hosted on [Render](https://lifequest-api.onrender.com).

## Prerequisites
- Node.js
- Docker (for integration tests and containerisation)

## How to Run Locally
1. Clone this repository to your local machine
2. Change directory to the server folder using the `cd ./server` command
3. Run the command `npm install` to install all node module packages
    - Optional: if you don't want to run the server in dev mode or run any tests, use the command `npm install --production` instead
4. To run the server, use the command `npm start` (or `npm run dev` if you want to run it in development mode)

## Testing
1. Follow steps 1-3 in the above section
2. Use the command `npm test` to run all unit and integration tests
    - Use the command `npm test:unit` to run only the unit tests
    - Use the command `npm test:integration` to run only the integration tests
Note: the integration test use a container environment; having docker installed is a prerequisite to run them.