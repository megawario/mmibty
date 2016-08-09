import {Component, OnInit, AfterViewInit, Inject} from '@angular/core';
import { NgForm }    from '@angular/forms';
import { User }    from '../model/user';
import {UserService} from '../services/user.service';

declare var grecaptcha:any;

@Component({
    selector: 'register',
    templateUrl: 'app/templates/register.component.html',
    styleUrls:['app/css/register.component.css','app/css/forms.css'],
    providers:[UserService]
})
export class RegisterComponent implements OnInit,AfterViewInit{
    model:User;
    userService:UserService;
    isSub:boolean;

    constructor(@Inject(UserService) userService:UserService){
        this.userService = userService;
    }

    ngOnInit(){
        this.model = new User();
        this.isSub = false;


        //set recaptcha stripts on template
        var doc = <HTMLDivElement> document.body;
        var script = document.createElement('script');
        script.innerHTML = '';
        script.src = 'https://www.google.com/recaptcha/api.js';
        script.async = true;
        script.defer = true;
        doc.appendChild(script);
    }

    onSubmit() {
        if(this.isSub) return;
        this.isSub=true;
        //save capcha response in the model
        this.model.capcha=grecaptcha.getResponse();
        //TODO check if capcha is null, if is, not submit form
        this.userService.register(this.model)
            .then(function(result){
                alert(result)
                this.isSub=false;
            },function(err){
                alert(err);
                grecaptcha.reset();
                this.isSub=false;
            });
        }


}