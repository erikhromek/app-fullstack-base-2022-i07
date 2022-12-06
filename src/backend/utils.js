module.exports = {

    // Check that device id exist in our device list
    deviceExists: function (devices, id) {
        return devices.filter(function (d) {
            return d.id == id
        }).length > 0;
    },

    // Check if new device has name, description and type
    deviceIsValid: function (device) {
        return 'name' in device && 'description' in device && 'type' in device;
    },

    // Check if new device data is valid 
    deviceDataIsValid: function (device) {
        return ('name' in device && device.name != "")
            || ('description' in device && device.description != "")
            || ('type' in device && [0, 1, 2].includes(device.type));
    },

    // Check if new device state is valid
    // If type is 0 (switch), state can only be 0 or 1 like a light with ON/OFF toggle
    // If type is 1 (discrete), state can have only step value (0, 1, 2, 3, etc.) like speed of a fan
    // If type is 2 (dimmable), state can be a float number between 0 and 1 like a dimmable light
    deviceStateIsValid: function (device, state) {
        return (device.type == 0 && [0, 1].includes(state))
            || (device.type == 1 && Number.isInteger(state) && state >= 0)
            || (device.type == 2 && state >= 0 && state <= 1);
    },
};