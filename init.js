const fs = require('fs');
const path = require('path');
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

// Create a blank config.yaml file if it doesn't exist
const configPath = path.join(__dirname, 'config.yaml');
if (!fs.existsSync(configPath)) {
  const defaultConfig = `
# Find your FC's ID in the Lodestone URL
# Example: https://na.finalfantasyxiv.com/lodestone/freecompany/{yourFCIDisHere}/
FCID: 'your-free-company-id-here'
# Get a bot token and client ID here: https://discord.com/developers/applications
BOT_TOKEN: 'your-bot-token-here'
CLIENT_ID: 'your-client-id-here'
# Get your guild ID by right-clicking on your server and clicking "Copy Server ID"
GUILD_ID: 'your-guild-id-here'
  `;
  fs.writeFileSync(configPath, defaultConfig.trim());
  console.log('Created blank config.yaml file. Please fill in the required details.');
} else {
  console.log('config.yaml file already exists.');
}