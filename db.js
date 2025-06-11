// db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./chat.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS mensagens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    sala TEXT NOT NULL,
    texto TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;
