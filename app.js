const Config = require('./keg/configuration');
var fs = require('fs');
var os = require('os');
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8080 });

// Set up databases if they don't exist
if (!fs.existsSync(Config.DATABASE_DIR)){
    fs.mkdirSync(Config.DATABASE_DIR);
}
if (!fs.existsSync(Config.USERS_DB_FILE)){
    fs.writeFileSync(Config.USERS_DB_FILE, "{\"id\":\"default_user\",\"name\":\"Default User\"}" + os.EOL);
}
if (!fs.existsSync(Config.POURS_DB_FILE)){
    fs.writeFileSync(Config.POURS_DB_FILE, "{}" + os.EOL);
}
if (!fs.existsSync(Config.KEG_DB_FILE)){
    fs.writeFileSync(Config.KEG_DB_FILE, "{\"beerId\":\"Test Beer Name\", \"description\":\"Best beer\", \"ABV\":5.0, \"IBU\":20, \"SRM\":2,\
     \"logoURL\":\"https://sapporobeer.com/assets/Uploads/logo-premiumbeer.png\", \"capacityLiters\":58.67, \"consumedLiters\":0.00, \"tickMl\":0.00089711713}" + os.EOL);
}

// Spawn an app for temperature reading
var spawn = require('child_process').spawn,
    weatherProcess = spawn('python', [Config.TEMP_POLLING_SCRIPT_LOCATION, Config.TEMP_POLLING_SEC]);

weatherProcess.on('error', (err) => {
  console.log("Couldn't spawn temperature polling. Make sure python is installed.")
});

// Bootstrap the flowmeter data provider
var flowmeter = require('./keg/flowmeter')({
	pin: 40,
	litersPerTick: 0.0017686567164179104,
	timeBetweenPours: Config.TIME_BETWEEN_POURS, 
	notificationMl: 20
});

// Bootstrap the solenoid data provider
var solenoid = require('./keg/solenoid')({
    pin: 38,
    safetyLimitMs: 30000
});

// Open database-related data providers
var userData = require('./keg/users.js')(Config.USERS_DB_FILE);
var pourData = require('./keg/pours.js')(Config.POURS_DB_FILE);
var kegData = require('./keg/pours.js')(Config.KEG_DB_FILE);

// Spin up the messaging service
var messageService = require('./keg/messageService.js')(wss, weatherProcess, flowmeter, solenoid, userData, pourData, kegData);
messageService.Start();

// Once we've gone through the whole spin-up workflow without throwing,
// we can kill our process peacefully to enable the pre-merge validation
if (Config.IS_BOOTSTRAP_TEST) {
    console.log("Successfully validated all the workflows of the keberry application ( ͡° ͜ʖ ͡°) !!!")
    process.exit(0);
}

console.log("Server up and ready to serve (ง’̀-‘́)ง");