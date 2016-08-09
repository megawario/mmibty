/**
 * Services related to user interaction with server.
 */

import {User} from '../model/user'
import {Injectable, Inject} from "@angular/core";
import {Http, Headers} from "@angular/http";

import 'rxjs/add/operator/toPromise'; //for promisses

@Injectable()
export class UserService{
    http:Http;

    constructor(@Inject(Http) http: Http){
        this.http=http;
    };


    //post method to register users on server.
    register(user:User){
        let url = "rest/user/"+user.username;
        let headers = new Headers({
            'Content-Type': 'application/json'});
        return this.http.post(url,JSON.stringify(user),{headers:headers})
            .toPromise();
    }

    login(user:User){
        let url = "login";
        let headers = new Headers({
            'Content-Type': 'application/json'});
        return this.http.post(url,JSON.stringify(user),{headers:headers}).toPromise();
    }

    say(){
        return "userService";
    };

}