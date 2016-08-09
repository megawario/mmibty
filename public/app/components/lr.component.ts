import {Component, OnInit} from '@angular/core';
// import {RegisterFormComponent} from "./register-form.component";
import {LoginComponent} from "./login.component";
import {RegisterComponent} from "./register.component";
import {HTTP_PROVIDERS} from "@angular/http";
import {UserService} from "../services/user.service";


@Component({
    selector: 'lr',
    templateUrl: 'app/templates/lr.component.html',
    directives: [LoginComponent,RegisterComponent], //,RegisterFormComponent
    providers: [HTTP_PROVIDERS]
})

/**
 * Initial component for login, register page.
 */
export class LrComponent implements OnInit{
    isRegister:boolean;
    isLogin:boolean;

    ngOnInit(){
        this.isRegister = false;
        this.isLogin = false;
    }

    setLogin(state:boolean){this.isLogin=state;};
    setRegister(state:boolean){this.isRegister=state;};
    toggleLR(){
        this.setLogin(!this.isLogin);
        this.setRegister(!this.isRegister);
    }


}