import alasql from 'alasql';
import express from 'express';
import cors from 'cors';

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

alasql(`ATTACH FILESTORAGE DATABASE mydb("./src/api/db.json"); USE mydb;`);

app.get("/api/riders/random", (_req, res) => {
  res.json(alasql('SELECT * FROM rider ORDER BY RANDOM() LIMIT 1'));
});

app.get("/api/riders/search/:name", (req, res) => {
    res.json(alasql(`SELECT * FROM rider WHERE name ILIKE '%${req.params.name}%' LIMIT 5`));
  });

app.listen(port, () => {
  console.log("Server listening on port", port);
});