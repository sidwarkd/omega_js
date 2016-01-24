"use strict";

var InputPin = require('./gpio_pin').InputPin;

var inputModule = (function(){

  var HIGH = 1;
  var LOW = 0;

  var InputDevice = function(pinNumber, opts){
    var defaults = {};

    this.options = opts || defaults;

    InputPin.call(this, pinNumber, this.options);
  };

  InputDevice.prototype = Object.create(InputPin.prototype);

  var Switch = function(pinNumber, opts){
    var defaults = {
      pullup: true
    };

    this.options = opts || defaults;
    if(!this.options.hasOwnProperty('pullup'))
      this.options.pullup = defaults.pullup;

    InputDevice.call(this, pinNumber, opts);
  };

  Switch.prototype = Object.create(InputDevice.prototype);

  Switch.prototype.isOn = function(){
    this.value = this.read();
    if(this.options.pullup)
      return Boolean(!this.value);
    else
      return Boolean(this.value);
  };

  var Button = function(pinNumber, opts){
    Switch.call(this, pinNumber, opts);
  }

  Button.prototype = Object.create(Switch.prototype);

  Button.prototype.isPressed = function(){
    return this.isOn();
  };

  return {
    InputDevice: InputDevice,
    Switch: Switch,
    Button: Button
  };
})();

module.exports = inputModule;