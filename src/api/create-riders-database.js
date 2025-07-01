import got from 'got';
import { JSDOM } from 'jsdom';
import fs from 'fs/promises';
import alasql from 'alasql';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Retrieves URL of riders from ProCyclingStats website which will be used to build the database
 * @param {*} teamlevel Level of the team (1 = World Tour | 2 = Pro Tour)
 * @param {*} file Path to create/save the file 
 */
async function ridersURL(teamlevel, file) {
  fs.writeFile(file, '', { flag: 'w+' }, function(err) {
    if (err) throw err;
  });
  try {
    let offset = 0;
    let rows = 0;
    do {
      const response = await got(`https://www.procyclingstats.com/rankings.php?offset=${offset}&teamlevel=${teamlevel}&filter=Filter&s=uci-individual`);

      const page = new JSDOM(response.body).window.document;
      rows = page.querySelectorAll('tbody tr');
      rows.forEach(async (line) => {
        const url = line.querySelector('td:nth-child(4) a').href;
        await fs.appendFile(file, `${url}\n`);
      });
      offset = parseInt(rows[rows.length - 1].querySelector('td:nth-child(1)').textContent.trim(), 10);

    } while (rows.length === 100);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Build database with the URL given in the files.
 * @param {*} urls Rider's urls
 */
async function parseRiderDetails(page, riderUrl, teamLevel) {
  const uuid = uuidv4();
  const name = page.querySelector('h1')?.textContent.replace('  ', ' ').normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/\u0142/g, "l").replace(/\u00f8/g, "o").replace(/\u00e6/g, "ae");
  const team = page.querySelector('.titleCont .subtitle h2')?.innerHTML;
  const infos = page.querySelector('.borderbox.left.w65')?.innerHTML.split('<ul');
  const age = parseInt(infos[1].split('(')[1].split(')')[0].split('<div>')[1].split('<')[0]);
  const flag = infos[2].split('flag')[1].split('"')[0].trim();
  const nationality = infos[2].split('href')[1].split('>')[1].split('<')[0];
  const weight = infos[3].includes('Weight') ? parseInt(infos[3].split('Weight:')[1].split('</div>')[1].split('>')[1]) : null;
  const height = infos[3].includes('Height') ? parseFloat(infos[3].split('Height:')[1].split('</div>')[1].split('>')[1]) : null;
  const uci_rank = infos[8]?.split('uci-individual')[1] ? parseInt(infos[8]?.split('uci-individual')[1]?.split('</div>')[1]?.split('>')[1]) : null;

  const photo = page.querySelector('.borderbox.left.w30.mr5').querySelector('img');
  const { buffer } = await got(photo.src).buffer();

  const imgUrl = `img/${name.replaceAll(' ', '-').toLocaleLowerCase()}.jpg`;
  await fs.writeFile(`./src/api/data/${imgUrl}`, Buffer.from(buffer));
  const img64 = `${process.env.VITE_API_BASE_URL}/${imgUrl}`;

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
    uuid, riderUrl, name, img64, team, teamLevel, age, nationality, flag, weight, height, uci_rank,
    kpis[0], kpis[1], kpis[2],
    specialities[0], specialities[1], specialities[2], specialities[3], specialities[4], specialities[5], sumSpecialities
  ];
}

async function ridersInfo(urls) {
  try {
    alasql(`CREATE FILESTORAGE DATABASE IF NOT EXISTS mydb("./src/api/db_update.json");
    ATTACH FILESTORAGE DATABASE mydb("./src/api/db_update.json");
    USE mydb;
    SOURCE "./src/api/createDB.sql";`);

    for (const url of urls) {
      const teamLevel = url.includes('WT') ? 'WT' : 'PRT';
      const file = await fs.readFile(url, 'utf-8');

      const riderUrls = file.split('\n');
      riderUrls.pop();
      for (const riderUrl of riderUrls) {
        const response = await got(riderUrl);
        const page = new JSDOM(response.body).window.document;
        const riderData = await parseRiderDetails(page, riderUrl, teamLevel);
        alasql('INSERT INTO rider VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', riderData);
      }
    }
    const result = alasql('SELECT COUNT(*) as number FROM rider');
    if (result[0].number > 0) {
      fs.copyFile('./src/api/db_update.json', './src/api/db.json');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Build a temporary database for the TDF
 */
async function ridersTDF() {
  try {
    const data = await got('https://fr.wikipedia.org/wiki/Palmar%C3%A8s_du_Tour_de_France');
    const page = new JSDOM(data.body).window.document;
    const table = page.querySelector('.wikitable');
    const rows = table.querySelectorAll('tr');
    const filteredRows = Array.from(rows).slice(34);

    /*const riderName = filteredRows[77].querySelector('td:nth-child(2) a:nth-child(2)').innerHTML.replace(/ /g, '-').toLowerCase();
    const riderUrl = `https://www.procyclingstats.com/rider/${riderName.replace(/ /g, '-').toLowerCase()}`;
    const response = await got(riderUrl);
    const riderPage = new JSDOM(response.body).window.document;
    const riderData = await parseRiderDetails(riderPage, riderUrl, 'TDF');*/

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
          ridersArray.push({
            name: riderName,
            year: cells[0].textContent.split(' ')[0].trim(),
            jersey: jersey[index]
          });
          /*const riderUrl = `https://www.procyclingstats.com/rider/${riderName.replace(/ /g, '-').toLowerCase()}`;
          const response = await got(riderUrl);
          const riderPage = new JSDOM(response.body).window.document;
          const name = riderPage.querySelector('h1')?.textContent.replace('  ', ' ').normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/\u0142/g, "l").replace(/\u00f8/g, "o").replace(/\u00e6/g, "ae");
          console.log(riderName, name);

          //const riderData = await parseRiderDetails(riderPage, riderUrl, 'TDF');
          //console.log(riderData);
          //alasql('INSERT INTO rider VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', riderData);*/
        }
      }
      // const request = await got(`https://www.procyclingstats.com/rider/${rider.name.replace(/ /g, '-').toLowerCase()}`);
      
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

export { ridersURL, ridersInfo};

await ridersTDF();

// Retrieve profile URLs of the riders from ProCyclingStats
// await ridersURL(1, 'src/api/data/ridersWT.txt'); // 1 for World Tour, 2 for ProTeam
// await ridersURL(2, 'src/api/data/ridersPRT.txt');

// Create rider's database
// await ridersInfo(['src/api/data/ridersWT.txt', 'src/api/data/ridersPRT.txt']);
// await ridersInfo(['src/api/data/ridersTest.txt']);