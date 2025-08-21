    const express = require('express');
    const cors = require('cors');
    const bodyParser = require('body-parser');
    const { Pool } = require('pg');
    require('dotenv').config();

    const app = express();
    const port = 3000;

    // Middleware
    app.use(cors());
    app.use(bodyParser.json());

    // PostgreSQL connection
    const pool = new Pool({
    connectionString: process.env.DB_URL, // your DB_URL
    });

    // GET all quests
    app.get('/quests', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM quests ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
    });

    // POST new quest
    app.post('/quests', async (req, res) => {
    const { quest_title, description, category, points_value } = req.body;
    const points = points_value || 10; // default to 10 if not provided

    if (!quest_title || !description || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await pool.query(
        'INSERT INTO quests (quest_title, description, category, points_value) VALUES ($1, $2, $3, $4) RETURNING *',
        [quest_title, description, category, points]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database insert error' });
    }
    });

    // Start server
    app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    });
