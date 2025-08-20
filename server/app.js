const express = require('express');
const cors = require('cors');

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

app.get("/", (req, res) => {
  res.status(200).json({
    title: "LifeQuest API",
    description: "Route endpoint for API"
  })
})

module.exports = app;