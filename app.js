const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB ERROR:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// API 1

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT 
        player_id as playerId,
        player_name as playerName
    FROM 
        player_details;`;
  const playerArray = await db.all(getPlayersQuery);
  response.send(playerArray);
});

// API 2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
        SELECT 
            player_id AS playerId,
            player_name AS playerName 
        FROM 
            player_details 
        WHERE 
            player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(player);
});

// API 3

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;

  const updatePlayerQuery = `
        UPDATE
            player_details
        SET
            player_name = '${playerName}'
        WHERE
            player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// API 4

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
        SELECT
            match_id AS matchId,
            match AS match,
            year as year
        FROM
            match_details
        WHERE
            match_id = ${matchId}
        ORDER BY 
            match_id ;`;
  const specificMatch = await db.get(getMatchQuery);
  response.send(specificMatch);
});

// API 5

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;

  const playerMatchQuery = `
        SELECT 
            player_match_score.match_id as matchId,
            match_details.match as match,
            match_details.year as year
        FROM
            player_match_score NATURAL JOIN match_details
        WHERE
            player_id = ${playerId};`;
  const playerMatches = await db.all(playerMatchQuery);
  response.send(playerMatches);
});

// API 6
app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayersQuery = `
    SELECT 
        player_details.player_id as playerId,
        player_details.player_name as playerName
    FROM
        player_match_score NATURAL JOIN player_details
    WHERE 
        match_id = ${matchId};`;
  const playersArray = await db.all(getMatchPlayersQuery);
  response.send(playersArray);
});

//API 7

app.get("/players/:playerId/playersScores/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScoredQuery = `
    SELECT
        player_details.player_id AS playerId,
        player_details.player_name AS playerName,
        SUM(player_match_score.score) AS totalScore,
        SUM(fours) AS totalFours,
        SUM(sixes) AS totalSixes
    FROM
        player_details INNER JOIN player_match_score
            ON player_details.player_id = player_match_score.player_id
    WHERE 
        player_details.player_id = ${playerId};`;
  const playerScore = await db.get(getPlayerScoredQuery);
  response.send(playerScore);
});

module.exports = app;
