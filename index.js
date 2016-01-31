"use strict";

var base = require('./gpio_base');
var inputs = require('./gpio_input');
var outputs = require('./gpio_output');

var omega_gpio = {
  Switch: inputs.Switch,
  Button: inputs.Button,
  LED: outputs.LED,
  Relay: outputs.Relay,
  Buzzer: outputs.Buzzer,
  InputPin: base.InputPin,
  OutputPin: base.OutputPin 
};

module.exports = omega_gpio;