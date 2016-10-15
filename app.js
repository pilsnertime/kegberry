var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 8080 });

// Spawn an app for temperature reading
var spawn = require('child_process').spawn,
    py    = spawn('python', ['node_modules/Adafruit_Python_DHT-master/examples/get_temperature.py']);

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// hook angular 2 app
app.use(express.static(path.join(__dirname, 'beer')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

wss.on('connection', function connection(ws) {
    py.stdout.on('data', function(data){
    if(data){
      var outData = JSON.parse(data);
      if(!outData.error){
        ws.send(JSON.stringify({"type":"temperature", "data": outData}));
      }
    }    
  });
});

module.exports = app;
