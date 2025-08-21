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

    static async create({title, description, category, points, completed}){
        const res = await db.query("INSERT INTO quests (quest_title, description, category, point_value, completed) VALUES ($1, $2, $3, $4, $5) RETURNING *;", 
            [title, description, category, points, completed]
        );
        if(res.rows.length === 0) 
            throw new Error("Couldn't create quest.")

        return new Quest(res.rows[0]);
    }

    static async getByUserId(uid) {
        const res = await db.query("SELECT * FROM quests WHERE id = $1;", [uid]);
        if(res.rows.length === 0) throw new Error('Quest not found.');
        return new Quest(res.rows[0]);
    }

    static async getByQuestId(qid) {
        const res = await db.query("SELECT * FROM quests WHERE id = $1;", [uid]);
        if(res.rows.length === 0) throw new Error('Quest not found.');
        return new Quest(res.rows[0]);
    }
    }


