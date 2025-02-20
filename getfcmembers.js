const fs = require('fs');
const yaml = require('js-yaml');
const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();

// Load the config file
const config = yaml.load(fs.readFileSync('config.yaml', 'utf8'));
const FCID = config.FCID;

// Open the database
const db = new sqlite3.Database('characters.db');

const url = `https://na.finalfantasyxiv.com/lodestone/freecompany/${FCID}/member/`;

axios.get(url)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);

    const members = [];
    const timestamp = new Date().toISOString();

    // Extract the Free Company name
    const freecompany = $('.entry__freecompany__name').text().trim();

    $('.entry').each((index, element) => {
      const memberName = $(element).find('.entry__name').text().trim();
      const memberWorld = $(element).find('.entry__world').text().trim();
      const memberLink = $(element).find('.entry__bg').attr('href');
      const memberID = Number(memberLink ? memberLink.match(/\d+/)[0] : null);
      
      if (memberName && memberID) {
        members.push({ ID: memberID, name: memberName, world: memberWorld, freecompany: freecompany, FCID: FCID, last_scanned: timestamp });
      }
    });

    // Insert the data into the database
    const stmt = db.prepare("INSERT OR REPLACE INTO characters (ID, name, world, freecompany, FCID, last_scanned) VALUES (?, ?, ?, ?, ?, ?)");
    members.forEach(member => {
      stmt.run(member.ID, member.name, member.world, member.freecompany, member.FCID, member.last_scanned);
    });
    stmt.finalize();

    console.log('Data inserted into the database:', members);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  })
  .finally(() => {
    // Close the database
    db.close();
  });