const child_process = require('child_process');
const Assert = require('assert');
const rimraf = require('rimraf');
const WebSocket = require('ws');
const async = require('async');

describe("Basic Server Validation", () => {
    let test_server;

    it('Run the application bootstrapping end-to-end', (done) => {
        test_server = child_process.spawn("node.exe", ["app.js", "test-bootstrap"]);
        test_server.on("exit", (code, signal) => {
            Assert.equal(code, 0, "Expected a successful 0 return code. Actual error code: " + code);
            done();
        });
    });

    afterEach((done) => {
        test_server.kill();
        done();
    });
});

describe("API Validation", () => {
    let test_server;
    let ws;

    beforeEach((done) => {
        rimraf.sync("../kegberrydb_test")
        test_server = child_process.spawn("node.exe", ["app.js", "test"]);
        ws = new WebSocket("ws://localhost:8080");
        ws.on("open", () => {
            done();
        });
    });

    afterEach((done) => {
        rimraf.sync("../kegberrydb_test")
        test_server.kill();
        done();
    });

    describe("User APIs", () => {

        it("addUser and getUsers test", (done) => {

            async.series([
                (cb) => {
                    ws.send(JSON.stringify({'messageName': 'getUsers'}), (err) => {
                        ws.on('message', (msg) => {
                            var response = JSON.parse(msg);
                            Assert.equal(response.messageName, "getUsersResponse");
                            Assert(response.data != undefined);
                            Assert(response.data.users != undefined);
                            Assert.equal(response.data.users.length, 0);
                            return cb(err); 
                         });                        
                    });
                },
                (cb) => {
                    ws.removeAllListeners("message");
                    ws.send(JSON.stringify({'messageName': 'addUser', 'data': {'name': 'Steven ZHU'}}), (err) => {
                        ws.on('message', (msg) => {
                            var response = JSON.parse(msg);
                            Assert.equal(response.messageName, "addUserResponse");
                            Assert(response.data != undefined);
                            Assert(response.data.user != undefined);
                            Assert(response.data.user.id != undefined);
                            Assert.equal(response.data.user.name, "Steven ZHU");
                            return cb(err);
                         });                        
                    });                    
                },
                (cb) => {
                    ws.removeAllListeners("message");
                    ws.send(JSON.stringify({'messageName': 'getUsers'}), (err) => {
                        ws.on('message', (msg) => {
                            var response = JSON.parse(msg);
                            Assert.equal(response.messageName, "getUsersResponse");
                            Assert(response.data != undefined);
                            Assert(response.data.users != undefined);
                            Assert.equal(response.data.users.length, 1);
                            Assert.equal(response.data.users[0].name, "Steven ZHU");
                            return cb(err); 
                         });                        
                    });
                },
                (cb) => {
                    done();
                }
            ]);

        });

    });    
});
