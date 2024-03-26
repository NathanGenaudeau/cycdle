import alasql from 'alasql';
import express from 'express';
import cors from 'cors';
import seedrandom from 'seedrandom';

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

alasql(`ATTACH FILESTORAGE DATABASE mydb("./src/api/db.json"); USE mydb;`);

app.get("/api/riders/random", (req, res) => {
  const teamLevel = req.query.mode === "rider-wt" ? "WT" : "PRT";

  // Generation of a seed based on the current date to get the same rider for the day 
  const seed = Math.trunc(seedrandom(new Date().toISOString().split('T')[0]).quick() * 100000);
  const nb = alasql('SELECT COUNT(*) as nb FROM rider WHERE team_level = ?;', [teamLevel])[0].nb;
  const selected = seed % nb;

  res.json(alasql(`SELECT * FROM rider WHERE team_level = ? LIMIT 1 OFFSET ${selected};`, [teamLevel]));
});

app.get("/api/riders/search/:name", (req, res) => {
  const teamLevel = req.query.mode === "rider-wt" ? "WT" : "PRT";
  res.json(alasql(`SELECT * FROM rider WHERE name ILIKE '%${req.params.name}%' AND team_level = ? LIMIT 5;`, [teamLevel]));
});

app.listen(port, () => {
  console.log("Server listening on port", port);
});