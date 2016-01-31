"use strict";

var OutputPin = require('./gpio_base').OutputPin;
var extend = require('./helpers.js').extend;

var outputModule = (function(){

  var HIGH = 1;
  var LOW = 0;

  var LED = function(pinNumber, opts){
    OutputPin.call(this, pinNumber, opts);

    var defaults = {
      on_when: "high"
    };

    this.options = extend(defaults, this.options);

    if((/low/).test(this.options.on_when)){
      this.options.active_low = true;
    }
    else{
      this.options.active_low = false;
    }
  };

  LED.prototype = Object.create(OutputPin.prototype);

  LED.prototype.isLit = function(){
    return this.is_on;
  };

  var Relay = function(pinNumber, opts){
    OutputPin.call(this, pinNumber, opts);

    var defaults = {
      on_when: "high"
    };

    this.options = extend(defaults, this.options);

    if((/low/).test(this.options.on_when)){
      this.options.active_low = true;
    }
    else{
      this.options.active_low = false;
    }
  };

  Relay.prototype = Object.create(OutputPin.prototype);

  var Buzzer = function(pinNumber, opts){
    OutputPin.call(this, pinNumber, opts);

    var defaults = {
      on_when: "high"
    };

    this.options = extend(defaults, this.options);

    if((/low/).test(this.options.on_when)){
      this.options.active_low = true;
    }
    else{
      this.options.active_low = false;
    }
  }

  Buzzer.prototype = Object.create(OutputPin.prototype);

  Buzzer.prototype.beep = function(){
    throw Error("Functionality not implemented yet.");
  };

  return {
    LED: LED,
    Relay: Relay,
    Buzzer: Buzzer
  };
})();

module.exports = outputModule;