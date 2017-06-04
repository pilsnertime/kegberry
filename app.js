var users = require('./keg/users.js')("./db/users.nosql");
var pours = require('./keg/pours.js')("./db/pours.nosql");
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8080 });

// Spawn an app for temperature reading
var TEMP_POLLING_SEC = 10;
var spawn = require('child_process').spawn,
    py    = spawn('python', ['./keg/get_temperature.py', TEMP_POLLING_SEC]);

py.on('error', (err) => {
  console.log("Couldn't spawn temperature polling. Make sure python is installed.")
});

var MOCK_POURS = false;

var flowmeter = require('./keg/flowmeter')({
	pin: 40,
	tickCalibration: 0.00089711713,
	timeBetweenPours: 3000, 
	notificationMl: 10,
  mock: MOCK_POURS
});

var messageService = require('./keg/messageService.js')(users, pours);

wss.on('connection', function connection(ws) {
  console.log("Web socket client connected.");

  ws.on('message', function incoming(message) {
    console.log('Recieved a message from the client: %s', message);
    messageService.process(message, ws);

    if (MOCK_POURS)
    {
      messageService.mockPour(message, flowmeter);
    }

  });

  messageService.weatherUpdate(py.stdout, ws);

  messageService.pourUpdate(flowmeter, ws);

});
