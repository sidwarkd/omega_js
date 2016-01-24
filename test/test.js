"use strict";

var assert = require('assert');
var fs = require('fs');
var mock = require('mock-fs');
var should = require('chai').should();

var GPIOPin = require('../gpio_pin').GPIOPin;
var InputPin = require('../gpio_pin').InputPin;
var OutputPin = require('../gpio_pin').OutputPin;

var OutputDevice = require('../gpio_output').OutputDevice;
var LED = require('../gpio_output').LED;
var Relay = require('../gpio_output').Relay;
var Buzzer = require('../gpio_output').Buzzer;

var InputDevice = require('../gpio_input').InputDevice;
var Switch = require('../gpio_input').Switch;
var Button = require('../gpio_input').Button;


describe('GPIOPin', function(){

  before(function(){
    mock({
      '/sys/class/gpio/gpiochip0/subsystem':{
        'export': '',
        'unexport': ''
      },
      // for testing input scenario
      '/sys/class/gpio/gpio0':{
        'value':'1',
        'direction':'in'
      },
      // for testing output scenario
      '/sys/class/gpio/gpio1':{
        'value':'',
        'direction':'out'
      }
    });
  });

  afterEach(function(){
    // clear the export and unexport files
    fs.writeFileSync('/sys/class/gpio/gpiochip0/subsystem/export', '');
    fs.writeFileSync('/sys/class/gpio/gpiochip0/subsystem/unexport', '');
  });

  after(function(){
    mock.restore();
  });

  describe('InputPin', function(){
    describe('creation', function(){
      var inputPin;
      before(function(){
        inputPin = new InputPin(0, {skipVerify:true});
      });

      it('should export the pin', function(){
        var data = fs.readFileSync('/sys/class/gpio/gpiochip0/subsystem/export');
        String(data).should.equal('0');
      });
      it('should be a GPIOPin', function(){
        //outputPin.should.be.a('GPIOPin');
        (inputPin instanceof GPIOPin).should.equal(true);
      });
      it('should set the pin number', function(){
        inputPin.pin.should.equal(0);
      });
      it('should have the correct value path', function(){
        inputPin.valuePath.should.equal('/sys/class/gpio/gpio0/value');
      });
      it('should have the correct direction', function(){
        var data = fs.readFileSync(inputPin.directionPath);
        String(data).should.equal(GPIOPin.INPUT);
      });
    });
    describe('usage', function(){
      var inputPin;
      before(function(){
        inputPin = new InputPin(0, {skipVerify:true});
      });

      it('should read pin state', function(){
        inputPin.read().should.be.a('number');
        inputPin.read().should.equal(1);
      });
      it('should not allow write operations', function(){
        var test = function(){inputPin.write(0);}
        test.should.Throw(Error, /Cannot write/);
      });
    });
    describe('teardown', function(){
      var inputPin;
      before(function(){
        inputPin = new InputPin(0, {skipVerify:true});
      });

      it('should unexport the pin', function(){
        inputPin.destroy();
        var data = fs.readFileSync('/sys/class/gpio/gpiochip0/subsystem/unexport');
        String(data).should.equal('0');
      });
    });
  });
  describe('OutputPin', function(){
    describe('creation', function(){
      var outputPin;
      before(function(){
        outputPin = new OutputPin(1, {skipVerify:true});
      });

      it('should export the pin', function(){
        var data = fs.readFileSync('/sys/class/gpio/gpiochip0/subsystem/export');
        String(data).should.equal('1');
      });
      it('should be a GPIOPin', function(){
        (outputPin instanceof GPIOPin).should.equal(true);
      });
      it('should set the pin number', function(){
        outputPin.should.have.ownProperty('pin');
        outputPin.pin.should.equal(1);
      });
      it('should have the correct value path', function(){
        outputPin.valuePath.should.equal('/sys/class/gpio/gpio1/value');
      });
      it('should have the correct direction', function(){
        var data = fs.readFileSync(outputPin.directionPath);
        String(data).should.equal(GPIOPin.OUTPUT);
      });
    });
    describe('usage', function(){
      var outputPin;
      before(function(){
        outputPin = new OutputPin(1, {skipVerify:true});
      });

      it('should write pin state', function(){
        var preState = fs.readFileSync(outputPin.valuePath);
        String(preState).should.equal('');
        outputPin.write(1);
        var postState = fs.readFileSync(outputPin.valuePath);
        String(postState).should.equal('1');
      });
      it('should not allow read operations', function(){
        var test = function(){outputPin.read();}
        test.should.Throw(Error, /Cannot read/);
      });
    });
    describe('teardown', function(){
      var outputPin;
      before(function(){
        outputPin = new OutputPin(1, {skipVerify:true});
        outputPin.destroy();
      });

      it('should set the pin as an input', function(){
        var dir = String(fs.readFileSync(outputPin.directionPath));
        dir.should.equal('in');
      });
      it('should unexport the pin', function(){
        outputPin.destroy();
        var data = fs.readFileSync('/sys/class/gpio/gpiochip0/subsystem/unexport');
        String(data).should.equal('1');
      });
    });
  });
  describe('Invalid Pin', function(){
    describe('creation', function(){

      it('should throw an error', function(){
        var fn = function(){var invalidPin = new InputPin(99);}
        fn.should.Throw(Error, /Invalid pin number/);
      });
    });
  });
  describe('Duplicate pin', function(){
    describe('creation', function(){

      it('should throw an error', function(){
        var p1 = new InputPin(0, {skipVerify:true});
        var test = function(){var p2 = new InputPin(0)};
        test.should.Throw(Error, /is already in use/);
      });
    });
  });
});

