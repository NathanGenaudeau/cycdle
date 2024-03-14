import got from 'got';
import { JSDOM } from 'jsdom';
import fs from 'fs/promises';
import alasql from 'alasql';
import { v4 as uuidv4 } from 'uuid';

async function ridersURL(teamlevel, file) {
  try {
    let nbResults= 0;
    let offset = 0;
    do {
      const response = await got(`https://www.procyclingstats.com/rankings.php?offset=${offset}&teamlevel=${teamlevel}&filter=Filter`);

      const page = new JSDOM(response.body).window.document;
      nbResults = parseInt(page.querySelector('b').textContent.split('/')[0], 10);
      const rows = page.querySelectorAll('tbody tr');
      rows.forEach(async (line) => {
        const url = line.querySelector('td:nth-child(4) a').href;
        await fs.appendFile(file, `${url}\n`);
      });
      offset = parseInt(rows[rows.length - 1].querySelector('td:nth-child(1)').textContent.trim(), 10)

    } while (nbResults === 100);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function ridersInfo(urls) {
  try {
    alasql(`CREATE FILESTORAGE DATABASE IF NOT EXISTS mydb("./src/api/db.json");
    ATTACH FILESTORAGE DATABASE mydb("./src/api/db.json");
    USE mydb;
    SOURCE "./src/api/createDB.sql";`);

    for (const url of urls) {
      const teamLevel = url.includes('WT') ? 'WT' : 'PRT';
      const file = await fs.readFile(url, 'utf-8');

      for (const riderUrl of file.split('\n')) {
        const response = await got(riderUrl);
        const page = new JSDOM(response.body).window.document;
        
        const uuid = uuidv4();
        const name = page.querySelector('h1').textContent.replace('  ', ' ');
        const team = page.querySelector('.red.hideIfMobile').textContent;
        const infos = page.querySelector('.rdr-info-cont').innerHTML.split('<br>');
        const age = infos[0].split('(')[1].split(')')[0];
        const nationality = infos[1].split('href')[1].split('>')[1].split('<')[0];
        const weight = infos[2].includes('Weight') ? infos[2].split('Weight')[1].split('>')[1].split('kg')[0].trim() : null;
        const height = infos[2].includes('Height') ? infos[2].split('Height')[1].split('>')[1].split('m')[0].trim() : null;

        const profile = page.querySelector('.pps').innerHTML.split('<li>').slice(1);
        const specialities = [];
        profile.forEach((element) => specialities.push(parseInt(element.split('width: ')[1].split('%')[0], 10)));

        const kpis = [];
        const keyStats = page.querySelector('.rider-kpi').innerHTML.split('<li').slice(1);
        keyStats.forEach((element) => {
          const value = parseInt(element.split('nr')[1].split('>')[1].split('<')[0], 10);
          kpis.push(value);
        });

        alasql('INSERT INTO rider VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [uuid, name, team, teamLevel, age, nationality, weight, height, specialities[0], specialities[1], specialities[2], specialities[3], specialities[4], kpis[0], kpis[1], kpis[2]]);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}
// Retrieve profile URLs of the riders from ProCyclingStats
//await ridersURL(1, 'src/api/data/ridersWT.txt'); // 1 for World Tour, 2 for ProTeam
//await ridersURL(2, 'src/api/data/ridersPRT.txt');
//await ridersInfo(['src/api/data/ridersWT.txt', 'src/api/data/ridersPRT.txt']);