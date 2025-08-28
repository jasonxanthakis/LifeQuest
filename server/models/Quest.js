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
    constructor({ id, user_id, quest_title, description, category, points_value, completed }){
        this.id = id;
        this.user_id = user_id;
        this.title = quest_title;
        this.description = description;
        this.category = category;
        this.points = points_value;
        this.completed = completed;
    }

    // Get hero by username
    static async getUserIdByUsername(username) {
        const response = await db.query("SELECT id FROM users WHERE username = $1;", [username]);
        
        if (response.rowCount != 1) throw new Error('Database failed to find specified user...');

        return response.rows[0].id;
    }

    static async create({ user_id, title, description, category, points_value, completed}){
        const res = await db.query("INSERT INTO quests (user_id, quest_title, description, category, points_value, completed) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;", 
            [user_id, title, description, category, points_value, completed]
        );
        if(res.rows.length === 0) throw new Error("Couldn't create quest.")

        return new Quest(res.rows[0]);
    }

   static async getById(qid) {
        const res = await db.query("SELECT * FROM quests WHERE id = $1;", [qid]);
        if(res.rows.length === 0) throw new Error('Quest not found.');
        return new Quest(res.rows[0]);
    }

    static async getByUserId(uid) {
        const res = await db.query("SELECT * FROM quests WHERE user_id = $1;", [uid]);
        return res.rows.map(row => new Quest(row));
    }

    static async getByUserAndQuest(uid, qid) {
        const res = await db.query("SELECT * FROM quests WHERE id = $1 AND user_id = $2;", [qid, uid]);
        if(res.rows.length === 0) throw new Error('Quest not found');
        return new Quest(res.rows[0]);
    }

    // Quest toggled to complete on front-end
    async setCompleted(completed) {
    const res = await db.query(
        "UPDATE quests SET completed = $1 WHERE id = $2 AND user_id = $3 RETURNING *;",
        [completed, this.id, this.user_id]
    );
    if (res.rows.length === 0) throw new Error("Quest not found or not updated.");

    const row = res.rows[0];
  
    this.title = row.quest_title;
    this.description = row.description;
    this.category = row.category;
    this.points = row.points_value;
    this.completed = row.completed;

    return this;
    }


    async quest_completed() {
        const res = await db.query("UPDATE user_quest_streaks SET active_streak = 1 WHERE user_id = $1 AND quest_id = $2 RETURNING *;", // active_streak is BOOLEAN so = 1 will set this to TRUE
            [this.user_id, this.id]
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
        await db.query('DELETE FROM quest_completion_summary WHERE quest_id = $1;', [this.id]);
        await db.query('DELETE FROM quest_completions WHERE quest_id = $1;', [this.id]);
        return await db.query('DELETE FROM quests WHERE id = $1;', [this.id]);
    }
}

module.exports = Quest

