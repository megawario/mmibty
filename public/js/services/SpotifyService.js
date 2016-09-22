angular.module('mmibty_app.services')
    .factory('SpotifyService',function($http){
        var spotService={};

        //TODO change this to a server request in order to fetch using the token.
        //get data on music
        spotService.searchTrack = function(data){
            var my_url = "https://api.spotify.com/v1/search?q="+data+"&type=track";
            return $http({
                method: 'GET',
                url: my_url
            });
        };
        return spotService;
    });