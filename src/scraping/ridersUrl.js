import got from 'got';
import { JSDOM } from 'jsdom';
import fs from 'fs/promises';

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

ridersURL(1, 'src/scraping/ridersWT.txt');
ridersURL(2, 'src/scraping/ridersPRT.txt');