var fs = require('fs');
var os = require('os');
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8080 });
var databaseDir = "../kegberrydb";
var userDbFile = databaseDir + "/users.nosql";
var pourDbFile = databaseDir + "/pours.nosql";

// Set up databases if they don't exist
if (!fs.existsSync(databaseDir)){
    fs.mkdirSync(databaseDir);
}
if (!fs.existsSync(userDbFile)){
    fs.writeFileSync(userDbFile, "{\"id\":\"default_user\",\"name\":\"Default User\"}" + os.EOL);
}
if (!fs.existsSync(pourDbFile)){
    fs.writeFileSync(pourDbFile, "{}" + os.EOL);
}

var users = require('./keg/users.js')(userDbFile);
var pours = require('./keg/pours.js')(pourDbFile);

// Spawn an app for temperature reading
var TEMP_POLLING_SEC = 10;
var spawn = require('child_process').spawn,
    weatherProcess = spawn('python', ['./keg/get_temperature.py', TEMP_POLLING_SEC]);

weatherProcess.on('error', (err) => {
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

  messageService.weatherUpdate(weatherProcess.stdout, ws);

  messageService.pourUpdate(flowmeter, ws);

});
