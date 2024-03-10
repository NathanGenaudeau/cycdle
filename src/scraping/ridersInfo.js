import got from 'got';
import { JSDOM } from 'jsdom';
import fs from 'fs/promises';

async function ridersInfo() {
  try {
    const file = await fs.readFile('src/scraping/ridersWT.txt', 'utf-8');
    const response = await got(file.split('\n')[0]);
    const page = new JSDOM(response.body).window.document;
    console.log(page.querySelector('h1').textContent);
    /*for (const url of file.split('\n')) {
      const response = await got(url);

      const page = new JSDOM(response.body).window.document;
      nbResults = parseInt(page.querySelector('b').textContent.split('/')[0], 10);
      const rows = page.querySelectorAll('tbody tr');
      rows.forEach(async (line) => {
        const url = line.querySelector('td:nth-child(4) a').href;
        await fs.appendFile(file, `${url}\n`);
      });
      offset = parseInt(rows[rows.length - 1].querySelector('td:nth-child(1)').textContent.trim(), 10);
    }*/
  } catch (error) {
    console.error('Error:', error.message);
  }
}

ridersInfo();