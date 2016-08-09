/**
 * @module recapchaAPI
 */

var request = require("request");

function verifyCapcha(secret,response,remoteIP) {
    return new Promise(function (resolve, reject) {
        header = {
            url: "https://www.google.com/recaptcha/api/siteverify",
            form: {
                secret: secret,
                response: response,
                remoteip: remoteIP
            }
        };

        request.post(header, function (error, response, body) {
            var success = JSON.parse(body).success;
            if(!error && typeof success != undefined && success==true) resolve();
            else{ reject(Error("recapchaAPI: request of validation failed"));}
        });
    });
}


module.exports = {
    verify : verifyCapcha
}