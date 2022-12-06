//=======[ Settings, Imports & Data ]==========================================

var PORT = 3000;

var express = require('express');
const fs = require('fs');
var path = require('path');
var app = express();
var utils = require('./mysql-connector');
const { deviceIsValid, deviceDataIsValid, deviceStateIsValid } = require('./utils');

// We won't be using this because we have MySQL data
var ephimeralDevices = [];

fs.readFile(path.join(__dirname, 'datos.json'), 'utf8', (err, data) => {
    if (err) {
        console.log("Error loading data: " + err);
        return;
    }
    ephimeralDevices = JSON.parse(data);
    console.log("Initial data read");
});

// to parse application/json
app.use(express.json());
// to serve static files
app.use(express.static('/home/node/app/static/'));

//=======[ Main module code ]==================================================

app.get('/devices', function (req, res) {

    utils.query('SELECT id, name, description, state, type FROM `Devices`',
        function (error, results, fields) {
            if (error) {
                console.log(error);
                res.status(500).send({ state: "An internal server error ocurred" });
            }
            else {
                res.status(200).send(results);
            }
        });


});

app.get('/device/:id', function (req, res) {

    utils.query('SELECT id, name, description, state, type FROM `Devices` where id = ?', [req.params.id],
        function (error, results, fields) {
            if (error) {
                console.log(error);
                res.status(500).send({ state: "An internal server error ocurred" });
            }
            else {
                if (results.length > 0)
                    res.status(200).json(results[0]);
                else
                    res.sendStatus(404);
            }
        });

});

app.post('/device', function (req, res) {
    if (deviceIsValid(req.body)) {
        // We initialize device state as 0
        utils.query('INSERT INTO `Devices`(name, description, type, state) VALUES (?, ?, ?, ?)', [req.body.name, req.body.description, req.body.type, 0],
            function (error, results, fields) {
                if (error) {
                    console.log(error);
                    res.status(500).send({ state: "An internal server error ocurred" });
                }
                else {
                    res.sendStatus(200);
                }
            });
    }
    else {
        res.status(400).send("Invalid device, attributes are missing");
    }

});

app.post('/device/:id/state', function (req, res) {
    utils.query('SELECT id, type FROM `Devices` where id = ?', [req.params.id],
        function (error, results, fields) {
            if (error) {
                console.log(error);
                res.send({ state: "An internal server error ocurred" }).status(500);
            }
            else {
                if (results.length > 0) {
                    if ('state' in req.body) {
                        var currentDevice = results[0];
                        if (deviceStateIsValid(currentDevice, req.body.state)) {
                            utils.query('UPDATE `Devices` set state= ? where id= ?', [req.body.state, currentDevice.id],
                                function (error, results, fields) {
                                    if (error) {
                                        console.log(error);
                                        res.status(500).send({ state: "An internal server error ocurred while updating device state" });
                                    }
                                    else {
                                        res.sendStatus(200);
                                    }
                                });
                        }
                        else {
                            res.status(400).send({ error: "State is not valid for this device." });
                        }
                    }
                    else {
                        res.status(400).send({ error: "Invalid format when sending state: body should be a JSON with 'state' attribute." });
                    }

                }
                else
                    res.sendStatus(404);
            }
        });
});

app.delete('/device/:id', function (req, res) {
    utils.query('SELECT id, type FROM `Devices` where id = ?', [req.params.id],
        function (error, results, fields) {
            if (error) {
                console.log(error);
                res.send({ state: "An internal server error ocurred" }).status(500);
            }
            else {
                if (results.length > 0) {
                    utils.query('DELETE FROM `Devices`  where id= ?', [req.params.id],
                        function (error, results, fields) {
                            if (error) {
                                console.log(error);
                                res.status(500).send({ state: "An internal server error ocurred while deleting device" });
                            }
                            else {
                                res.sendStatus(200);
                            }
                        });
                }
                else
                    res.sendStatus(404);
            }
        });
});

// We use PUT but we allow partial updates
app.put('/device/:id', function (req, res) {
    try {
        utils.query('SELECT id, name, description, type, state FROM `Devices` where id = ?', [req.params.id],
            function (error, results, fields) {
                if (error) {
                    console.log(error);
                    res.send({ state: "An internal server error ocurred" }).status(500);
                }
                else {
                    if (results.length > 0) {
                        // We get the device
                        var currentDevice = results[0];
                        if ('name' in req.body)
                            currentDevice.name = req.body.name;
                        if ('description' in req.body)
                            currentDevice.description = req.body.description;
                        if ('type' in req.body) {
                            currentDevice.type = req.body.type;
                            currentDevice.state = 0; // We reset device state when updating type
                        }
                        if (deviceDataIsValid(currentDevice)) {
                            utils.query('UPDATE `Devices` set name = ?, description = ?, type = ?, state = ? where id= ?', [currentDevice.name, currentDevice.description, currentDevice.type, currentDevice.state, req.params.id],
                                function (error, results, fields) {
                                    if (error) {
                                        console.log(error);
                                        res.status(500).send({ state: "An internal server error ocurred while updating device" });
                                    }
                                    else {
                                        res.sendStatus(200);
                                    }
                                });
                        }
                        else
                            res.status(400).send({ state: "Device data is invalid" });;
                    }
                    else
                        res.sendStatus(404);
                }
            });
    }
    catch (e) {
        console.log(e);
        res.status(500).send({ state: "An internal server error ocurred" });
    }
});

app.listen(PORT, function (req, res) {
    console.log({ state: "NodeJS API running correctly" });
});

//=======[ End of file ]=======================================================
