const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}

function FlowMeter(emitter, pin, tickCalibration, timeBetweenPours, notificationMl) {
	var self = this;
	this.gpio = require('rpi-gpio');
	this.pin = pin;
	this.tickCalibration = tickCalibration;
	this.timeBetweenPour = timeBetweenPours;
	this.notificationMl = notificationMl;
	this.emitter = emitter;

	this.timer = setTimeout(function(){},0);

	this.notificationMod = 0;
	this.litersPoured = 0;
	this.totalPoured = 0;

	this.finishPour = function() {

		self.totalPoured += self.litersPoured;
		self.emitter.emit('finishedPour', self.litersPoured);

		console.log('finishedPour: '+ self.litersPoured + '; total poured: ' + self.totalPoured);

		self.litersPoured = 0;
		self.notificationMod = 0;
	}

	this.setup = function() {

		this.gpio.setup(self.pin, self.gpio.DIR_IN, self.gpio.EDGE_BOTH, function(err) {
			if (err) {
				console.log("Encountered error while setting up GPIO pin: " + err);
			}
		});

		this.gpio.on('change', function(channel, value) {
			self.litersPoured += self.tickCalibration;

			clearTimeout(self.timer);
		    self.timer = setTimeout(self.finishPour,3000);
		});
	}
}

function createFlowmeter(params) {

	var pin = params.pin ? params.pin : 40;
	var tickCalibration = params.tickCalibration ? params.tickCalibration : 0.00223;
	var timeBetweenPours = params.timeBetweenPours ? params.timeBetweenPours : 3000;
	var notificationMl = params.notificationMl ? params.notificationMl : 50;

	const myEmitter = new MyEmitter();

	const flowMeter = new FlowMeter(myEmitter, pin, tickCalibration, timeBetweenPours);
	flowMeter.setup();

	return myEmitter;
}

module.exports = createFlowmeter;