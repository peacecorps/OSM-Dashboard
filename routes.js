var express = require('express');
var router = express.Router();
var osm = require('./config/osm');
var gs = require('./config/gs');

router.get('/', function(req, res) {
  req.db.collection('statistics').findOne({_id: 1}, function(err, stats) {
    res.render('index', {
      stats: stats
    });
  });
});

router.get('/live', function(req, res) {
  res.render('live', {

  });
});

router.post('/newuser', function(req, res) {
  var name = req.body.name;
  osm.getSingleUser(name, function(response) {
    if (response) {
      req.db.collection('raw_data').save(response, function(err, result) {
        req.db.collection('raw_data').find().toArray(function(err, users) {
          require('./scrape.js')(router, req.db);
          router.analyzeData(users);
          gs.insertName(name);
          return res.send(true);
        });
      });
    } else {
      return res.send(false);
    }
  });
});

module.exports = router;