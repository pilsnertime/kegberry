const child_process = require('child_process');
const Assert = require('assert');
const rimraf = require('rimraf');
const WebSocket = require('ws');
const async = require('async');

//////////////////////////////////////////
// BACKEND SANITY CHECK
//////////////////////////////////////////
describe("Basic Server Validation", () => {
    let test_server;

    it('Run the application bootstrapping end-to-end', (done) => {
        test_server = child_process.spawn("node", ["app.js", "test-bootstrap"]);
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

//////////////////////////////////////////
// BACKEND API VALIDATION
//////////////////////////////////////////
describe("API Validation", () => {
    let test_server;
    let ws;

    // Clean up test database and spin up the server before each test run
    beforeEach((done) => {
        async.series([
            (cb) => {
                rimraf.sync("../kegberrydb_test")
                test_server = child_process.spawn("node", ["app.js", "test"]);
                test_server.stdout.on("data", (msg) => {
                    if (String(msg).includes("ready to serve")) {
                        return cb();
                    }              
                });
                test_server.stderr.on("data", (msg) => {
                    console.log(String(msg));
                });
            },
            (cb) => {
                ws = new WebSocket("ws://localhost:8080");
                ws.on("open", () => {
                    done();
                });
            }
        ]);
    });

    // Terminate test server after each test run
    afterEach((done) => {
        rimraf.sync("../kegberrydb_test")
        test_server.kill();
        ws.terminate();
        done();
    });

    // User API Tests
    describe("User APIs", () => {
        it("addUser, getUsers and removeUsers test", (done) => {
            async.waterfall([
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
                            Assert(response.data.id != undefined);
                            Assert.equal(response.data.name, "Steven ZHU");
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
                            return cb(err, response.data.users[0].id); 
                         });                        
                    });
                },
                (id, cb, err) => {
                    ws.removeAllListeners("message");
                    ws.send(JSON.stringify({"messageName": "removeUser", "data": {"id": id}}), (err) => {
                        ws.on('message', (msg) => {
                            var response = JSON.parse(msg);
                            Assert.equal(response.messageName, "removeUserResponse");
                            Assert(response.data != undefined);
                            Assert.equal(response.data.id, id);
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
                            Assert.equal(response.data.users.length, 0);
                            return cb(err); 
                         });                        
                    });
                },
                (cb) => {
                    done();
                }
            ]);
        });

        it("selectUser test", (done) => {
            async.waterfall([
                (cb) => {
                    ws.removeAllListeners("message");
                    ws.send(JSON.stringify({'messageName': 'addUser', 'data': {'name': 'Tom Misch'}}), (err) => {
                        ws.on('message', (msg) => {
                            var response = JSON.parse(msg);
                            Assert.equal(response.messageName, "addUserResponse");
                            Assert(response.data != undefined);
                            Assert(response.data.id != undefined);
                            Assert.equal(response.data.name, "Tom Misch");
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
                            Assert(response.data.id != undefined);
                            Assert.equal(response.data.name, "Steven ZHU");
                            return cb(err, response.data.id);
                         });                        
                    });                    
                },
                (id, cb, err) => {
                    ws.removeAllListeners("message");
                    ws.send(JSON.stringify({'messageName': 'selectUser', 'data': {'id': id}}), (err) => {
                        ws.on('message', (msg) => {
                            var response = JSON.parse(msg);
                            Assert.equal(response.messageName, "selectUserResponse");
                            Assert(response.data != undefined);
                            Assert.equal(response.data.name, "Steven ZHU");
                            return cb(err); 
                         });                        
                    });
                },
                (cb) => {
                    // Validate currentUser notification about a timeout
                    ws.removeAllListeners("message");
                    ws.on('message', (msg) => {
                        var response = JSON.parse(msg);
                        Assert.equal(response.messageName, "currentUserNotification");
                        Assert(response.data != undefined);
                        Assert.equal(response.data.id, "default_user");
                        return cb(null); 
                     });  
                },
                (cb) => {
                    done();
                }
            ]);
        }).timeout(10000);
    });
    
    // Pour API Tests
    describe("Pour APIs", () => {
        it("Pour test and getLastPours", (done) => {
            async.waterfall([
                (cb) => {
                    ws.removeAllListeners("message");
                    ws.send(JSON.stringify({'messageName': 'addUser', 'data': {'name': 'Tom Misch'}}), (err) => {
                        ws.on('message', (msg) => {
                            var response = JSON.parse(msg);
                            Assert.equal(response.messageName, "addUserResponse");
                            Assert(response.data != undefined);
                            Assert(response.data.id != undefined);
                            Assert.equal(response.data.name, "Tom Misch");
                            return cb(err, [response.data.id]);
                         });                        
                    });                    
                },
                (ids, cb, err) => {
                    ws.removeAllListeners("message");
                    ws.send(JSON.stringify({'messageName': 'addUser', 'data': {'name': 'Steven ZHU'}}), (err) => {
                        ws.on('message', (msg) => {
                            var response = JSON.parse(msg);
                            Assert.equal(response.messageName, "addUserResponse");
                            Assert(response.data != undefined);
                            Assert(response.data.id != undefined);
                            Assert.equal(response.data.name, "Steven ZHU");
                            ids.push(response.data.id)
                            return cb(err, ids);
                         });                        
                    });                    
                },
                (ids, cb, err) => {
                    ws.removeAllListeners("message");
                    ws.send(JSON.stringify({'messageName': 'selectUser', 'data': {'id': ids[1]}}), (err) => {
                        ws.on('message', (msg) => {
                            var response = JSON.parse(msg);
                            Assert.equal(response.messageName, "selectUserResponse");
                            Assert(response.data != undefined);
                            Assert.equal(response.data.name, "Steven ZHU");
                            return cb(err, ids); 
                         });                        
                    });
                },
                (ids, cb, err) => {
                    // Validate pourNotifications
                    ws.removeAllListeners("message");
                    ws.send(JSON.stringify({'messageName': 'fakePour'}), (err) => {
                        var incrementalNotification = false;
                        ws.on('message', (msg) => {
                            var response = JSON.parse(msg);
                            if (response.messageName != "weatherNotification")
                            {
                                Assert.equal(response.messageName, "pourUpdate");
                                Assert(response.data != undefined);
                                Assert(response.data.currentUser != undefined);
                                Assert.equal(response.data.currentUser.name, "Steven ZHU");
                                if (response.data.isFinished)
                                {
                                    Assert(incrementalNotification);
                                    Assert(response.data.totalPour > 0.3 && response.data.totalPour < 0.6);
                                    return cb(null, ids); 
                                }
                                else
                                {
                                    Assert(response.data.incrementalPour > 0 && response.data.incrementalPour < 0.1);
                                    incrementalNotification = true;
                                }
                            }
                         });  
                    });
                },
                (ids, cb, err) => {
                    // Validate currentUser notification about a timeout
                    ws.removeAllListeners("message");
                    ws.on('message', (msg) => {
                        var response = JSON.parse(msg);
                        Assert.equal(response.messageName, "currentUserNotification");
                        Assert(response.data != undefined);
                        Assert.equal(response.data.id, "default_user");
                        return cb(null, ids); 
                     });  
                },
                (ids, cb, err) => {
                    ws.removeAllListeners("message");
                    ws.send(JSON.stringify({'messageName': 'selectUser', 'data': {'id': ids[0]}}), (err) => {
                        ws.on('message', (msg) => {
                            var response = JSON.parse(msg);
                            Assert.equal(response.messageName, "selectUserResponse");
                            Assert(response.data != undefined);
                            Assert.equal(response.data.name, "Tom Misch");
                            return cb(err, ids); 
                         });                        
                    }); 
                },
                (ids, cb, err) => {
                    // Validate pourNotifications
                    ws.removeAllListeners("message");
                    ws.send(JSON.stringify({'messageName': 'fakePour'}), (err) => {
                        var incrementalNotification = false;
                        ws.on('message', (msg) => {
                            var response = JSON.parse(msg);
                            if (response.messageName != "weatherNotification")
                            {
                                Assert.equal(response.messageName, "pourUpdate");
                                Assert(response.data != undefined);
                                Assert(response.data.currentUser != undefined);
                                Assert.equal(response.data.currentUser.name, "Tom Misch");
                                Assert(response.data.incrementalPour > 0 && response.data.incrementalPour < 0.1);
                                if (response.data.isFinished)
                                {
                                    Assert(incrementalNotification);
                                    Assert(response.data.totalPour > 0.3 && response.data.totalPour < 0.6);
                                    return cb(null, ids); 
                                }
                                else
                                {
                                    incrementalNotification = true;
                                }
                            }
                         });  
                    });
                },
                (ids, cb, err) => {
                    // Validate currentUser notification about a timeout
                    ws.removeAllListeners("message");
                    ws.on('message', (msg) => {
                        var response = JSON.parse(msg);
                        Assert.equal(response.messageName, "currentUserNotification");
                        Assert(response.data != undefined);
                        Assert.equal(response.data.id, "default_user");
                        return cb(null, ids); 
                     });  
                },
                (ids, cb, err) => {
                    // Validate getLastPours with a top
                    ws.removeAllListeners("message");
                    ws.send(JSON.stringify({'messageName': 'getLastPours', 'data': {'top': 1}}), (err) => {
                        ws.on('message', (msg) => {
                            var response = JSON.parse(msg);
                            Assert.equal(response.messageName, "getLastPoursResponse");
                            Assert(response.data != undefined && response.data.pours != undefined);
                            Assert.equal(response.data.pours.length, 1);
                            Assert.equal(response.data.pours[0].userName, "Tom Misch");
                            return cb(err, ids);
                         });                        
                    });
                },
                (ids, cb, err) => {
                    // Validate getLastPours
                    ws.removeAllListeners("message");
                    ws.send(JSON.stringify({'messageName': 'getLastPours'}), (err) => {
                        ws.on('message', (msg) => {
                            console.log(msg);
                            var response = JSON.parse(msg);
                            Assert.equal(response.messageName, "getLastPoursResponse");
                            Assert(response.data != undefined && response.data.pours != undefined);
                            Assert.equal(response.data.pours.length, 2);
                            Assert.equal(response.data.pours[1].userName, "Steven ZHU");
                            return cb(err, ids);
                         });                        
                    });
                },
                (cb) => {
                    done();
                }
            ]);
        }).timeout(20000);
    });
});

//////////////////////////////////////////
// FRONTEND SANITY CHECK
//////////////////////////////////////////
describe("Frontend /beer Validation", () => {
    
    let test_server;

    it('Spin up the front-end server and ensure it keeps running', (done) => {
        test_server = child_process.spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ["start"], {cwd:"./beer"});
        test_server.on("exit", (code, signal) => {
            Assert.equal(code, 0, "Expected a successful 0 return code. Actual error code: " + code);
            done();
        });
        setTimeout(()=>{done()}, 14000);
    }).timeout(15000);

    afterEach((done) => {
        test_server.kill();
        done();
    });
});
