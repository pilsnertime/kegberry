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

var messageService = require('./keg/messageService.js')(users);

wss.on('connection', function connection(ws) {
  console.log("Web socket client connected.");

  ws.on('message', function incoming(message) {
    console.log('Recieved a message from the client: %s', message);
    messageService.process(message, ws);
  });

  messageService.weatherUpdate(py.stdout, ws);

  messageService.pourUpdate(flowmeter, ws);

});