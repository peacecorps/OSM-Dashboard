var config = require('../config');
var GoogleSpreadsheet = require("google-spreadsheet");

var my_sheet = new GoogleSpreadsheet(config.gsheet.key);

var exports = module.exports = {}

exports.getUsers = function (callback) {
  var names = [];
  my_sheet.setAuth(config.gsheet.email,config.gsheet.password, function(err){
    my_sheet.getRows( 1, function(err, row_data){
      for (var i = 0; i< row_data.length; i++) {
        var name = row_data[i].whatisyouropenstreetmapusername;
        if (name) {
          names.push(name);
        }
      }
      callback(names);
    });
  });
}

exports.insertName = function(name) {
  my_sheet.setAuth(config.gsheet.email,config.gsheet.password, function(err){
    my_sheet.addRow(name, { colname: 'whatisyouropenstreetmapusername' });
  });
}