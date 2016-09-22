/**
 * Created by Mpinto on 22/09/2016.
 */
angular.module('mmibty_app.services')
    .factory('MMIBTYService',function($http){
        var MMIBTYService = {};

        //gets generic URL
        MMIBTYService.getURL = function(url){
            var my_url = url;
            return $http({
                method: 'GET',
                url: my_url
            });
        };

        return MMIBTYService;
    });
