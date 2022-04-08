const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Let the battle begin!');
});

app.post('/', function (req, res) {
  console.log(JSON.parse(req.body));
    
  let arena = req.body;

  let me = arena._links.self.href;
  console.log(me);

  const moves = ['F', 'T', 'L', 'R', 'T'];
  res.send(moves[Math.floor(Math.random() * moves.length)]);
});

app.listen(process.env.PORT || 8080);
