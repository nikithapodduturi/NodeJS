const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");

app.use(express.json());
let db = null;
const playerDetails = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () => {
      console.log("Server running at https://localhost:3002");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
playerDetails();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//GET
app.get("/players/", async (request, response) => {
  const query = ` select * from cricket_team`;
  const dbPlayers = await db.all(query);
  response.send(
    dbPlayers.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//POST
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postQuery = `
    insert into cricket_team(player_name,jersey_number,role)
    values ('${playerName}',
    ${jerseyNumber},
    '${role}')`;
  const dbPost = await db.run(postQuery);
  response.send("Player Added to Team");
});

//GET
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    select * from cricket_team where player_id=${playerId};`;
  const singlePlayer = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(singlePlayer));
});

//PUT
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const putQuery = `update cricket_team
     set 
        player_name='${playerName}',
        jersey_number=${jerseyNumber},
        role='${role}'
     where 
        player_id=${playerId}`;
  const updatedPlayer = await db.run(putQuery);
  response.send("Player Details Updated");
});

//DELETE
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    delete 
    from cricket_team 
    where 
        player_id=${playerId}`;
  const deletedPlayer = await db.run(deleteQuery);
  response.send("Player Removed");
});
module.exports = app;

