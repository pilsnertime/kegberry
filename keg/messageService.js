var KegEngine = require('./kegEngine');
const Configuration = require('./configuration');
const {BadRequestResponseMessage} = require('./definitions');

class MessageChannel
{
    constructor(ws)
    {
        this.ws = ws;
    }    

    // Send message on the websocket channel. Returns true if the connection closed.
    SendMessage(responseMsg) {
        try {
            this.ws.send(JSON.stringify(responseMsg));
        } catch (e) {
            if (e.message == "not opened") {
                console.log("Socket connection closed before message could be sent..");
                return true;
            } else {            
                console.log("Error sending data through ws: " + e.message);
            }
        }
        return false;
    };
}

class MessageService
{
    constructor(wss, weatherProcess, flowmeter, solenoid, users, pours)
    {
        this.wss = wss;
        this.weatherProcess = weatherProcess;
        this.flowmeter = flowmeter;
        this.solenoid = solenoid;
        this.users = users;
        this.pours = pours;
    }

    Start() {
        if (!this.kegEngine) {
            this.wss.on('connection', (ws) => {
                console.log("Web socket client connected.");

                ws.on('message', (message) => {
                    console.log('Recieved a message from the client: %s', message);
                    this.process(message, ws);
                    if (Configuration.MOCK_POURS)
                    {
                        this.mockPour(message);
                    }

                });
                
                this.messageChannel = new MessageChannel(ws);
                this.kegEngine = new KegEngine(this.messageChannel, this.solenoid, this.users, this.pours);

                this.kegEngine.Initialize();
                this.kegEngine.HandleWeather(this.weatherProcess.stdout);
                this.kegEngine.HandlePours(this.flowmeter);
            });
        }
    }

    process(msg, ws) {

        var parsedMsg;
        try 
        {
            parsedMsg = JSON.parse(msg);
        } 
        catch (e)
        {
            var responseMsg = new BadRequestResponseMessage("Failed to parse message: " + e.message);
            this.messageChannel.SendMessage(responseMsg, ws);
            return;
        } 

        if (parsedMsg && !parsedMsg.messageName){
            var responseMsg = new BadRequestResponseMessage("All messages must contain a 'messageName' property");
            this.messageChannel.SendMessage(responseMsg, ws);
            return;
        }

        switch(parsedMsg.messageName)
        {
            case "addUser":
                this.kegEngine.AddUser(parsedMsg);
                break;

            case "getUsers":
                this.kegEngine.GetUsers(parsedMsg);
                break;

            case "selectUser":
                this.kegEngine.SelectUser(parsedMsg);
                break;

            case "fakePour":
                console.log("Got a fake pour request");
                break;

            default:
                var responseMsg = new BadRequestResponseMessage("Unknown operation '" + parsedMsg.messageName + "'");
                this.messageChannel.SendMessage(responseMsg, ws);
        }
    };

    mockPour(msg) {
        var parsedMsg;
        try 
        {
            parsedMsg = JSON.parse(msg);
        } 
        catch (e)
        {
            var responseMsg = new BadRequestResponseMessage("Failed to parse message: " + e.message);
            this.messageChannel.SendMessage(responseMsg, ws);
            return;
        } 
        switch(parsedMsg.messageName)
        {
            case "fakePour":
                this.kegEngine.FakePour(this.flowmeter);
                break;
        }
    };
}

function ExposeMessageService(wss, weatherProcess, flowmeter, solenoid, users, pours)
{
    return new MessageService(wss, weatherProcess, flowmeter, solenoid, users, pours);
}

module.exports = ExposeMessageService;