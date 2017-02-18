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
        if (msg.data) {
            this.userName = msg.data.name;
        }
    }
}

class AddUserResponseMessage extends ResponseMessage
{
    constructor(err, guid)
    {
        super("addUserReponse", err, {guid: guid});
    }
}

class GetUsersResponseMessage extends ResponseMessage
{
    constructor(err, users)
    {
        super("getUsersResponse", err, {users: users});
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
    };

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

            case "getUsers":
                this.users.getUsers((err, users) => {
                    responseMsg = new GetUsersResponseMessage(err, users);
                    this.sendResponse(responseMsg, ws);
                });
                break;

            case "selectUser":
                break;

            default:
                responseMsg = new BadRequestResponseMessage("Unknown operation '" + parsedMsg.name + "'");
                this.sendResponse(responseMsg, ws);
        }
    };

    this.weatherUpdate = (stdout, ws) => {
        var tempCallback = function(data){
            if(data){
                var outData = JSON.parse(data);
                if(!outData.error){
                    try {
                        ws.send(JSON.stringify({"name":"temperature", "data": outData}));
                    } catch (e) {
                        if (e.message == "not opened") {
                            stdout.removeListener('data', tempCallback);
                        } else {            
                            console.log("error sending data through ws: " + e.message);
                        }
                    }
                }
            }    
        };
        
        stdout.on('data', tempCallback);
    }
}

function ExposeMessageService(users)
{
    return new MessageService(users);
}

module.exports = ExposeMessageService;