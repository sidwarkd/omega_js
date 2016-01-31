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