describe('OutputDevice', function(){
  var outputDevice;

  before(function(){
    mock({
      '/sys/class/gpio/gpiochip0/subsystem':{
        'export': '',
        'unexport': ''
      },
      '/sys/class/gpio/gpio0':{
        'value':'',
        'direction':'out'
      }
    });
  });

  afterEach(function(){
    fs.writeFileSync('/sys/class/gpio/gpio0/value', '');
    fs.writeFileSync('/sys/class/gpio/gpiochip0/subsystem/export', '');
    fs.writeFileSync('/sys/class/gpio/gpiochip0/subsystem/unexport', '');
  });

  after(function(){
    mock.restore();
  });

  describe('options', function(){
    describe('#active_low', function(){
      describe('{active_low:true}', function(){
        before(function(){
          outputDevice = new OutputDevice(0, {skipVerify:true, active_low:true});
        });

        it('should initialize the state to high by default', function(){
          outputDevice.value.should.equal(1);
        });

        it('should pull low for on()', function(){
          outputDevice.on();
          // check object value
          outputDevice.value.should.equal(0);
          var value = fs.readFileSync(outputDevice.valuePath);
          // check actual sysfs value
          String(value).should.equal('0');
        });
        it('should pull high for off()', function(){
          outputDevice.off();
          // check object value
          outputDevice.value.should.equal(1);
          var value = fs.readFileSync(outputDevice.valuePath);
          // check actual sysfs value
          String(value).should.equal('1');
        });
      });
    });

    describe('#initial_state', function(){
      describe('{initial_state:"off"}', function(){
        before(function(){
          outputDevice = new OutputDevice(0, {skipVerify:true, initial_state:"off"});
        });
        it('should initialize the pin low', function(){
          outputDevice.value.should.equal(0);
          var value = fs.readFileSync(outputDevice.valuePath);
          // check actual sysfs value
          String(value).should.equal('0');
        });
      });
      describe('{initial_state:"on"}', function(){
        before(function(){
          outputDevice = new OutputDevice(0, {skipVerify:true, initial_state:"on"});
        });
        it('should initialize the pin high', function(){
          outputDevice.value.should.equal(1);
          var value = fs.readFileSync(outputDevice.valuePath);
          // check actual sysfs value
          String(value).should.equal('1');
        });
      });
    });
  });
});

