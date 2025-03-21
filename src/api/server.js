import alasql from 'alasql';
import express from 'express';
import cors from 'cors';
import seedrandom from 'seedrandom';
import { CronJob } from 'cron';
import { ridersURL, ridersInfo } from './create-riders-database.js';

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());
app.use('/img', express.static('./src/api/data/img'));

alasql(`ATTACH FILESTORAGE DATABASE mydb("./src/api/db.json"); USE mydb;`);

app.get("/api/riders/random", (req, res) => {
  const teamLevel = req.query.mode === "rider-wt" ? "WT" : "PRT";

  // Generation of a seed based on the current date to get the same rider for the day 
  const seed = Math.trunc(seedrandom(new Date().toISOString().split('T')[0]).quick() * 100000);
  const nb = alasql('SELECT COUNT(*) as nb FROM rider WHERE team_level = ?;', [teamLevel])[0].nb % (teamLevel === "WT" ? 200 : 100);
  const selected = seed % nb;

  res.json(alasql(`SELECT * FROM rider WHERE team_level = ? LIMIT 1 OFFSET ${selected};`, [teamLevel]));
});

app.get("/api/riders/search/:name", (req, res) => {
  const teamLevel = req.query.mode === "rider-wt" ? "WT" : "PRT";
  res.json(alasql(`SELECT * FROM rider WHERE name ILIKE '%${req.params.name}%' AND team_level = ? LIMIT 5;`, [teamLevel]));
});

app.get("/api/riders", (req, res) => {
  const teamLevel = req.query.mode === "rider-wt" ? "WT" : "PRT";
  res.json(alasql(`SELECT * FROM rider WHERE team_level = ? ORDER BY name;`, [teamLevel]));
});

app.listen(port, () => {
  console.log("Server listening on port", port);
});

// Cron job to update the database every day at 4:00 AM
const job = new CronJob('0 4 * * *', async () => {
  await ridersURL(1, 'src/api/data/ridersWT.txt');
  await ridersURL(2, 'src/api/data/ridersPRT.txt');
  await ridersInfo(['src/api/data/ridersWT.txt', 'src/api/data/ridersPRT.txt']);
  alasql('ATTACH FILESTORAGE DATABASE mydb("./src/api/db.json"); USE mydb;');
}, null, true, 'Europe/Paris');

job.start();