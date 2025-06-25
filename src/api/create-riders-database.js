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
    let nbResults = 0;
    do {
      const response = await got(`https://www.procyclingstats.com/rankings.php?offset=${offset}&teamlevel=${teamlevel}&filter=Filter&s=uci-individual`);

      const page = new JSDOM(response.body).window.document;
      nbResults = parseInt(page.querySelector('b').textContent.split('/')[0], 10);
      const rows = page.querySelectorAll('tbody tr');
      rows.forEach(async (line) => {
        const url = line.querySelector('td:nth-child(4) a').href;
        await fs.appendFile(file, `${url}\n`);
      });
      offset = parseInt(rows[rows.length - 1].querySelector('td:nth-child(1)').textContent.trim(), 10);

    } while (nbResults === 100);
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
  const team = page.querySelector('.titleCont.subtitle h2')?.innerHTML;
  console.log(page.querySelector('.titleCont'));
  const infos = page.querySelector('.borderbox.left.w65')?.innerHTML;
  /*const age = parseInt(infos[0].split('(')[1].split(')')[0]);
  const flag = infos[1].split('flag')[1].split('"')[0].trim();
  const nationality = infos[1].split('href')[1].split('>')[1].split('<')[0];
  const weight = infos[2].includes('Weight') ? parseInt(infos[2].split('Weight')[1].split('>')[1].split('kg')[0].trim()) : null;
  const height = infos[2].includes('Height') ? parseFloat(infos[2].split('Height')[1].split('>')[1].split('m')[0].trim()) : null; */

  //console.log(name, team, infos);

  /*const uci_rank = page.querySelector('.rdr-rankings').innerHTML ? parseInt(page.querySelector('.rdr-rankings')?.innerHTML.split('<li>')[0]?.split('UCI World')[1]?.split('rnk')[1]?.split('>')[1]?.split('<')[0]) : null;
  const photo = page.querySelector('.rdr-img-cont').querySelector('img');
  const { buffer } = await got(photo.src).buffer();

  const imgUrl = `img/${name.replaceAll(' ', '-').toLocaleLowerCase()}.jpg`;
  await fs.writeFile(`./src/api/data/${imgUrl}`, Buffer.from(buffer));
  const img64 = `${process.env.VITE_API_BASE_URL}/${imgUrl}`;

  const profile = page.querySelector('.pps').innerHTML.split('<li>').slice(1);
  const specialities = [];
  profile.forEach((element) => {
    const value = parseInt(element.split('width: ')[1].split('%')[0], 10);
    specialities.push(value === 0 ? 1 : value); // put a minimal of 1 to be represented in the BarChart
  });
  const sumSpecialities = specialities.reduce((acc, cur) => acc + cur, 0);

  const kpis = [];
  const keyStats = page.querySelector('.rider-kpi').innerHTML.split('<li').slice(1);
  keyStats.forEach((element) => {
    kpis.push(parseInt(element.split('nr')[1].split('>')[1].split('<')[0], 10));
  });

  return [
    uuid, riderUrl, name, img64, team, teamLevel, age, nationality, flag, weight, height, uci_rank,
    kpis[0], kpis[1], kpis[2],
    specialities[0], specialities[1], specialities[2], specialities[3], specialities[4], specialities[5], sumSpecialities
  ];*/
  return '';
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

    const riderName = filteredRows[87].querySelector('td:nth-child(2) a:nth-child(2)').innerHTML.replace(/ /g, '-').toLowerCase();
    const riderUrl = `https://www.procyclingstats.com/rider/${riderName.replace(/ /g, '-').toLowerCase()}`;
    console.log('Rider URL:', riderUrl);
    const response = await got(riderUrl);
    const riderPage = new JSDOM(response.body).window.document;
    const riderData = await parseRiderDetails(riderPage, riderUrl, 'TDF');

    /*filteredRows.forEach(async (row) => {
      const cells = row.querySelectorAll('td');
      // case 1 = jaune, 10 = à pois, 11 = vert, 12 = blanc, 13 = combatif
      const riders = [cells[1].textContent.trim(), cells[10].textContent.trim(), cells[11].textContent.trim(), cells[12].textContent.trim(), cells[13].textContent.trim()];
      for (const riderName of riders) {
        if (riderName) {
          const riderUrl = `https://www.procyclingstats.com/rider/${riderName.replace(/ /g, '-').toLowerCase()}`;
          const response = await got(riderUrl);
          const riderPage = new JSDOM(response.body).window.document;
          const riderData = await parseRiderDetails(riderPage, riderUrl, 'TDF');
          console.log(riderData);
          //alasql('INSERT INTO rider VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', riderData);
        }
      }*/

      /* const rider = {
        year: cells[0].textContent.split(' ')[0].trim(),
        name: cells[1].textContent.trim(),
      }; */
      // const request = await got(`https://www.procyclingstats.com/rider/${rider.name.replace(/ /g, '-').toLowerCase()}`);

    //});

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