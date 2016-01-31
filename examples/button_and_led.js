// get the necessary modules
var gpio = require('omega_gpio');
var Button = gpio.Button;
var LED = gpio.LED;

// Button connected to pin 23 that is wired to read a digital low when pressed
var myButton = new Button(23, {when_pressed:"low"});

// LED connected to pin 26 that is wired so that it turns on when the output pin is set to a digital high
var myLED = new LED(26);

// Clean up the pins on exit
process.on('SIGINT', function(){
    myButton.destroy();
    myLED.destroy();
});

while(true){
    if(myButton.isPressed()){
        myLED.on();
    }
    else{
        myLED.off();
    }
}