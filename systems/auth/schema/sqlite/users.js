module.exports = {
  users: `CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            name TEXT NOT NULL,
            password TEXT NOT NULL,
            ts Integer NOT NULL,
            role Integer NOT NULL
        );`
};
