class ClientMessage 
{
    constructor(msg)
    {
        this.name = msg.name;
        this.data = msg.data;
    }
}

class ResponseMessage
{
    constructor(name, err, data)
    {
        this.name = name;
        this.error = err;
        this.data = data;
    }
}

class WeatherMessage
{
    constructor(weatherData)
    {
        this.name = "weather";
        this.data = weatherData;
    }
}

class AddUserMessage extends ClientMessage
{
    constructor(msg)
    {
        super(msg);
        if (super.data) {
            this.name = super.data.name;
        }
    }
}

class AddUserResponseMessage extends ResponseMessage
{
    constructor(err, guid)
    {
        super("addUserReponse", err, guid);
    }
}

class BadRequestResponseMessage extends ResponseMessage
{
    constructor(message)
    {
        super("failedResponse", message)
    }
}

function MessageService(users)
{
    this.users = users;

    this.sendResponse = (responseMsg, ws) => {
        try {
            ws.send(JSON.stringify(responseMsg));
        } catch (e) {
            if (e.message == "not opened") {
                console.log("Socket connection closed before message could be sent..");
            } else {            
                console.log("Error sending data through ws: " + e.message);
            }
        }
    }

    this.process = (msg, ws) => {

        var parsedMsg;
        try 
        {
            parsedMsg = JSON.parse(msg);
        } 
        catch (e)
        {
            responseMsg = new BadRequestResponseMessage("Failed to parse message: " + e.message);
            this.sendResponse(responseMsg, ws);
            return;
        } 

        if (parsedMsg && !parsedMsg.name){
            responseMsg = new BadRequestResponseMessage("All messages must contain a 'name' property");
            this.sendResponse(responseMsg, ws);
            return;
        }

        switch(parsedMsg.name)
        {
            case "addUser":
                this.users.addUser(new AddUserMessage(parsedMsg), (err, guid) => {
                    responseMsg = new AddUserResponseMessage(err, guid);
                    this.sendResponse(responseMsg, ws);
                });
                break;

            default:
                responseMsg = new BadRequestResponseMessage("Unknown operation '" + parsedMsg.name + "'");
        }
    }
}

function ExposeMessageService(users)
{
    return new MessageService(users);
}

module.exports = ExposeMessageService;