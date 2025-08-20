const db = require('../database/connect');
const bcrypt = require('bcrypt');
//const jwt = require('jsonwebtoken');

class User {
    #password;

    constructor({ id, full_name, username, password, email, date_of_birth }) {
        this.id = id;
        this.full_name = full_name;
        this.username = username;
        this.#password = password;
        this.email = email;
        this.date_of_birth = date_of_birth;
    }

    static async getOneById(id) {
        const response = await db.query("SELECT * FROM users WHERE id = $1;", [id]);
        if (response.rows.length != 1) {
            throw new Error("Unable to locate user.");
        }
        return new User(response.rows[0]); 
    }

    static async getOneByUsername(username) {
        const response = await db.query('SELECT * FROM users WHERE username = $1;', [username]);
        if (response.rows.length != 1) {
            throw new Error('Unable to locate user.');
        }
        return new User(response.rows[0]);
    }

    static async create(data) {
        const { fullname, username, hashedPassword, email, date_of_birth } = data;
        
        const length = (await db.query('SELECT * FROM users WHERE username = $1;', [username])).rows.length;
        
        if (length != 0) throw new Error('Username already exists. Please choose another one.');

        const response = await db.query(
            'INSERT INTO users (full_name, username, password, email, date_of_birth) VALUES ($1, $2, $3, $4, $5) RETURNING id;', 
            [fullname, username, hashedPassword, email, date_of_birth]
        );

        const newId = response.rows[0].id;
        return await User.getOneById(newId);
    }

    async destroy() {
        return db.query('DELETE FROM users WHERE id = $1;', [this.id])
    }

    comparePassword(password){
        return bcrypt.compare(password, this.#password);
    }

    /*
    async generateJwt(){
        return jwt.sign({
            id: this.id
        }, process.env.SECRET_TOKEN, {expiresIn: 60 * 60 * 24 * 30});
    } */
    
}

module.exports = User;
