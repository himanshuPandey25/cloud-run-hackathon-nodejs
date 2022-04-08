const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Let the battle begin!');
});

var gotHitCount = 0;
var hitCount = 0;
var noHitCount = 0;
var prevScore = -100;
var lowCount = 0
var prevLocation = [];

app.post('/', function (req, res) {
  //console.log(JSON.stringify(req.body));

  let arena = req.body.arena;

  let me = req.body._links.self.href;

  //console.log(me);

  let myData = arena.state[me];

  let move = decideMove(me, myData, arena);

  //const moves = ['F', 'T', 'L', 'R', 'T'];
  //res.send(moves[Math.floor(Math.random() * moves.length)]);
  res.send(move);
});

let decideMove = (me, myData, arena) => {

  if (prevScore > myData.score) {
    lowCount++;
  } else {
    lowCount = 0;
  }
  if (lowCount > 3 && prevLocation[0] == myData.x && prevLocation[1] == myData.y) {
    lowCount = 2;
    prevScore = myData.score;
    prevLocation = [myData.x, myData.y]
    return 'R';
  }
  if (lowCount >= 3) {
    prevScore = myData.score;
    prevLocation = [myData.x, myData.y]
    return 'F';
  }
  if (lowCount >= 2) {
    prevScore = myData.score;
    prevLocation = [myData.x, myData.y]
    return changeDirection(myData, arena);
  }
  let players = Object.keys(arena.state);

  if (myData.wasHit) {
    gotHitCount++;
  }

  let hitRange = getHitRange(myData, arena)

  if (hitRange.length == 0) {
    prevScore = myData.score;
    prevLocation = [myData.x, myData.y]
    return changeDirection(myData, arena)
  }

  for (let i = 0; i < players.length; i++) {

    if (players[i] === me) {
      continue;
    }

    if (inRange(hitRange, arena.state[players[i]])) {
      hitCount++;
      noHitCount = 0;
      prevScore = myData.score;
      prevLocation = [myData.x, myData.y]
      return 'T';
    }
  }
  noHitCount++;
  if(noHitCount > 7){
    noHitCount = 5
    prevScore = myData.score;
    prevLocation = [myData.x, myData.y]
    let moves = ['L', 'R'];
    return moves[Math.floor(Math.random() * moves.length)];
  }
  if (noHitCount >= 5) {
    hitCount = 0;
    prevScore = myData.score;
    prevLocation = [myData.x, myData.y]
    return 'F';
  }
  if (noHitCount >= 3) {
    hitCount = 0;
    prevScore = myData.score;
    prevLocation = [myData.x, myData.y]
    return changeDirection(myData, arena);
  }
  prevScore = myData.score;
  prevLocation = [myData.x, myData.y]
  return changeDirection(myData, arena);
}


let getHitRange = (myData, arena) => {

  let range = 3;
  let coordinates = []
  let x = myData.x;
  let y = myData.y;

  if (myData.direction == 'E') {

    range = Math.min(3, arena.dims[0] - x - 1);
    while (range > 0) {
      ++x;
      coordinates.push([x, y]);
      --range;
    }
  } else if (myData.direction == 'N') {

    range = Math.min(3, y);
    while (range > 0) {
      --y;
      coordinates.push([x, y]);
      --range;
    }

  } else if (myData.direction == 'W') {

    range = Math.min(3, x);
    while (range > 0) {
      --x;
      coordinates.push([x, y]);
      --range;
    }
  } else {

    range = Math.min(3, arena.dims[1] - y - 1);
    while (range > 0) {
      ++y;
      coordinates.push([x, y]);
      --range;
    }
  }

  return coordinates;

}

let changeDirection = (myData, arena) => {

  if (myData.direction == 'E') {
    right = arena.dims[1] - myData.y - 1;
    left = Math.min(3, myData.y);
  } else if (myData.direction == 'N') {
    right = arena.dims[0] - myData.x - 1;
    left = Math.min(3, myData.x);
  } else if (myData.direction == 'W') {
    left = arena.dims[1] - myData.y - 1;
    right = Math.min(3, myData.y);
  } else {
    left = arena.dims[0] - myData.x - 1;
    right = Math.min(3, myData.x);
  }

  if (right >= left) {
    return 'R';
  } else {
    return 'L';
  }
}

let inRange = (hitRange, player) => {

  let j = 0;
  for (; j < hitRange.length; j++) {
    if (hitRange[j][0] == player.x && hitRange[j][1] == player.y) {
      return true;
    }
  }
  return false;
}
app.listen(process.env.PORT || 8080);
