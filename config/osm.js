var request = require('request');
var exports = module.exports = {};
var parseString = require('xml2js').parseString;
async = require("async");

exports.getSingleUser = function(name, callback) {
  var url = 'https://api.openstreetmap.org/api/0.6/changesets?display_name=' + name;
  request(url, function(error, response, body) {
    if (error) {
      console.log(error);
      callback();
      return;
    }
    if (!error && response.statusCode == 200) {
      parseString(body, function(err, result) {
        var items = result.osm.changeset;
        if (!items) {
          callback();
          return;
        }
        var lastDate = items[items.length-1].$.created_at;
        //console.log(name + ': ' + lastDate);
        requestTill(url, name, lastDate, items, function(contribs) {
          //console.log(name + ': ' + contribs.length);
          callback({_id: contribs[0].$.uid, name: name, count: contribs.length, items: contribs});
          return;
        });
      })
    } else {
      console.log(name + " not found")
      callback();
    }
  });
}

function requestTill(url, name, date, previtems, callback) {
  var url = 'https://api.openstreetmap.org/api/0.6/changesets?display_name=' + name + '&time=-4712-01-01T00:00:00+00:00,' + date;
  var contributions = [];
  request(url, function(error, response, body) {
    if (error) {
      console.log(error);
      callback();
      return;
    }
    if (!error && response.statusCode == 200) {
      parseString(body, function(err, result) {
        var items = result.osm.changeset;
        if (!items) {
          callback(previtems);
          return;
        }
        var lastDate = items[items.length-1].$.created_at;
        //console.log(name + ': ' + lastDate);
        requestTill(url, name, lastDate, previtems.concat(items), callback);
        return;
      })
    }
  });
}

exports.fetchData = function(names, callback) {
  var users = [];
  var asyncTasks = [];
  names.forEach(function(name){
    asyncTasks.push(function(callback) {
      exports.getSingleUser(name, function(response) {
        users.push(response);
        callback();
      });
    });
  });
  async.parallel(asyncTasks, function() {
    callback(users);
  });
}