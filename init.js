const sqlite3 = require('sqlite3').verbose();

// Open the database
const db = new sqlite3.Database('characters.db');

// Create the table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS characters (
    ID INTEGER PRIMARY KEY,
    name TEXT,
    world TEXT,
    freecompany TEXT,
    FCID INTEGER,
    DID TEXT,
    ismaincharacter BOOLEAN,
    last_scanned TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Table created or already exists.');
    }
    db.close();
  });
});