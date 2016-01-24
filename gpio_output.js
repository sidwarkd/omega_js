"use strict";

var OutputPin = require('./gpio_pin').OutputPin;

var outputModule = (function(){

  var HIGH = 1;
  var LOW = 0;

  var OutputDevice = function(pinNumber, opts){
    var defaults = {
      initial_state: 'off',
      active_low: false
    };

    this.options = opts || defaults;
    this.options.initial_state = (this.options.initial_state || defaults.initial_state).toLowerCase();

    this.is_on = false;

    if((/on/).test(this.options.initial_state)){
      this.is_on = true;
    }

    this.options.active_low = this.options.active_low || defaults.active_low;

    if(this.options.active_low){
      this.value = Number(!this.is_on);
    }
    else{
      this.value = Number(this.is_on);
    }

    OutputPin.call(this, pinNumber, this.options);

    this.write(this.value);
  };

  OutputDevice.prototype = Object.create(OutputPin.prototype);

  OutputDevice.prototype.on = function(){
    if(this.options.active_low){
      this.write(0);
      this.value = LOW;
    }
    else{
      this.write(1);
      this.value = HIGH;
    }
    this.is_on = true;
  };

  OutputDevice.prototype.off = function(){
    if(this.options.active_low){
      this.write(1);
      this.value = HIGH;
    }
    else{
      this.write(0);
      this.value = LOW;
    }
    this.is_on = false;
  };

  OutputDevice.prototype.toggle = function(){
    this.value ^= 1;
    this.write(this.value);
  };

  var LED = function(pinNumber, opts){
    OutputDevice.call(this, pinNumber, opts);
  };

  LED.prototype = Object.create(OutputDevice.prototype);

  LED.prototype.isLit = function(){
    return this.is_on;
  };

  var Relay = function(pinNumber, opts){
    OutputDevice.call(this, pinNumber, opts);
  };

  Relay.prototype = Object.create(OutputDevice.prototype);

  var Buzzer = function(pinNumber, opts){
    OutputDevice.call(this, pinNumber, opts);
  }

  Buzzer.prototype = Object.create(OutputDevice.prototype);

  Buzzer.prototype.beep = function(){
    // To correctly add this we should add some kind of continuous on/off
    // function in OutputDevice that then Buzzer could use for this and
    // LED could use for blink().
    throw Error("Functionality not implemented yet.");
  };

  return {
    OutputDevice: OutputDevice,
    LED: LED,
    Relay: Relay,
    Buzzer: Buzzer
  };
})();

module.exports = outputModule;