"use strict";

// Following code is from https://gist.github.com/cferdinandi/4f8a0e17921c5b46e6c4
// I know there are libraries that do this but this is extremely simple, gets
// the job done and I don't have to worry about pieces of it not working on older
// versions of Node which may run on some hardware platforms like Onion Omega.

/**
 * Merge defaults with user options
 * @private
 * @param {Object} defaults Default settings
 * @param {Object} options User options
 * @returns {Object} Merged values of defaults and options
 */
var extend = function ( defaults, options ) {
    var extended = {};
    var prop;
    for (prop in defaults) {
        if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
            extended[prop] = defaults[prop];
        }
    }
    for (prop in options) {
        if (Object.prototype.hasOwnProperty.call(options, prop)) {
            extended[prop] = options[prop];
        }
    }
    return extended;
};

module.exports = {
    extend: extend
}