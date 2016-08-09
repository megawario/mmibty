import {Component, OnInit, Inject} from '@angular/core';
import {User} from '../model/user';
import {UserService} from '../services/user.service';

// Tell how to crete component and what template to use
@Component({
    selector: 'login',
    templateUrl: 'app/templates/login.component.html',
    styleUrls : ['app/css/login.component.css'],
    providers:[UserService]
})

export class LoginComponent implements OnInit{
    model:User;
    isSubmited:boolean;
    isSub:boolean; //isSubmiting;
    isError:boolean;
    userService:UserService;

    constructor(@Inject(UserService) userService:UserService){
        this.userService = userService;
    }

    ngOnInit(){
        this.isSubmited=false;
        this.isSub=false;
        this.isError=false;
        this.model = new User(); //empty user;
    }

    //try login
    onSubmit(){
        if(this.isSub) return;
        this.isSub = true;
        this.userService.login(this.model)
            .then(function(err){this.isSub=false;})
            .catch(function(err){this.isSub=false;});
    }
}