describe('LED', function(){
  var led;
  before(function(){
    mock({
      '/sys/class/gpio/gpiochip0/subsystem':{
        'export': '',
        'unexport': ''
      },
      '/sys/class/gpio/gpio0':{
        'value':'',
        'direction':'out'
      }
    });

    led = new LED(0, {skipVerify:true});
  });

  afterEach(function(){
    fs.writeFileSync('/sys/class/gpio/gpio0/value', '');
  });

  after(function(){
    mock.restore();
  });

  it('should be an OutputDevice', function(){
    (led instanceof OutputDevice).should.equal(true);
  });
  describe('methods', function(){
    describe('#on', function(){
      it('should turn the led on', function(){
        led.on();
        led.value.should.equal(1);
        var value = fs.readFileSync(led.valuePath);
        String(value).should.equal('1');
      });
    });
    describe('#off', function(){
      it('should turn the led off', function(){
        led.off();
        led.value.should.equal(0);
        var value = fs.readFileSync(led.valuePath);
        String(value).should.equal('0');
      });
    });
    describe('#toggle', function(){
      it('should toggle the state of the led', function(){
        var oldState = led.value;
        led.toggle();
        var newState = led.value;
        newState.should.not.equal(oldState);
      });
    });
    describe("#isLit", function(){
      it('should return true when on', function(){
        led.on();
        led.isLit().should.equal(true);
      });
      it('should return false when off', function(){
        led.off();
        led.isLit().should.equal(false);
      });
    });
  });
});

describe('Relay', function(){
  var relay;
  before(function(){
    mock({
      '/sys/class/gpio/gpiochip0/subsystem':{
        'export': '',
        'unexport': ''
      },
      '/sys/class/gpio/gpio0':{
        'value':'',
        'direction':'out'
      }
    });

    relay = new Relay(0, {skipVerify:true});
  });

  afterEach(function(){
    fs.writeFileSync('/sys/class/gpio/gpio0/value', '');
  });

  after(function(){
    mock.restore();
  });

  it('should be an OutputDevice', function(){
    (relay instanceof OutputDevice).should.equal(true);
  });

  describe('#on', function(){
    it('should turn the relay on', function(){
      relay.on();
      relay.value.should.equal(1);
      var value = fs.readFileSync(relay.valuePath);
      String(value).should.equal('1');
    });
  });
  describe('#off', function(){
    it('should turn the relay off', function(){
      relay.off();
      relay.value.should.equal(0);
      var value = fs.readFileSync(relay.valuePath);
      String(value).should.equal('0');
    });
  });
  describe('#toggle', function(){
    it('should toggle the state of the relay', function(){
      var oldValue = relay.value;
      relay.toggle();
      var newValue = relay.value;
      newValue.should.not.equal(oldValue);
    });
  });
});

describe('Buzzer', function(){
  var buzzer;
  before(function(){
    mock({
      '/sys/class/gpio/gpiochip0/subsystem':{
        'export': '',
        'unexport': ''
      },
      '/sys/class/gpio/gpio0':{
        'value':'',
        'direction':'out'
      }
    });

    buzzer = new Buzzer(0, {skipVerify:true});
  });

  afterEach(function(){
    fs.writeFileSync('/sys/class/gpio/gpio0/value', '');
  });

  after(function(){
    mock.restore();
  });

  it('should be an OutputDevice', function(){
    (buzzer instanceof OutputDevice).should.equal(true);
  });

  describe('#on', function(){
    it('should turn the buzzer on', function(){
      buzzer.on();
      buzzer.value.should.equal(1);
      var value = fs.readFileSync(buzzer.valuePath);
      String(value).should.equal('1');
    });
  });
  describe('#off', function(){
    it('should turn the buzzer off', function(){
      buzzer.off();
      buzzer.value.should.equal(0);
      var value = fs.readFileSync(buzzer.valuePath);
      String(value).should.equal('0');
    });
  });
  describe('#toggle', function(){
    it('should toggle the state of the buzzer', function(){
      var oldValue = buzzer.value;
      buzzer.toggle();
      var newValue = buzzer.value;
      newValue.should.not.equal(oldValue);
    });
  });
});

