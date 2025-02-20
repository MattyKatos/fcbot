const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scrapecharacter')
    .setDescription('Scrape character details')
    .addStringOption(option =>
      option.setName('charid')
        .setDescription('The character ID')
        .setRequired(true)),
  async execute(interaction) {
    const charID = interaction.options.getString('charid');
    const url = `https://na.finalfantasyxiv.com/lodestone/character/${charID}/`;
    const userID = interaction.user.id; // Get the Discord ID of the user who invoked the command

    const db = new sqlite3.Database('characters.db');

    try {
      const response = await axios.get(url);
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
        characters.push({ ID: charID, name: charName, world: charWorld, freecompany: freecompany, FCID: FCID, last_scanned: timestamp, DID: userID });
      }

      // Insert the data into the database
      const stmt = db.prepare("INSERT OR REPLACE INTO characters (ID, name, world, freecompany, FCID, last_scanned, DID) VALUES (?, ?, ?, ?, ?, ?, ?)");
      characters.forEach(character => {
        stmt.run(character.ID, character.name, character.world, character.freecompany, character.FCID, character.last_scanned, character.DID);
      });
      stmt.finalize();

      await interaction.reply(`Scraped character: ${characters.map(c => c.name).join(', ')}`);
    } catch (error) {
      console.error('Error fetching data:', error);
      await interaction.reply('Failed to scrape character.');
    } finally {
      db.close();
    }
  },
};