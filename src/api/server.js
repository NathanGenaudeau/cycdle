import alasql from 'alasql';
import express from 'express';
import cors from 'cors';
import seedrandom from 'seedrandom';
import { CronJob } from 'cron';
import { ridersURL, ridersInfo } from './create-riders-database.js';
import fs from 'fs';

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());
app.use('/img', express.static('./src/api/data/img'));

const data = JSON.parse(fs.readFileSync('./src/api/db.json'));
const data2 = JSON.parse(fs.readFileSync('./src/api/db2.json'));
const db1 = new alasql.Database();
const db2 = new alasql.Database();
db1.exec('CREATE TABLE rider;');
db2.exec('CREATE TABLE riderTDF;');
db1.tables.rider.data = data.rider;
db2.tables.riderTDF.data = data2.riderTDF;

app.get("/api/riders/random", (req, res) => {
  const teamLevel = req.query.mode === "rider-wt" ? "WT" : "PRT";

  // Generation of a seed based on the current date to get the same rider for the day 
  const seed = Math.trunc(seedrandom(new Date().toISOString().split('T')[0]).quick() * 100000);
  const nb = db1.exec('SELECT COUNT(*) as nb FROM rider WHERE team_level = ?;', [teamLevel])[0].nb % (teamLevel === "WT" ? 200 : 100);
  const selected = seed % nb;

  res.json(db1.exec(`SELECT * FROM rider WHERE team_level = ? LIMIT 1 OFFSET ${selected};`, [teamLevel]));
});

app.get("/api/riders-tdf", (_, res) => {
  res.json(db2.exec(`SELECT * FROM riderTDF ORDER BY name;`));
});

app.get("/api/riders/random-tdf", (_, res) => {
  // Generation of a seed based on the current date to get the same rider for the day 
  const seed = Math.trunc(seedrandom(new Date().toISOString().split('T')[0]).quick() * 100000);
  const nb = db2.exec('SELECT COUNT(*) as nb FROM riderTDF;')[0].nb;
  const selected = seed % nb;

  res.json(db2.exec(`SELECT * FROM riderTDF LIMIT 1 OFFSET ${selected};`));
});

app.get("/api/riders", (req, res) => {
  const teamLevel = req.query.mode === "rider-wt" ? "WT" : "PRT";
  res.json(db1.exec(`SELECT * FROM rider WHERE team_level = ? ORDER BY name;`, [teamLevel]));
});

app.listen(port, () => {
  console.log("Server listening on port", port);
});

// Cron job to update the database every day at 4:00 AM
const job = new CronJob('0 4 * * *', async () => {
  await ridersURL(1, 'src/api/data/ridersWT.txt');
  await ridersURL(2, 'src/api/data/ridersPRT.txt');
  await ridersInfo(['src/api/data/ridersWT.txt', 'src/api/data/ridersPRT.txt']);
  const data = JSON.parse(fs.readFileSync('./src/api/db.json'));
  const db1 = new alasql.Database();
  db1.exec('CREATE TABLE rider;');
  db1.tables.rider.data = data.rider;
}, null, true, 'Europe/Paris');

job.start();