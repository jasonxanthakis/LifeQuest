module.exports = {
    verbose: true,
    detectOpenHandles: true,
    coverageDirectory: "coverage",
    collectCoverage: true,
    projects: [
    {
        // No DB setup
        displayName: "unit",
        testMatch: [
            "<rootDir>/__tests__/db-unit/**/*.test.js",
            "<rootDir>/__tests__/server-controller-unit/**/*.test.js",
            "<rootDir>/__tests__/server-core-unit/**/*.test.js",
            "<rootDir>/__tests__/server-model-unit/**/*.test.js"
        ],
        setupFilesAfterEnv: [],
        testEnvironment: "node",
        testPathIgnorePatterns: [
            "/node_modules/",
            "/__tests__/jest.setup.js"
        ],
    },
    {
        // DB setup
        displayName: "integration",
        testMatch: [
            "<rootDir>/__tests__/integration/integration-db/**/*.test.js",
            "<rootDir>/__tests__/integration/integration-flow/**/*.test.js",
            "<rootDir>/__tests__/integration/integration-middleware/**/*.test.js"
        ],
        setupFilesAfterEnv: ["<rootDir>/__tests__/jest.setup.js"],
        testEnvironment: "node",
        testTimeout: 30000, // allow time for ephemeral Postgres
        testPathIgnorePatterns: [
            "/node_modules/"
        ],
    }
    ]
};