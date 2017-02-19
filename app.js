var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var users = require('./keg/users.js')("./db/users.nosql");
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8080 });

// Spawn an app for temperature reading
var TEMP_POLLING_SEC = 10;
var spawn = require('child_process').spawn,
    py    = spawn('python', ['node_modules/Adafruit_Python_DHT-master/examples/get_temperature.py', TEMP_POLLING_SEC]);

py.on('error', (err) => {
  console.log("Couldn't spawn temperature polling. Make sure python is installed.")
});

var flowmeter = require('./keg/flowmeter')({
	pin: 40,
	tickCalibration: 0.00089711713,
	timeBetweenPours: 3000, 
	notificationMl: 100
});

var routes = require('./routes/index');

var app = express();

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


app.set("users", users);
var messageService = require('./keg/messageService.js')(app);

wss.on('connection', function connection(ws) {
  console.log("Web socket client connected.");

  ws.on('message', function incoming(message) {
    console.log('Recieved a message from the client: %s', message);
    messageService.process(message, ws);
  });

  messageService.weatherUpdate(py.stdout, ws);

  messageService.pourUpdate(flowmeter, ws);

});

module.exports = app;
