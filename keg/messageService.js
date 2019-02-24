var KegEngine = require('./kegEngine');
const Configuration = require('./configuration');
const Websocket = require('ws');
const {BadRequestResponseMessage, WeatherNotificationMessage} = require('./definitions');

class MessageService
{
    constructor(wss, weatherProcessStdout, flowmeter, solenoid, users, pours)
    {
        this.wss = wss;
        this.weatherProcessStdout = weatherProcessStdout;
        this.flowmeter = flowmeter;
        this.solenoid = solenoid;
        this.users = users;
        this.pours = pours;
    }

    Brooadcast(msg) {
        this.wss.clients.forEach((client) => {
            if (client.readyState === Websocket.OPEN) {
                MessageService._sendMessage(msg, client);
            }
        });
    };

    Start() {
        if (!this.kegEngine) {
            this.kegEngine = new KegEngine(this.solenoid, this.flowmeter, this.users, this.pours);
            this.kegEngine.Initialize((msg) => {this.Brooadcast(msg)});
        }

        this.wss.on('connection', (ws) => {
            console.log("Web socket client connected.");

            ws.on('message', (message) => {
                console.log('Recieved a message from the client: %s', message);
                this._process(message, ws);
            });              
        });

        this._weatherBroadcasts();
    };

    static _sendMessage(msg, client) {
        try {
            client.send(JSON.stringify(msg), (error) => {
                if (error) { 
                    console.log(error);
                    client.terminate();
                }                        
            });
        } catch (e) {
            console.log(e.message);
            client.terminate();
        }
    };

    _process(msg, ws) {

        var parsedMsg;
        try 
        {
            parsedMsg = JSON.parse(msg);
        } 
        catch (e)
        {
            var responseMsg = new BadRequestResponseMessage("Failed to parse message: " + e.message);
            MessageService._sendMessage(responseMsg, ws);
            return;
        } 

        if (parsedMsg && !parsedMsg.messageName){
            var responseMsg = new BadRequestResponseMessage("All messages must contain a 'messageName' property");
            MessageService._sendMessage(responseMsg, ws);
            return;
        }

        var broadcast = (data) => {this.Brooadcast(data);};
        var personal = (data) => {MessageService._sendMessage(data, ws);};

        switch(parsedMsg.messageName)
        {
            case "addUser":
                this.kegEngine.AddUser(parsedMsg, broadcast, personal);
                break;

            case "getUsers":
                this.kegEngine.GetUsers(parsedMsg, broadcast, personal);
                break;

            case "selectUser":
                this.kegEngine.SelectUser(parsedMsg, broadcast, personal);
                break;
                
            case "removeUser":
                this.kegEngine.RemoveUser(parsedMsg, broadcast, personal);
                break;

            case "getLastPours":
                this.kegEngine.GetLastPours(parsedMsg, broadcast, personal);
                break;

            case "calibrate":
                this.kegEngine.Calibrate(parsedMsg, broadcast, personal);
                break;

            case "fakePour":
                this.kegEngine.FakePour();
                break;

            default:
                var responseMsg = new BadRequestResponseMessage("Unknown operation '" + parsedMsg.messageName + "'");
                MessageService._sendMessage(responseMsg, ws);
        }
    };

    _weatherBroadcasts() {
        if (Configuration.IS_TEST_HOST)
        {            
            var fakeWeatherCallback = () => {
                this.weatherProcessStdout.emit('data', JSON.stringify({"data":{"temperature": (Math.random()+7), "humidity": (Math.random()+50)}}));
                setTimeout(fakeWeatherCallback, Configuration.TEMP_POLLING_SEC * 1000);
            }
            fakeWeatherCallback();
        }

        var weatherCallback = (data) => {
            if (data){
                var outData = JSON.parse(data);
                this.Brooadcast(new WeatherNotificationMessage(outData.error, outData.data));
            }    
        };
        
        this.weatherProcessStdout.on('data', weatherCallback);
    };
}

function ExposeMessageService(wss, weatherProcessStdout, flowmeter, solenoid, users, pours)
{
    return new MessageService(wss, weatherProcessStdout, flowmeter, solenoid, users, pours);
}

module.exports = ExposeMessageService;