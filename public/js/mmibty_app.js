angular.module('mmibty_app.services',[]);

angular.module('mmibty_app',
    ['ngRoute','mmibty_app.controllers',
            'mmibty_app.services',
            'mmibty_app.filters'])
    .config(function ($routeProvider,$locationProvider){
        // $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');
        $routeProvider
            .when('/pick',{
                templateUrl:'html/playlist_search.html',
                controller: 'SearchSongsController',
                    controllerAs:'playlist_search'
        }).otherwise({redirectTo:'/pick'});
    });
