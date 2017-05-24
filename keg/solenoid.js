var gpio = require('rpi-gpio');


var pin = 29;

gpio.setup(pin, gpio.DIR_OUT, write);

function write() {
	gpio.write(pin, true, function(err) {
	    if (err) throw err;
	    console.log('Written to pin');
	});
	setTimeout(close, 5000);
}

function close() {
	gpio.write(pin, false, function(err) {
		if (err) throw err;
	    console.log('Written to pin');
	});
	setTimeout(write, 3000);
}