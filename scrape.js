var gs = require('./config/gs.js');
var osm = require('./config/osm.js');

module.exports = function (scraper, db) {
  scraper.refreshData = function() {
    console.log('refreshing data');
    gs.getUsers(function(names) {
      uniqueNames = names.filter(function(item, pos) {
        return names.indexOf(item) == pos;
      });
      osm.fetchData(uniqueNames, function(users) {
        for (var i = 0; i < users.length-1; i++) {
          if (users[i]) {
            db.collection('raw_data').save(users[i], function(err, result) {});
          }
        }
        scraper.analyzeData(users);
      });
    });
  }

  scraper.analyzeData = function (array) {
    users = array.sort(function(a, b) {
      var keyA = a.count;
      var keyB = b.count;
      if(keyA > keyB) return -1;
      if(keyA < keyB) return 1;
      return 0;
    });

    totalCount = 0;
    for (var i = 0; i < users.length; i++) {
      if (users[i] && users[i].count) {
        totalCount += users[i].count;
      }
    }

    var data = {
      _id: 1,
      leaderboard: [
        { name: users[0].name, count: users[0].count },
        { name: users[1].name, count: users[1].count },
        { name: users[2].name, count: users[2].count },
        { name: users[3].name, count: users[3].count },
        { name: users[4].name, count: users[4].count },
        { name: users[5].name, count: users[5].count },
        { name: users[6].name, count: users[6].count },
        { name: users[7].name, count: users[7].count },
        { name: users[8].name, count: users[8].count },
        { name: users[9].name, count: users[9].count },
      ],
      stats: {
        totalUsers: users.length,
        totalCount: totalCount
      }
    }

    db.collection('statistics').save(data, function(err, result) {

    });
    console.log(data);
  }
};
