import got from 'got';
import { JSDOM } from 'jsdom';
import fs from 'fs/promises';
import alasql from 'alasql';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Build database with the URL given in the files.
 * @param {*} urls Rider's urls
 */
async function parseRiderDetails(page) {
  const uuid = uuidv4();
  const name = page.querySelector('h1')?.textContent.replace('  ', ' ').normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/\u0142/g, "l").replace(/\u00f8/g, "o").replace(/\u00e6/g, "ae");
  const infos = page.querySelector('.borderbox.left.w65')?.innerHTML.split('<ul');
  const deathIncrement = infos[2].includes('Passed away') ? 1 : 0;
  const flag = infos[2 + deathIncrement].split('flag')[1].split('"')[0].trim();
  const nationality = infos[2 + deathIncrement].split('href')[1].split('>')[1].split('<')[0];

  const photo = page.querySelector('.borderbox.left.w30.mr5').querySelector('img');
  
  let img64 = null;
  if (photo) {
    const { buffer } = await got(photo.src).buffer();
    const imgUrl = `img/${name.replaceAll(' ', '-').toLocaleLowerCase()}.jpg`;
    await fs.writeFile(`./src/api/data/${imgUrl}`, Buffer.from(buffer));
    img64 = `${process.env.VITE_API_BASE_URL}/${imgUrl}`;
  }

  const profile = page.querySelector('.pps.list').innerHTML.split('<li').slice(1);
  const specialities = [];
  profile.forEach((element) => {
    const value = parseInt(element.split('class="w')[1].split('bg')[0], 10);
    specialities.push(value === 0 ? 1 : value); // put a minimal of 1 to be represented in the BarChart
  });
  const sumSpecialities = specialities.reduce((acc, cur) => acc + cur, 0);

  const kpis = [];
  const keyStats = page.querySelector('.rider-kpi').innerHTML.split('<li').slice(1);
  keyStats.forEach((element) => {
    kpis.push(parseInt(element.split('kpi')[1].split('>')[1].split('<')[0], 10));
  });

  return [
    uuid, name, img64, nationality, flag,
    kpis[0], kpis[1], kpis[2],
    specialities[0], specialities[1], specialities[2], specialities[3], specialities[4], specialities[5], sumSpecialities
  ];
}

async function ridersInfo(url) {
  try {
    alasql(`CREATE FILESTORAGE DATABASE IF NOT EXISTS mydb2("./src/api/db2.json");
    ATTACH FILESTORAGE DATABASE mydb2("./src/api/db2.json");
    USE mydb2;
    SOURCE "./src/api/createDBTDF.sql";`);

    const file = await fs.readFile(url, 'utf-8');
    const riders = JSON.parse(file);
    riders.forEach(async (rider) => {
      const response = await got(rider.url);
      const page = new JSDOM(response.body).window.document;
      const riderData = await parseRiderDetails(page);
      riderData.push(rider.jersey, rider.year, rider.url); // Add jersey, year, name and url to the data
      alasql('INSERT INTO riderTDF VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', riderData);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Retrieve all informations for a temporary database for the TDF
 */
async function ridersTDF() {
  try {
    const data = await got('https://fr.wikipedia.org/wiki/Palmar%C3%A8s_du_Tour_de_France');
    const page = new JSDOM(data.body).window.document;
    const table = page.querySelector('.wikitable');
    const rows = table.querySelectorAll('tr');
    const filteredRows = Array.from(rows).slice(34);

    const ridersArray = [];
    filteredRows.forEach(async (row) => {
      const cells = row.querySelectorAll('td');
      const jersey = ['yellow', 'kom', 'green', 'white', 'combativity'];
      // case 1 = jaune, 10 = à pois, 11 = vert, 12 = blanc, 13 = combatif
      const riders = [
        cells[1].textContent.split('[')[0].trim(),
        cells[10].textContent.split('[')[0].trim(),
        cells[11].textContent.split('[')[0].trim(),
        cells[12].textContent.split('[')[0].trim(),
        cells[13].textContent.split('[')[0].trim()
      ];
      for (const [index, riderName] of riders.entries()) {
        if (riderName) {
          const riderUrl = `https://www.procyclingstats.com/rider/${riderName.replace(/ /g, '-').toLowerCase()}`;
          const response = await got(riderUrl);
          const riderPage = new JSDOM(response.body).window.document;
          const name = riderPage.querySelector('h1')?.textContent.replace('  ', ' ').normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/\u0142/g, "l").replace(/\u00f8/g, "o").replace(/\u00e6/g, "ae");
          ridersArray.push({
            name: riderName,
            url: name === riderName.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/\u0142/g, "l").replace(/\u00f8/g, "o").replace(/\u00e6/g, "ae") ? riderUrl : 'bug',
            year: cells[0].textContent.split(' ')[0].trim(),
            jersey: jersey[index]
          });
        }
      }
      await fs.writeFile('./src/api/data/ridersTDF.json', JSON.stringify(ridersArray), { flag: 'w+' });
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}
//await ridersTDF();

await ridersInfo('./src/api/data/ridersTDF.json');