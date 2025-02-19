const axios = require('axios');
const cheerio = require('cheerio');
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
    last_scanned TEXT
  )`);
});

// Function to scrape character data
function scrapeCharacter(charID, callback) {
  const url = `https://na.finalfantasyxiv.com/lodestone/character/${charID}/`;

  axios.get(url)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);

      const characters = [];
      const timestamp = new Date().toISOString();

      const charName = $('.frame__chara__name').text().trim();
      const charWorld = $('.frame__chara__world').text().trim();
      const freecompanyElement = $('.character__freecompany__name a');
      const freecompany = freecompanyElement.text().trim();
      const FCID = Number(freecompanyElement.attr('href').match(/\d+/)[0]);

      if (charName && charWorld) {
        characters.push({ ID: charID, name: charName, world: charWorld, freecompany: freecompany, FCID: FCID, last_scanned: timestamp });
      }

      // Insert the data into the database
      const stmt = db.prepare("INSERT OR REPLACE INTO characters (ID, name, world, freecompany, FCID, last_scanned) VALUES (?, ?, ?, ?, ?, ?)");
      characters.forEach(character => {
        stmt.run(character.ID, character.name, character.world, character.freecompany, character.FCID, character.last_scanned);
      });
      stmt.finalize();

      console.log('Data inserted into the database:', characters);
      callback();
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      callback(error);
    });
}

// Example usage
scrapeCharacter(28440065, () => {
  // Close the database
  db.close();
});