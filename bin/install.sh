#!/bin/bash
if [[ ! -e omega_gpio ]]; then
  echo "Installing module to ./omega_gpio"
  mkdir -p omega_gpio/node_modules/omega_gpio
  cd omega_gpio/node_modules/omega_gpio
  wget https://raw.githubusercontent.com/sidwarkd/omega_js/master/gpio_base.js
  wget https://raw.githubusercontent.com/sidwarkd/omega_js/master/gpio_input.js
  wget https://raw.githubusercontent.com/sidwarkd/omega_js/master/gpio_output.js
  wget https://raw.githubusercontent.com/sidwarkd/omega_js/master/helpers.js
  wget https://raw.githubusercontent.com/sidwarkd/omega_js/master/index.js
  cd ../..
  echo "Done!"
else
  echo "omega_gpio directory already exists. Aborting install."
fi
