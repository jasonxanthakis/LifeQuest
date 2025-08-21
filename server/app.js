const express = require('express');
const cors = require('cors');

const logger = require('./middleware/logger.js')

const userRouter = require('./routers/user.js');
const heroRouter = require('./routers/hero.js');
const questRouter = require('./routers/quest.js');
const dungeonRouter = require('./routers/dungeon.js');

const app = express();
app.use(express.json());

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-Requested-With', 'Authorization'],
  credentials: false, // change to true if you want to allow cookies
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(logger);

app.get("/", (req, res) => {
  res.status(200).json({
    title: "LifeQuest API",
    description: "Route endpoint for API"
  })
})

app.use('/user', userRouter);
// app.use('/hero', heroRouter);
// app.use('/main', questRouter);
app.use('/dungeon', dungeonRouter);

module.exports = app;