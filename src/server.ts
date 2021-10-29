import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { connectDatabase } from './utils/database';
import { getGamesCollection } from './utils/database';

if (!process.env.MONGODB_URI) {
  throw new Error('NO MONGODB URL dotenv variable');
}

const app = express();
const port = 3000;

app.use(express.json());

app.get('/api/games', async (_request, response) => {
  const gameCollection = getGamesCollection();
  const cursor = await gameCollection.find();
  const allGames = await cursor.toArray();

  response.send(allGames);
});

app.get('/api/games/:name', async (request, response) => {
  const serachedGame = request.params.name;
  const gameCollection = getGamesCollection();
  const isGameAvailable = await gameCollection.findOne({
    name: serachedGame,
  });
  if (isGameAvailable) {
    response.send(isGameAvailable);
  } else {
    response
      .status(404)
      .send('This game is either not released or not in the database');
  }
});

app.post('/api/games', async (request, response) => {
  const addGame = request.body;
  const gameCollection = getGamesCollection();
  const isGameInDatabase = await gameCollection.findOne({ name: addGame.name });

  if (!isGameInDatabase) {
    gameCollection.insertOne(addGame);
    response.send(addGame.name + ' has been successfully added');
  } else {
    response.status(404).send(addGame.name + ' is already in the database');
  }
});

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

connectDatabase(process.env.MONGODB_URI).then(() =>
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  })
);
