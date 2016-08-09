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
var core_1 = require('@angular/core');
var user_1 = require('../model/user');
var user_service_1 = require('../services/user.service');
// Tell how to crete component and what template to use
var LoginComponent = (function () {
    function LoginComponent(userService) {
        this.userService = userService;
    }
    LoginComponent.prototype.ngOnInit = function () {
        this.isSubmited = false;
        this.isSub = false;
        this.isError = false;
        this.model = new user_1.User(); //empty user;
    };
    //try login
    LoginComponent.prototype.onSubmit = function () {
        if (this.isSub)
            return;
        this.isSub = true;
        this.userService.login(this.model)
            .then(function (err) { this.isSub = false; })
            .catch(function (err) { this.isSub = false; });
    };
    LoginComponent = __decorate([
        core_1.Component({
            selector: 'login',
            templateUrl: 'app/templates/login.component.html',
            styleUrls: ['app/css/login.component.css'],
            providers: [user_service_1.UserService]
        }),
        __param(0, core_1.Inject(user_service_1.UserService))
    ], LoginComponent);
    return LoginComponent;
}());
exports.LoginComponent = LoginComponent;
//# sourceMappingURL=login.component.js.map