describe('InputDevice', function(){
  var inputDevice;

  before(function(){
    mock({
      '/sys/class/gpio/gpiochip0/subsystem':{
        'export': '',
        'unexport': ''
      },
      '/sys/class/gpio/gpio0':{
        'value':'1',
        'direction':'in'
      }
    });
  });

  afterEach(function(){
    fs.writeFileSync('/sys/class/gpio/gpio0/value', '1');
    fs.writeFileSync('/sys/class/gpio/gpiochip0/subsystem/export', '');
  });

  after(function(){
    mock.restore();
  });

  describe('methods', function(){
    before(function(){
      inputDevice = new InputDevice(0, {skipVerify:true});
    });

    describe('#read', function(){
      it('should return the current value on the pin', function(){
        inputDevice.read().should.be.a('number');
        inputDevice.read().should.equal(1);
      });
    });
  });
});

describe('Switch', function(){
  var sw1;
  var sw2;
  before(function(){
    mock({
      '/sys/class/gpio/gpiochip0/subsystem':{
        'export': '',
        'unexport': ''
      },
      '/sys/class/gpio/gpio0':{
        'value':'0',
        'direction':'in'
      },
      '/sys/class/gpio/gpio1':{
        'value':'1',
        'direction':'in'
      }
    });

    sw1 = new Switch(0, {skipVerify:true});
  });

  afterEach(function(){
    // reset mock value to default state
    fs.writeFileSync('/sys/class/gpio/gpio0/value', '0');
    fs.writeFileSync('/sys/class/gpio/gpio1/value', '1');
  });

  after(function(){
    mock.restore();
  });

  it('should be an InputPin', function(){
    (sw1 instanceof InputPin).should.equal(true);
  });

  describe('methods', function(){
    describe('#isOn', function(){
      it('should return true if value is low', function(){
        // mock a low state because default is pullup:true so an activated
        // switch pulls the pin low
        fs.writeFileSync(sw1.valuePath, '0');
        sw1.isOn().should.equal(true);
      });
      it('should return false if value is high', function(){
        // mock a high state
        fs.writeFileSync(sw1.valuePath, '1');
        sw1.isOn().should.equal(false);
      });
    });
  });

  describe('options', function(){
    describe('#pullup', function(){
      describe('{pullup:false} (default)', function(){
        before(function(){
          sw2 = new Switch(0, {skipVerify:true, pullup:false});
        });
        describe('#isOn', function(){
          it('should return true if value is high', function(){
            // mock a high state
            fs.writeFileSync(sw2.valuePath, '1');
            sw2.isOn().should.equal(true);
          });
          it('should return false if value is low', function(){
            // mock a low state
            fs.writeFileSync(sw2.valuePath, '0');
            sw2.isOn().should.equal(false);
          });
        });
      });
    });
  });
});

describe('Button', function(){
  var button;
  before(function(){
    mock({
      '/sys/class/gpio/gpiochip0/subsystem':{
        'export': '',
        'unexport': ''
      },
      '/sys/class/gpio/gpio0':{
        'value':'0',
        'direction':'in'
      }
    });

    button = new Button(0, {skipVerify:true});
  });

  afterEach(function(){
    // reset mock value to default state
    fs.writeFileSync('/sys/class/gpio/gpio0/value', '0');
  });

  after(function(){
    mock.restore();
  });

  it('should be a Switch', function(){
    (button instanceof Switch).should.equal(true);
  });

  describe('methods', function(){
    describe('#isPressed', function(){
      it('should return true if button is pressed', function(){
        // mock a low state because default is pullup:true so a pressed
        // state pulls the pin low
        fs.writeFileSync(button.valuePath, '0');
        button.isPressed().should.equal(true);
      });
      it('should return false if button is not pressed', function(){
        // mock a high state
        fs.writeFileSync(button.valuePath, '1');
        button.isPressed().should.equal(false);
      });
    });
  });
});
