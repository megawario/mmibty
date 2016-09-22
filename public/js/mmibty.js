angular.module('mmibty',[
    'mmibty.controllers',
    'mmibty.services'])
    .config(function ($locationProvider){
        $locationProvider.html5Mode(true);
    });
