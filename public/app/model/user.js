"use strict";
var User = (function () {
    function User(email, password, username, capcha //optional hence the ?
        ) {
        this.email = email;
        this.password = password;
        this.username = username;
        this.capcha = capcha;
    }
    return User;
}());
exports.User = User;
