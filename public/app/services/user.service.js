/**
 * Services related to user interaction with server.
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
require('rxjs/add/operator/toPromise'); //for promisses
var UserService = (function () {
    function UserService(http) {
        this.http = http;
    }
    ;
    //post method to register users on server.
    UserService.prototype.register = function (user) {
        var url = "rest/user/" + user.username;
        var headers = new http_1.Headers({
            'Content-Type': 'application/json' });
        return this.http.post(url, JSON.stringify(user), { headers: headers })
            .toPromise();
    };
    UserService.prototype.login = function (user) {
        var url = "login";
        var headers = new http_1.Headers({
            'Content-Type': 'application/json' });
        return this.http.post(url, JSON.stringify(user), { headers: headers }).toPromise();
    };
    UserService.prototype.say = function () {
        return "userService";
    };
    ;
    UserService = __decorate([
        //for promisses
        core_1.Injectable(),
        __param(0, core_1.Inject(http_1.Http))
    ], UserService);
    return UserService;
}());
exports.UserService = UserService;
