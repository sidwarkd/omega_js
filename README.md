# omega_gpio

A simple Node.js GPIO helper for the Onion Omega. This module is written in such a way to produce very readable and intuitive code. It purposely avoids using terms like "pullup/pulldown" and "active low/active_high" with the intent to be more accessible to people just getting started in hardware.

Under the hood it relies on the [GPIO Sysfs Interface](https://www.kernel.org/doc/Documentation/gpio/sysfs.txt).

## Example
```js
// get the necessary modules
var gpio = require('omega_gpio');
var Button = gpio.Button;
var LED = gpio.LED;

// Button connected to pin 23 that is wired to read a digital high when pressed
var myButton = new Button(23);

// LED connected to pin 26 that is wired so that it turns on when the output 
// pin is set to a digital low
var myLED = new LED(26, {on_when:"low"});

// Clean up the pins on exit
process.on('SIGINT', function(){
    myButton.destroy();
    myLED.destroy();
    process.exit();
});

while(true){
    if(myButton.isPressed()){
        myLED.on();
    }
    else{
        myLED.off();
    }
}
```

## Installation

### Installing Node
The first thing you need to do is install Node on the Omega.

```sh
opkg update
opkg install nodejs
```

### For Development
If you want to use the library but also contribute to it I'd recommend cloning the repository.

```sh
git clone https://github.com/sidwarkd/omega_js.git
```

You can make changes and then deploy it to your Omega using the following on your Mac while in the root directory of the project.

```sh
scp *.js root@[omega address]:[directory where you want to copy the files]
```

### Direct Usage
Since the omega currently doesn't support NPM we can't use that to install the library directly on the Omega. Use **wget** in the meantime to get a simple install script that downloads the files. Just run the following from your Omega.

```sh
wget -O - https://raw.githubusercontent.com/sidwarkd/omega_js/master/bin/install.sh | sh
```

## Usage
Currently the library supports the following hardware abstractions:
  * [Switch](#switch)
  * [Button](#button)
  * [LED](#led)
  * [Relay](#relay)
  * [Buzzer](#buzzer)

### General Usage Note
All of the GPIO related objects in the library inherit from the base ```GPIOPin``` object. To properly release the pin when you are finished using it you should always call the ```destroy()``` function otherwise the pin can become locked and unusable on subsequent runs of your program. You can manually unlock a pin from the command line by using the following command.

```sh
echo [pin number to unlock] > /sys/class/gpio/gpiochip0/subsystem/unexport
```

## Switch
### Constructor
```js
var sw = new Switch(pinNumber[, options]);
```

  * ```pinNumber``` Number - The pin number to which the switch is connected
  * ```options``` Object
      - ```on_when``` String - The digital state, "high" or "low", that will be present on the pin when the switch is in the on position. This is determined by how you've wired the switch. Default = ```"high"```

### Functions
#### isOn()
Returns ```true``` if switch is on. ```false``` otherwise.

#### destroy()
Cleans up the pin and releases it back to the OS.

### Example
```js
// A switch connected to pin 0 that is wired to register a high voltage when on
var Switch = require("omega_gpio").Switch;
var sw = new Switch(0);

// A switch connected to pin 1 that is wired to register a low voltage when on
var sw2 = new Switch(1, {when_on:"low"});

if(sw.isOn())
    console.log("The switch is on");
}

// Always destroy when finished
sw.destroy();
sw2.destroy();
```

## Button
### Constructor
```js
var button = new Button(pinNumber[, options]);
```

  * ```pinNumber``` Number - The pin number to which the button is connected
  * ```options``` Object
      - ```pressed_when``` String - The digital state, "high" or "low", that will be present on the pin when the button is pressed. This is determined by how you've wired the button. Default = ```"high"```

### Functions
#### isPressed()
Returns ```true``` if button is pressed. ```false``` otherwise.

#### destroy()
Cleans up the pin and releases it back to the OS.

### Example
```js
// A button connected to pin 0 that is wired to register a high voltage when pressed
var Button = require("omega_gpio").Button;
var btn1 = new Button(0);

// A button connected to pin 1 that is wired to register a low voltage when pressed
var btn2 = new Button(1, {when_pressed:"low"});

while(true){
    if(btn1.isPressed()){
        console.log("Let me go!");
    }
}

// Always destroy when you are done.
btn1.destroy();
btn2.destroy();

```

## LED
### Constructor
```js
var led = new LED(pinNumber[, options]);
```

  * ```pinNumber``` Number - The pin number to which the switch is connected
  * ```options``` Object
      - ```on_when``` String - The digital state, "high" or "low", that will cause the led to turn on. This is determined by how you've wired the switch. Default = ```"high"```

### Functions
#### on()
Turns on the LED.

#### off()
Turns off the LED.

#### toggle()
Toggles the current state of the LED.

#### isLit()
Returns ```true``` if the LED is currently on. ```false``` otherwise.

#### destroy()
Cleans up the pin and releases it back to the OS.

### Example
```js
// An LED connected to pin 0 that turns on when the pin is a digital high
var LED = require("omega_gpio").LED;
var led = new LED(0);
led.on();
led.off();
led.toggle();
led.destroy();
```

## Relay
### Constructor
```js
var relay = new Relay(pinNumber[, options]);
```

  * ```pinNumber``` Number - The pin number to which the relay is connected
  * ```options``` Object
      - ```when_on``` String - The digital state, "high" or "low", that will activate the relay. This is determined by how you've wired the relay. Default = ```"high"```

### Functions
#### on()
Activates the relay to turn on the attached device.

#### off()
Turns the relay off, cutting power to the attached device.

#### toggle()
Toggle the current state of the relay.

#### destroy()
Cleans up the pin and releases it back to the OS.

### Example
```js
// A relay connected to pin 0 that will active when a high voltage is set on pin 0
var Relay = require("omega_gpio").Relay;
var relay = new Relay(0);
relay.on();
relay.off();
relay.toggle();
relay.destroy();
```

## Buzzer
### Constructor
```js
var buzzer = new Buzzer(pinNumber[, options]);
```

  * ```pinNumber``` Number - The pin number to which the switch is connected
  * ```options``` Object
      - ```when_on``` String - The digital state, "high" or "low", that will sound the buzzer. This is determined by how you've wired the buzzer. Default = ```"high"```

### Functions
#### on()
Activates the buzzer to turn on the attached device.

#### off()
Turns the buzzer off, cutting power to the attached device.

#### toggle()
Toggle the current state of the buzzer.

#### destroy()
Cleans up the pin and releases it back to the OS.

### Example
```js
// A buzzer connected to pin 0 that will make a sound when a high voltage is set on pin 0
var Buzzer = require("omega_gpio").Buzzer;
var buzzer = new Buzzer(0);
buzzer.on();
buzzer.off();
buzzer.toggle();
buzzer.destroy();
```

## Contributing
I absolutely welcome feedback on the library as well as pull requests with enhancements and/or fixes. If you choose to contribute it would be helpful if you could add some tests but that isn't a requirement. Before you submit a pull request please run the existing tests. You need to have [Mocha](https://mochajs.org) installed.

```sh
npm test
```

## Suggested Improvements
  * Add motion sensor
  * Documentation improvements
  * npm script option to help with deployment to omega
  * Eventing for switch and button
  * Native extension for GPIO access
  * I2C functionality
  * Serial functionality
  * Native extension for serial and i2c
  * Additional abstractions for various IO modules
  * Add ```setSource``` to LED so it can be bound to an input
  * Add ```blink()``` function to LED

## License
MIT