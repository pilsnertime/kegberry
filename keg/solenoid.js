var gpio = require('rpi-gpio');


var pin = 38;

gpio.setup(pin, gpio.DIR_OUT, write);

function write(err) {
	if (err) throw err;

	gpio.write(pin, true, function(err) {
	    if (err) throw err;
	    console.log('Written true to pin');
	});
	setTimeout(close, 15000);
}

function close() {
	gpio.write(pin, false, function(err) {
		if (err) throw err;
	    console.log('Written false to pin');
	});
	setTimeout(write, 2000);
}