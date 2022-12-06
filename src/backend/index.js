//=======[ Settings, Imports & Data ]==========================================

var PORT = 3000;

var express = require('express');
const fs = require('fs');
var path = require('path');
var app = express();
var utils = require('./mysql-connector');
const { deviceIsValid, deviceDataIsValid, deviceStateIsValid, deviceExists } = require('./utils');

var devices = [];

fs.readFile(path.join(__dirname, 'datos.json'), 'utf8', (err, data) => {
    if (err) {
        console.log("Error loading data: " + err);
        return;
    }
    devices = JSON.parse(data);
    console.log("Initial data read");
});

// to parse application/json
app.use(express.json());
// to serve static files
app.use(express.static('/home/node/app/static/'));

//=======[ Main module code ]==================================================

app.get('/devices', function (req, res) {
    res.json(devices).status(200);
});

app.get('/device/:id', function (req, res) {
    var devicesFiltered = devices.filter(function (d) {
        return d.id == req.params.id
    });
    if (devicesFiltered.length > 0)
        res.json(devicesFiltered[0]).status(200);
    else
        res.sendStatus(404);

});

app.post('/device', function (req, res) {
    if (deviceIsValid(req.body)) {
        var newId = Date.now(); // For simplicity sake, we create a pseudo-random numeric id for transient devices
        var newDevice = req.body;
        newDevice.id = newId;
        newDevice.state = 0; // We initialize device state
        devices.push(newDevice);

        devices.sort((a,b) => a.id - b.id);

        res.json(devices[[devices.length - 1]]).status(200);
    }
    else {
        res.send("Invalid device, attributes are missing").status(400);
    }

});

app.post('/device/:id/state', function (req, res) {
    var devicesFiltered = devices.filter(function (d) {
        return d.id == req.params.id
    });
    if (devicesFiltered.length > 0) {
        if ('state' in req.body) {
            var currentDevice = devicesFiltered[0];
            if (deviceStateIsValid(currentDevice, req.body.state)) {
                currentDevice.state = req.body.state;
                // We remove the original device from the array and re-add it
                devices = devices.filter(function (d) {
                    return d.id != currentDevice.id;
                });
                devices.push(currentDevice);

                devices.sort((a,b) => a.id - b.id);

                res.json(currentDevice).status(200);
            }
            else {
                res.send({error: "State is not valid for this device."}).status(400);
            }
        }
        else {
            res.send({error: "Invalid format when sending state: body should be a JSON with 'state' attribute."}).status(400);
        }


    }
    else
        res.sendStatus(404);
});

app.delete('/device/:id', function (req, res) {
    var devicesFiltered = devices.filter(function (d) {
        return d.id == req.params.id
    });
    if (devicesFiltered.length > 0) {
        // We remove the device from the device list
        device = devicesFiltered[0];
        devices = devices.filter(function (d) {
            return d.id != devicesFiltered[0].id
        });
        res.json(device).status(200);
    }
    else
        res.sendStatus(404);
});

// We use PUT but we allow partial updates
app.put('/device/:id', function (req, res) {
    try {
        if (deviceExists(devices, req.params.id)) {
            if (deviceDataIsValid(req.body)) {

                // We get the device
                var currentDevice = devices.filter(function (d) {
                    return d.id == req.params.id;
                })[0];

                if ('name' in req.body)
                    currentDevice.name = req.body.name;
                if ('description' in req.body)
                    currentDevice.description = req.body.description;
                if ('type' in req.body) {
                    currentDevice.type = req.body.type;
                    currentDevice.state = 0; // We reset device state when updating type
                }

                // We remove the original device from the array and re-add it (TODO: implement real persistence)
                devices = devices.filter(function (d) {
                    return d.id != currentDevice.id
                });

                devices.push(currentDevice);

                devices.sort((a,b) => a.id - b.id);
                res.json(currentDevice).status(200);
            }
            else {
                res.send({state: "Device data is invalid"}).status(400);
            }
        }
        else {
            res.send({state: "Device does not exist"}).status(404);
        }
    }
    catch (e) {
        console.log(e);
        res.send({state: "An internal server error ocurred"}).status(500);
    }
});

app.listen(PORT, function (req, res) {
    console.log({state: "NodeJS API running correctly"});
});

//=======[ End of file ]=======================================================
