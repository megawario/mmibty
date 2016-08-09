/**
 * Module with useful functions
 * @module utils
 */

module.exports= {

    /**
     * Transforms an ipv6 address to ipv4
     * @param {String} ipv6 address in format (::.*:)
     * @returns {string|void|XML|*}
     */
    ipv4: function (address) {
        return address.replace(/::.*:/g, "");
    },

    /**
     * Creates a random sequence of characters.
     * Uses Math.random
     * @param length
     * @returns {string} sequence of characters
     */
    randomString: function (length) {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    },

    /**
     * Logs information to console log.
     * Has methods info,debug,warning,critical.
     * Logs according to application beeing in debug more.
     */
    log: {
        /**
         * Logs information to console log
         * @param string message
         * @param level (info,debug,warning,critical)
         */
        log: function (message, level) {
            if (process.env.NODE_ENV == "development") {
                switch (level) {
                    case "info":
                        console.log("INFO: " + message);
                        break;
                    case "debug":
                        console.log("DEBUG: " + message);
                        break;
                    case "warning":
                        console.log("WARNING: " + message);
                        break;
                    case "critical":
                        console.log("CRITICAL: " + message);
                        break;
                    default: //default value is info
                        console.log("INFO: " + message);
                        break;
                }
            }
            else { //log in production
                switch (level) {
                    case "critical":
                        console.log("CRITICAL: " + message);
                        break;
                    case "warning":
                        console.log("WARNING: " + message);
                        break;
                }
            }
        },

        /**
         * Utility message for logger warning
         * @param {string} message
         */
        warning: function (message) {
            this.log(message, "warning");
        },

        /**
         * Utility message for logger info
         * @param {string} message
         */
        info: function (message) {
            this.log(message, "info");
        },

        /**
         * Utility message for logger err
         * @param {string} message
         */
        err: function (message) {
            this.log(message, "critical");
        },
        /**
         * Utility message for logger debug
         * @param {string} message
         */
        debug: function (message) {
            this.log(message, "debug");
        }
    }
}
