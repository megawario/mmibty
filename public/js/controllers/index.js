//Controler for the index page
angular.module('mmibty.controllers',
    ['mmibty.services'])
    .controller('indexController',function($scope,$window,UserService) {
        this.user={}; //user for data insertion
        this.isLogin = false;
        this.isRegister = false;
        this.isSubmitting = false;
        this.loginError;

        this.clear = function(){
            this.isLoginError=null;
            this.isSubmitting=false;
        }

        //go to login screen
        this.goLogin = function() {
            this.isLogin=true;
            this.isRegister=false;
        };

        //go to register screen
        this.goRegister = function(){
            this.isLogin=false;
            this.isRegister=true;
        };


        //Performs and handles user registry
        this.doRegister = function(user){
            this.isSubmitting=true;
            UserService.register(user)
                .then((function(respose){

                }).bind(this))
                .catch((function(respose){
                    alert("Register error occured");
                }))
        };

        //performs and handles user login
        this.doLogin = function (user){
            this.isSubmitting=true;
            UserService.login(user)
                .then((function(response){
                        //angular catches redirects - returns code 200 with data.
                        $window.location.href='playlist.html';
                        this.isSubmitting =false;
                }).bind(this))
                .catch((function(response){
                    alert(JSON.stringify(response));
                    //set default error
                    this.loginError = "There was an error. Please try again after some time."
                    this.isSubmitting=false;
                }).bind(this));
        };
    });