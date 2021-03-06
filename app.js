var path = require('path');
var logger = require('morgan');
var express = require('express');
var mongo = require('mongodb');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 3000);

app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

var uri = process.env.MONGOLAB_URI || 'mongodb://localhost/peacecorp';
var MongoClient = mongo.MongoClient;
var db;
MongoClient.connect(uri, function(err, database) {
  db = database;
  io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
  });
  setTimeout(function(){
    app.dataNow(io);
  }, 100);

  require('./scrape.js')(app, db);
  app.refreshData();
  db.collection('raw_data').find().toArray(function(err, users) {
    app.analyzeData(users);
  });
});

/*var Server = mongo.Server;
var db = new Db('peacecorp',
  new Server(uri, '27017', {auto_reconnect: true}, {}),
  {safe: true}
);
db.open(function(){

});*/

app.use(function(req, res, next){
  req.db = db;
  next();
});

var routes = require('./routes');
app.use('/', routes);

setInterval(function() {
  //console.log("refreshing data");
  //app.refreshData();
},30000)


//setTimeout(function(){
//  app.dataNow(io);
//}, 100);

http.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
