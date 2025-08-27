const Quest = require('../models/Quest.js');

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

/**
 * Proxy request to FastAPI charts service
 */
const getGraphs = async (req, res) => {
    try {
        const username = req.user;
        const userId = await Quest.getUserIdByUsername(username);

        const questId = req.params.quest;

        let response;

        if (questId == 0) {
            const qs = new URLSearchParams({
                ...(userId && { userId: userId }),
            });

            const url = `${FASTAPI_URL}/charts/calendar-all.svg?${qs.toString()}`;

            response = await fetch(url);
        } else {
            const qs = new URLSearchParams({
                ...(userId && { userId: userId }),
                ...(questId && { questId: questId }),
            });

            const url = `${FASTAPI_URL}/charts/calendar-one.svg?${qs.toString()}`;

            response = await fetch(url);
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`FastAPI error: ${response.status} ${errorText}`);
            return res.status(response.status).send(errorText);
        }

        // Return raw SVG
        res.set("Content-Type", "image/svg+xml");
        res.send(await response.text());

    } catch (err) {
        console.error("Error fetching chart from FastAPI:", err);
        res.status(500).send("Failed to fetch chart");
    }
};

module.exports = {
    getGraphs,
};