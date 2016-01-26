"use strict";

var OutputPin = require('./gpio_base').OutputPin;

var outputModule = (function(){

  var HIGH = 1;
  var LOW = 0;

  var LED = function(pinNumber, opts){
    OutputPin.call(this, pinNumber, opts);
  };

  LED.prototype = Object.create(OutputPin.prototype);

  LED.prototype.isLit = function(){
    return this.is_on;
  };

  var Relay = function(pinNumber, opts){
    OutputPin.call(this, pinNumber, opts);
  };

  Relay.prototype = Object.create(OutputPin.prototype);

  var Buzzer = function(pinNumber, opts){
    OutputPin.call(this, pinNumber, opts);
  }

  Buzzer.prototype = Object.create(OutputPin.prototype);

  Buzzer.prototype.beep = function(){
    // To correctly add this we should add some kind of continuous on/off
    // function in OutputPin that then Buzzer could use for this and
    // LED could use for blink().
    throw Error("Functionality not implemented yet.");
  };

  return {
    LED: LED,
    Relay: Relay,
    Buzzer: Buzzer
  };
})();

module.exports = outputModule;