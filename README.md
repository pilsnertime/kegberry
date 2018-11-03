# Kegberry [![Build Status](https://travis-ci.com/pilsnertime/kegberry.svg?branch=master)](https://travis-ci.com/pilsnertime/kegberry)
## Backend Websocket Server APIs
The Kegberry Backend Server can support several simultaneous websocket client connections. Individual clients will receive personal responses to their requests and ALL clients will receive notifications about the keg climate, pours, etc.
### Establishing a client connection

```javascript
const WebSocket = require('ws');
ws = new WebSocket("ws://localhost:8080");
ws.on("open", () => {
  console.log("This client connected!");
});
```
> This client connected!
### Sending a request and waiting for a response

```javascript
ws.send(JSON.stringify({'messageName': 'getUsers'}), (err) => {
  ws.on('message', (msg) => {
    var response = JSON.parse(msg);
	console.log("We already have " + response.data.users.length + " users!");
  });                        
});
```
> We already have 4 users!

### Request API signatures
Every request made by the client is a websocket message with these expected properties:

Property | Description
------------ | -------------
messageName | [Required] <<i>string</i>> Defines the request type. 
data | [Optional] <<i>object</i>> API-specific struct that serves as the request body.


### Response API signatures
Websocket clients that made a request will receive an ACK in the form of a personalized result.

Property | Description
------------ | -------------
messageName | <<i>string</i>> Defines the response type. 
data | <<i>object</i>> API-specific struct that serves as the response body.
error |<<i>string</i>> Error message if something went wrong.

### User APIs
#### addUser
##### Request
messageName | data
------------ | -------------
 "addUser" | userRequest
 
userRequest |  |
-------------| ------------|
<b>Property Name</b>| <b> Description </b> |
name | [Required] <<i>string</i>> Display name.

```javascript
{'messageName': 'addUser', 'data': {'name': 'Steven ZHU'}}
```
##### Response
messageName | data
------------ | -------------
 "addUserResponse" | user
 
user |  |
-------------| ------------|
<b>Property Name</b>| <b> Description </b> |
id|<<i>string</i>> Guid.
name | <<i>string</i>> Display name.
 
 
 
```javascript
{  
   "messageName":"addUserResponse",
   "error":null,
   "data":{  
      "id":"4d5fcc73-22b0-9043-c332-6516fb05d6af",
      "name":"Steven ZHU"
   }
}
```
#### getUsers
##### Request
messageName |
------------|
"getUsers"|

```javascript
{'messageName': 'getUsers'}
```
##### Response
messageName | data
------------ | -------------
 "getUsersResponse" | user[]
 
 user |  |
 -------------| ------------|
 <b>Property Name</b>| <b> Description </b> |
 id|<<i>string</i>> Guid.
 name | <<i>string</i>> Display name.
 
 
 
```javascript
{  
   "messageName":"getUsersResponse",
   "error":null,
   "data":[  
      {  
         "id":"4d5fcc73-22b0-9043-c332-6516fb05d6af",
         "name":"Steven ZHU"
      },
      {  
         "id":"8f9c8e54-0c40-418e-a7bb-9a1c76b24b46",
         "name":"Tom Misch"
      }
   ]
}
```
#### selectUser
Select User is a powerful API because it opens the solenoid and allows the user to start consuming beer. This request is very likely to result in several notifications to be sent to the clients (Refer to the Notifications section).
##### Request
messageName | data
------------ | -------------
 "selectUser" | userSelectRequest
 
userSelectRequest |  |
-------------| ------------|
<b>Property Name</b>| <b> Description </b> |
id | [Required] <<i>string</i>> The GUID associated with the user.

```javascript
{'messageName': 'selectUser', 'data': {'id': '20cfd0fe-4159-543e-d42d-14a5b9853a0c'}}
```
##### Response
messageName | data
------------ | -------------
 "selectUserResponse" | user
 
user |  |
-------------| ------------|
<b>Property Name</b>| <b> Description </b> |
id|<<i>string</i>> Guid.
name | <<i>string</i>> Display name.
 
 
 
```javascript
{  
   "messageName":"selectUserResponse",
   "error":null,
   "data":{  
      "id":"20cfd0fe-4159-543e-d42d-14a5b9853a0c",
      "name":"Steven ZHU"
   }
}
```

## TODOs
### Backend
- [x] User API
	 - [x] Implementation
	 - [x] Docs
	 - [x] Tests
- [ ] Calibrate API
	 - [ ] Implementation
	 - [ ] Docs
	 - [ ] Tests
- [ ] Fake Pour API
	 - [ ] Implementation
	 - [ ] Docs
	 - [ ] Tests
- [ ] Weather API
	 - [X] Implementation
	 - [ ] Docs
	 - [ ] Tests
- [ ] Pour Notification API
	 - [X] Implementation
	 - [ ] Docs
	 - [ ] Tests
- [ ] Keg Info API
	 - [ ] Implementation
	 - [ ] Docs
	 - [ ] Tests

### Frontend
- [x] Merge validation test
- [x] :poop:Something useful? 
