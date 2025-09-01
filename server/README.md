# LifeQuest Main API Server

This is the main server and main gateway of the LifeQuest application. All front-end HTTP requests pass through this server, acting as a main gateway. It handles the bulk of HTTP requests, and passes all requests related to data for the metrics page to the data microservice. It also handles authentication using jsonwebtoken. 

It consists of a RESTful API built using node.js and express.js. Additionally, it offers a script that sets up/resets a Postgresql database hosted on supabase. It is currently hosted on [Render](https://lifequest-api.onrender.com).

### Prerequisites
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

## Other Scripts

### Set Up / Reset the Database & Seed with Pre-Generated Items and Enemies
1. Follow steps 1-3 in the above section
2. Use the command `npm run setup-db` to run the code in the `database.sql` file in the `database` folder
    - Note: if you wish to modify the items or enemies, modify the `INSERT INTO ` queries inside the `database.sql` table

## API Documentation

The API architecture is split into 4 routers:
- User router: `/user` (for login and signup functionality)
- Quest section router: `/main` (for quests, achievements and metrics proxy)
- Hero section router: `/hero` (for handling hero invetory and the shop)
- Dungeon section router: `/dungeon` (for handling all logic related to the dungeon)

The API follows a model-controller architecture, with each router having one or more controllers and each controller using one or more models.

### API Endpoints

<details>

<summary>User Route</summary>

<br>

***POST /user/login***

| Key          | Value            | Required |
| ------------ | ---------------- | -------- |
| Content-Type | application/json | Yes      |

| Field      | Type   | Required | Description     |
| ---------- | ------ | -------- | --------------- |
| `username` | string | Yes      | User’s username |
| `password` | string | Yes      | User’s password |

| Code | Meaning               |
| ---- | --------------------- |
| 201  | Login successful      |
| 401  | Authentication failed |

| Field   | Type | Description                      |
| ------- | ---- | -------------------------------- |
| `token` | JWT  | JSON Web Token for authorization |

<br>

***POST /user/signup***

| Key          | Value            | Required |
| ------------ | ---------------- | -------- |
| Content-Type | application/json | Yes      |

| Field           | Type   | Required | Description      |
| --------------- | ------ | -------- | ---------------- |
| `fullname`      | string | Yes      | User’s full name |
| `username`      | string | Yes      | User’s username  |
| `date_of_birth` | string | Yes      | User’s date of birth |
| `email`         | string | Yes      | User’s email |
| `password`      | string | Yes      | User’s password  |

| Code | Meaning               |
| ---- | --------------------- |
| 201  | Login successful      |
| 401  | Authentication failed |

| Field   | Type | Description                      |
| ------- | ---- | -------------------------------- |
| `token` | JWT  | JSON Web Token for authorization |

</details>

<br>

<details>

<summary>Quests/Main Route</summary>

<br>

***GET /main/quests***

| Key           | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | jsonwebtoken     | Yes      |
| Content-Type  | application/json | Yes      |

*`No Request Body`*

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 500  | Error                 |

| Field           | Type    | Description                      |
| --------------- | ------- | -------------------------------- |
| `quests`        | array   | Array of user quests             |
| `hero`          | object  | Information on user's hero       |

<br>

***POST /main/quests***

| Key           | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | jsonwebtoken     | Yes      |
| Content-Type  | application/json | Yes      |

| Field           | Type   | Required | Description        |
| --------------- | ------ | -------- | ------------------ |
| `title`         | string | Yes      | Title of new quest |
| `description`   | string | Yes      | Description of new quest |
| `category`      | string | Yes      | Chosen category of new quest |

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Quest Created         |
| 400  | Quest already exists  |
| 400  | Missing input values  |
| 500  | Error                 |

| Field           | Type    | Description                      |
| --------------- | ------- | -------------------------------- |
| `user_id`       | int     | User ID                          |
| `title`         | string  | Title of new quest               |
| `description`   | string  | Description of new quest         |
| `category`      | string  | Category of new quest            |
| `points_value`  | int     | Points received for completing the new quest |
| `completed`     | boolean | Has the user completed this quest? |

<br>

***PATCH /main/quests/:questID/complete***

| Key           | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | jsonwebtoken     | Yes      |
| Content-Type  | application/json | Yes      |

| Field           | Type    | Required | Description        |
| --------------- | ------- | -------- | ------------------ |
| `completed`     | boolean | Yes      | Has the user completed this quest? |

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 400  | `completed` must be boolean   |
| 400  | Server Error          |

| Field            | Type    | Description                      |
| ---------------- | ------- | -------------------------------- |
| `completedQuest` | object  | Information on selected quest    |
| `hero`           | object  | User hero details                |

<br>

***PATCH /main/quests/:questID***

| Key           | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | jsonwebtoken     | Yes      |
| Content-Type  | application/json | Yes      |

| Field           | Type   | Required | Description        |
| --------------- | ------ | -------- | ------------------ |
| `title`         | string | Yes      | Title of modified quest |
| `description`   | string | Yes      | Description of modified quest |
| `category`      | string | Yes      | Chosen category of modified quest |

| Code | Meaning               |
| ---- | --------------------- |
| 201  | Quest Created         |
| 400  | No changes detected   |
| 400  | Server Error          |

| Field           | Type    | Description                      |
| --------------- | ------- | -------------------------------- |
| `title`         | string  | Title of modified quest          |
| `description`   | string  | Description of modified quest    |
| `category`      | string  | Category of modified quest       |

<br>

***DELETE /main/quests/:questID***

| Key           | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | jsonwebtoken     | Yes      |
| Content-Type  | application/json | Yes      |

*`No Request Body`*

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 400  | Server Error          |

| Field           | Type    | Description                      |
| --------------- | ------- | -------------------------------- |
| `deletedQuest`  | object  | An empty pg response object      |

<br>

***GET /main/achievements***

| Key           | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | jsonwebtoken     | Yes      |
| Content-Type  | application/json | Yes      |

*`No Request Body`*

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 500  | Server Error          |

| Field            | Type    | Description                      |
| ---------------- | ------- | -------------------------------- |
| `achievements`   | array   | An array of achievement objects  |
| `current_streak` | int     | The current streak               |

<br>

***GET /main/metrics/new_user***

| Key           | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | jsonwebtoken     | Yes      |
| Content-Type  | application/json | Yes      |

*`No Request Body`*

| Code | Meaning               |
| ---- | --------------------- |
| 500  | Proxy Failure         |

| Field   | Type    | Description                      |
| ------- | ------- | -------------------------------- |
| `new`   | boolean | Is this a new user (first day)?  |

<br>

***GET /main/metrics/quests***

| Key           | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | jsonwebtoken     | Yes      |
| Content-Type  | application/json | Yes      |

*`No Request Body`*

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 500  | Error                 |

| Field           | Type    | Description                      |
| --------------- | ------- | -------------------------------- |
| `quests`        | array   | Array of user quests             |
| `hero`          | object  | Information on user's hero       |

<br>

***GET /main/metrics/:questID***

| Key           | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | jsonwebtoken     | Yes      |
| Content-Type  | image/svg+xml    | Yes      |

*`No Request Body`*

| Code | Meaning               |
| ---- | --------------------- |
| 500  | Proxy Failure         |

*`Response Body contains an SVG`*

<br>

***GET /main/metrics/data/:questID***

| Key           | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | jsonwebtoken     | Yes      |
| Content-Type  | application/json | Yes      |

*`No Request Body`*

| Code | Meaning               |
| ---- | --------------------- |
| 500  | Proxy Failure         |

| Field            | Type    | Description                      |
| ---------------- | ------- | -------------------------------- |
| `best_streak`    | int     | The best streak for the quest    |
| `current_streak` | int     | The quest's current streak       |
| `last_completed` | int     | No of days since last completion (only for individual quests) |

</details>

<br>

<details>

<summary>Hero Route</summary>

<br>

***GET /hero/user/inventory***

| Key           | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | jsonwebtoken     | Yes      |
| Content-Type  | application/json | Yes      |

*`No Request Body`*

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 500  | Error                 |

| Field           | Type    | Description                      |
| --------------- | ------- | -------------------------------- |
| `items`         | array   | Array of items owned by hero     |
| `points`        | int     | Points available for hero to spend |

<br>

***GET /hero/user/shop***

| Key           | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | jsonwebtoken     | Yes      |
| Content-Type  | application/json | Yes      |

*`No Request Body`*

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 500  | Error                 |

| Field           | Type    | Description                      |
| --------------- | ------- | -------------------------------- |
| `items`         | array   | Array of items in the shop       |
| `points`        | int     | Points available for hero to spend |

<br>

***POST /hero/user/shop/item***

| Key           | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | jsonwebtoken     | Yes      |
| Content-Type  | application/json | Yes      |

| Field           | Type   | Required | Description       |
| --------------- | ------ | -------- | ----------------- |
| `itemid`        | int    | Yes      | ID of chosen item |

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 400  | Insufficient points   |
| 404  | Hero/Item not found   |
| 500  | Server Error          |

| Field           | Type    | Description                      |
| --------------- | ------- | -------------------------------- |
| `points`        | int     | Points available for hero to spend after purchase |
| `items`         | array   | Array of items in hero inventory |
| `shop_items`    | array   | Array of items in the shop       |

<br>

***PATCH /hero/user/inventory/equip***

| Key           | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | jsonwebtoken     | Yes      |
| Content-Type  | application/json | Yes      |

| Field           | Type    | Required | Description                    |
| --------------- | ------- | -------- | ------------------------------ |
| `hero_items_id` | int     | Yes      | ID of chosen item in inventory |
| `is_equipped`   | boolean | Yes      | Is the item already equipped?  |

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 404  | Item not found        |
| 500  | Error                 |

| Field           | Type    | Description                      |
| --------------- | ------- | -------------------------------- |
| `message`       | string  | `Item equipped/unequipped successfully` |

</details>

<br>

<details>

<summary>Dungeon Route</summary>

<br>

***GET /dungeon***

| Key           | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | jsonwebtoken     | Yes      |
| Content-Type  | application/json | Yes      |

*`No Request Body`*

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 400  | Failure               |

| Field           | Type    | Description                      |
| --------------- | ------- | -------------------------------- |
| `level`         | int     | Current dungeon level            |
| `hero`          | object  | User hero statistics             |
| `enemy`         | object  | Statistics of next enemy         |

<br>

***PATCH /dungeon/battle***

| Key           | Value            | Required |
| ------------- | ---------------- | -------- |
| Authorization | jsonwebtoken     | Yes      |
| Content-Type  | application/json | Yes      |

*`No Request Body`*

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 400  | Failure               |

| Field           | Type    | Description                      |
| --------------- | ------- | -------------------------------- |
| `won`           | int     | True if hero won, False if enemy won  |
| `points_gained` | object  | Points earned from battle (0 if lost) |
| `winnner`       | object  | Details of winner (hero/enemy)   |

</details>