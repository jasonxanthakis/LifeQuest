// Users to GET their quests
// GetById, GetByCateogory? (might need to analytcs), get by completed?

// Users POST their quest
// create 

// users PATCH their quests
// complete
// modify

// Users delete a quest
// destroy

const db = require('../database/connect');

class Quest {
    constructor({ id, title, description, category, points, completed }){
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.points = points;
        this.completed = completed;
    }

    static async create({ user_id, title, description, category, points, completed}){
        const res = await db.query("INSERT INTO quests (user_id, quest_title, description, category, point_value, completed) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;", 
            [user_id, title, description, category, points, completed]
        );
        if(res.rows.length === 0) 
            throw new Error("Couldn't create quest.")

        return new Quest(res.rows[0]);
    }

    static async getByUserId(uid) {
        const res = await db.query("SELECT * FROM quests WHERE user_id = $1;", [uid]);
        if(res.rows.length === 0) throw new Error('Quest not found.');
        return new Quest(res.rows[0]);
    }

    static async getByQuestId(qid) {
        const res = await db.query("SELECT * FROM quests WHERE id = $1;", [qid]);
        if(res.rows.length === 0) throw new Error('Quest not found.');
        return new Quest(res.rows[0]);
    }

    async quest_completed({uid, qid}) {
        const res = await db.query("UPDATE user_quest_streaks SET active_streak = 1, WHERE user_id = $1 & quest_id = $2 RETURNING *;", // active_streak is BOOLEAN so = 1 will set this to TRUE
            [uid, qid]
        );
        if(res.rows.length === 0) throw new Error('streak status update failed');
        return new Quest(res.rows[0]);
    }

    async modify({title, description, category}) {
        const res = await db.query('UPDATE quests SET quest_title = $1, description = $2, category = $3 WHERE id = $4 RETURNING *;',
            [title, description, category, this.id]
        );
        if(res.rows.length === 0) throw new Error('Quest update failed');
    }

    async destroy() {
        return db.query('DELETE FROM quests WHERE id = $1;', [this.id]);
    }
}

module.exports = Quest

