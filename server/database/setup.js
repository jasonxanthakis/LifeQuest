require("dotenv").config();
const fs = require('fs');
const db = require('./connect');

async function setUpDatabase() {
  const sql = fs.readFileSync('./database/database.sql').toString();

  await db.query(sql)
    .then(data => console.log("Set-up complete."))
    .catch(error => console.log(error));

  db.end();
}

if (require.main === module) {
    setUpDatabase();
}

module.exports = setUpDatabase;