class ClientMessage 
{
    constructor(msg)
    {
        this.messageName = msg.name;
        this.data = msg.data;
    }
}

class ResponseMessage
{
    constructor(name, err, data)
    {
        this.messageName = name;
        this.error = err;
        this.data = data;
    }
}

class WeatherNotificationMessage extends ResponseMessage
{
    constructor(err, weatherData)
    {
        super("weatherNotification", err, weatherData);
    }
}

class PourNotificationMessage extends ResponseMessage
{
    constructor(currentUser, litersPoured, totalPour, finishedPour)
    {
        super("pourUpdate", null, {
            currentUser: currentUser,
            incrementalPour: litersPoured,
            totalPour: totalPour,
            isFinished: finishedPour
        });
    }
}

class CalibrationResponseMessage extends ResponseMessage
{
    constructor(litersPerTick)
    {
        super("calibrationResponse", null, {
            litersPerTick: litersPerTick
        });
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
    constructor(err, user)
    {
        super("addUserResponse", err, user);
    }
}

class GetUsersResponseMessage extends ResponseMessage
{
    constructor(err, users)
    {
        super("getUsersResponse", err, {users: users});
    }
}

class SelectUserResponseMessage extends ResponseMessage
{
    constructor(err, user)
    {
        super("selectUserResponse", err, user);
    }
}

class GetLastPoursResponseMessage extends ResponseMessage
{
    constructor(err, pours)
    {
        super("getLastPoursResponse", err, {pours: pours});
    }
}

class CurrentUserNotificationMessage extends ResponseMessage
{
    constructor(err, user)
    {
        super("currentUserNotification", err, user);
    }
}

class BadRequestResponseMessage extends ResponseMessage
{
    constructor(message)
    {
        super("failedResponse", message)
    }
}

class OperationInProgressErrorMessage extends ResponseMessage
{
    constructor(message)
    {
        super("failedResponse", "Operation is currently used by another client. Please retry in a bit.");
    }
}

module.exports = {
    ClientMessage: ClientMessage,
    ResponseMessage: ResponseMessage,
    WeatherNotificationMessage: WeatherNotificationMessage,
    PourNotificationMessage: PourNotificationMessage,
    AddUserMessage: AddUserMessage,
    AddUserResponseMessage: AddUserResponseMessage,
    GetUsersResponseMessage: GetUsersResponseMessage,
    SelectUserResponseMessage: SelectUserResponseMessage,
    GetLastPoursResponseMessage: GetLastPoursResponseMessage,
    CurrentUserNotificationMessage: CurrentUserNotificationMessage,
    BadRequestResponseMessage: BadRequestResponseMessage,
    CalibrationResponseMessage: CalibrationResponseMessage,
    OperationInProgressErrorMessage: OperationInProgressErrorMessage
};