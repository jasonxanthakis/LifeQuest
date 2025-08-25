const { GenericContainer } = require("testcontainers");
const { Pool } = require("pg");
// const db = require("../database/connect");

let container;
let pool;

beforeAll(async () => {
    // Start a Postgres container
    container = await new GenericContainer("postgres")
        .withExposedPorts(5432)
        .withEnv("POSTGRES_PASSWORD", "test")
        .withEnv("POSTGRES_USER", "test")
        .withEnv("POSTGRES_DB", "testdb")
        .start();

    const port = container.getMappedPort(5432);
    const host = container.getHost();

    // Create a pg connection pool
    pool = new Pool({
        user: "test",
        password: "test",
        host,
        port,
        database: "testdb",
    });

    // Run your schema SQL (apply migrations)
    const schemaSql = require("fs").readFileSync("./database/database.sql").toString();
    await pool.query(schemaSql);

    // Make the pool available globally to tests
    global.db = pool;
}, 30000);  // manually set timeout to 30s

afterEach(async () => {
    // Reset tables between tests (truncate all but reference tables)
    await pool.query("TRUNCATE users, quests, user_quest_streaks, hero, battle, hero_items RESTART IDENTITY CASCADE");
});

afterAll(async () => {
    await pool.end();
    await container.stop();
});