"use strict";
var fs = require("fs");
var path = require("path");

var GPIOModule = (function(){
  // TODO: move these paths to a config file
  var _export = "/sys/class/gpio/gpiochip0/subsystem/export";
  var _unexport = "/sys/class/gpio/gpiochip0/subsystem/unexport";
  var _gpioPath = "/sys/class/gpio/";

  // TODO: make this platform agnostic so we can specify pin mappings
  var _validPins = [0,1,6,7,12,13,14,18,19,20,21,23,26];

  var _configuredPins = {};

  var _INPUT = "in";
  var _OUTPUT = "out";

  function _isNumber(number){
    return !isNaN(parseInt(number, 10));
  }

  function _verifyPinIsValid(pinNumber){
    if(!_isNumber(pinNumber) || _validPins.indexOf(pinNumber) == -1){
      throw new Error("Invalid pin number: " + pinNumber);
    }
  }

  function _verifyPinIsNotInUse(pinNumber){
    if (fs.existsSync(path.join(_gpioPath, "gpio" + pinNumber)))
      throw new Error("Pin " + pinNumber + " is already in use");
  }

  // Pin object used for tracking pins
  var GPIOPin = function(pinNumber, direction, opts){
    var self = this;
    this.options = opts || {};

    _verifyPinIsValid(pinNumber);

    // Skipping verification is used for testing purposes
    if(!this.options.hasOwnProperty('skipVerify'))
      _verifyPinIsNotInUse(pinNumber);

    fs.writeFileSync(_export, pinNumber);
    this.pin = pinNumber;
    this.valuePath = path.join(_gpioPath, "gpio" + pinNumber, "value");
    this.directionPath = path.join(_gpioPath, "gpio" + pinNumber, "direction");
    this.setDirection(direction);
  };

  // "static" members of pin
  GPIOPin.INPUT = "in";
  GPIOPin.OUTPUT = "out";

  GPIOPin.prototype.setDirection = function(direction){
    fs.writeFileSync(this.directionPath, direction);
    this.direction = direction;
  };

  GPIOPin.prototype.read = function(){
    if(this.direction === _OUTPUT){
      throw new Error("Cannot read from a pin that is configured as an output");
    }
    return parseInt(fs.readFileSync(this.valuePath), 10);
  };

  GPIOPin.prototype.write = function(value){
    if(this.direction === _INPUT){
      throw new Error("Cannot write to a pin that is configured as an input");
    }

    value = !!value ? "1" : "0";
    fs.writeFileSync(this.valuePath, value);
  };

  GPIOPin.prototype.destroy = function(){
    this.setDirection(_INPUT);
    fs.writeFileSync(_unexport, this.pin);
  }

  var InputPin = function(pinNumber, opts){
    GPIOPin.call(this, pinNumber, _INPUT, opts || {});

    this.value = this.read();
  };

  InputPin.prototype = Object.create(GPIOPin.prototype);

  var OutputPin = function(pinNumber, opts){
    GPIOPin.call(this, pinNumber, _OUTPUT, opts || {});
  };

  OutputPin.prototype = Object.create(GPIOPin.prototype);

  return {
    GPIOPin: GPIOPin,
    InputPin: InputPin,
    OutputPin: OutputPin
  };

})();

module.exports = GPIOModule;