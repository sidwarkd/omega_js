// get the necessary modules
var gpio = require('omega_gpio');
var Buzzer = gpio.Buzzer;

// Buzzer connected to pin 14 that is wired to make a sound when the 
// gpio pin goes high
var myBuzzer = new Buzzer(14);

// Clean up the pins on exit
process.on('SIGINT', function(){
  console.log("Cleaning up...");
    myBuzzer.destroy();
    process.exit();
});

// Infinite loop checking the button
var beep = function(){
  myBuzzer.on();

  setTimeout(function(){
    myBuzzer.off();
    setTimeout(beep, 500);
  }, 500);
}

setImmediate(beep);


