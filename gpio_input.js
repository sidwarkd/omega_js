"use strict";

var InputPin = require('./gpio_base').InputPin;
var extend = require('./helpers.js').extend;

var inputModule = (function(){

  var HIGH = 1;
  var LOW = 0;

  var Switch = function(pinNumber, opts){
    InputPin.call(this, pinNumber, opts);

    var defaults = {
      pullup: true
    };

    this.options = extend(defaults, this.options);
    
    if(!this.options.hasOwnProperty('pullup'))
      this.options.pullup = defaults.pullup;

  };

  Switch.prototype = Object.create(InputPin.prototype);

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
    Switch: Switch,
    Button: Button
  };
})();

module.exports = inputModule;