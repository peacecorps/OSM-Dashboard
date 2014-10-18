var request = require('request');
var exports = module.exports = {};
var parseString = require('xml2js').parseString;
async = require("async");
debugger;
exports.getInstantUser = function(name, callback) {
  var url = 'https://api.openstreetmap.org/api/0.6/changesets?display_name=' + name;
  var d = new Date();
  d.setTime(d.getTime()-300000);
  var iso = d.toISOString().slice(0,10);
  var time = iso + "T" + (d.getHours()<10?'0':'') + d.getHours() + ":" + (d.getMinutes()<10?'0':'') + d.getMinutes() + ":" + d.getSeconds() + "Z";
  url += "&time="+time;
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
        var asyncArray = [];
        //new_items = [];
        /*items.forEach(function(item) {
          asyncArray.push(function(callback) {
            exports.getEdits(item.$, function(response) {
              item.$.edits = response;
              //new_items.push(item);
              callback();
            })
          });
        });*/
        async.parallel(asyncArray, function(){
          callback(items);
          return;
        });
      });
    } else {
      console.log(name + " not found");
      callback();
    }
  });
}

exports.fetchInstant = function(io, names, callback) {
  var users = [];
  var asyncTasks = [];
  names.forEach(function(name){
    asyncTasks.push(function(callback) {
      exports.getInstantUser(name, function(response) {
        if (response) {
          for (var i = 0; i<response.length-1; i++) {
            if (response[i]) {
              console.log("SENDING" + Math.random());
              io.emit('data', response[i].$);
            }
          }
        }
        users.push(response);
        callback();
      });
    });
  });
  async.parallel(asyncTasks, function() {
    callback(users);
  });
}

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
        var edits = 0;
        var asyncArray = [];
        items.forEach(function(item) {
          asyncArray.push(function(callback) {
            exports.getEdits(item.$, function(response) {
              if (response) {
                edits += response.length;
              }
              callback();
            })
          });
        });
        async.parallel(asyncArray, function(){
          var lastDate = items[items.length-1].$.created_at;
          //console.log(name + ': ' + lastDate);
          requestTill(url, name, lastDate, items, function(contribs) {
            console.log(name + ': ' + contribs.length + ", " + edits);
            callback({_id: contribs[0].$.uid, name: name, count: contribs.length, edits: edits, items: contribs});
            return;
          });
        });
      });
    } else {
      console.log(name + " not found")
      callback();
    }
  });
}

exports.getEdits = function(item, callback) {
  var url = 'https://api.openstreetmap.org/api/0.6/changeset/' + item.id + '/download';
  request(url, function(error, response, body) {
    if (error) {
      console.log(error);
      callback();
      return;
    }
    if (!error && response.statusCode == 200) {
      parseString(body, function(err, result) {
        callback(result);
      });
    }
  });
}

function requestTill(url, name, date, previtems, callback) {
  console.log("next page: " + name);
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
        var edits = 0;
        var asyncArray = [];
        items.forEach(function(item) {
          asyncArray.push(function(callback) {
            exports.getEdits(item.$, function(response) {
              if (response) {
                edits += response.length;
              }
              callback();
            })
          });
        });
        async.parallel(asyncArray, function(){
          var lastDate = items[items.length-1].$.created_at;
          //console.log(name + ': ' + lastDate);
          requestTill(url, name, lastDate, previtems.concat(items), callback);
          return;
        });
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