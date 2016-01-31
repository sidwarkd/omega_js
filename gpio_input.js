"use strict";

var InputPin = require('./gpio_base').InputPin;
var extend = require('./helpers.js').extend;

var inputModule = (function(){

  var HIGH = 1;
  var LOW = 0;

  var Switch = function(pinNumber, opts){
    InputPin.call(this, pinNumber, opts);

    var defaults = {
      on_when: "high"
    };

    this.options = extend(defaults, this.options);

    if((/low/).test(this.options.on_when)){
      this.active_low = true;
    }
    else{
      this.active_low = false;
    }
  };

  Switch.prototype = Object.create(InputPin.prototype);

  Switch.prototype.isOn = function(){
    this.value = this.read();
    if(this.active_low)
      return Boolean(!this.value);
    else
      return Boolean(this.value);
  };

  var Button = function(pinNumber, opts){
    Switch.call(this, pinNumber, opts);

    var defaults = {
      when_pressed: "high"
    };

    this.options = extend(defaults, this.options);

    if((/low/).test(this.options.when_pressed)){
      this.active_low = true;
    }
    else{
      this.active_low = false;
    }
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