import Adafruit_DHT,json,time,sys

sensor = Adafruit_DHT.DHT22

pin = 6
delay_seconds = 10

if len(sys.argv) < 2:
	sys.stdout.write(json.dumps({"error": "Please provide the delay in seconds as the argument", "data": {}}))
else:
	delay_seconds = float(sys.argv[1])

while True:
	# Try to grab a sensor reading.  Use the read_retry method which will retry up
	# to 15 times to get a sensor reading (waiting 2 seconds between each retry).
	humidity, temperature = Adafruit_DHT.read_retry(sensor, pin) 
	# Send JSON out
	if humidity is not None and temperature is not None:
		sys.stdout.write(json.dumps({"error":None, "data":{"temperature": temperature, "humidity": humidity}}))
	else:
		sys.stdout.write(json.dumps({"error": "Couldn't read from sensor", "data":{}}))
	sys.stdout.flush()
	time.sleep(delay_seconds)


