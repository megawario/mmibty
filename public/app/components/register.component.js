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
var RegisterComponent = (function () {
    function RegisterComponent(userService) {
        this.userService = userService;
    }
    RegisterComponent.prototype.ngOnInit = function () {
        this.model = new user_1.User();
        this.isSub = false;
        //set recaptcha stripts on template
        var doc = document.body;
        var script = document.createElement('script');
        script.innerHTML = '';
        script.src = 'https://www.google.com/recaptcha/api.js';
        script.async = true;
        script.defer = true;
        doc.appendChild(script);
    };
    RegisterComponent.prototype.onSubmit = function () {
        if (this.isSub)
            return;
        this.isSub = true;
        //save capcha response in the model
        this.model.capcha = grecaptcha.getResponse();
        //TODO check if capcha is null, if is, not submit form
        this.userService.register(this.model)
            .then(function (result) {
            alert(result);
            this.isSub = false;
        }, function (err) {
            alert(err);
            grecaptcha.reset();
            this.isSub = false;
        });
    };
    RegisterComponent = __decorate([
        core_1.Component({
            selector: 'register',
            templateUrl: 'app/templates/register.component.html',
            styleUrls: ['app/css/register.component.css', 'app/css/forms.css'],
            providers: [user_service_1.UserService]
        }),
        __param(0, core_1.Inject(user_service_1.UserService))
    ], RegisterComponent);
    return RegisterComponent;
}());
exports.RegisterComponent = RegisterComponent;
//# sourceMappingURL=register.component.js.map