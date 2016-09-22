angular.module('mmibty.services',[])
    .factory('UserService',function($http){
        var userService={};

        //post method to register users on server.
        userService.register = function(user){
            var my_url = "rest/user/"+user.username;
            return $http({
                contentType: 'application/json',
                method:'POST',
                url: my_url,
                data: JSON.stringify(user)
            });
        }

        userService.login = function(user){
            var my_url = "login";
            return $http({
                contentType:'application/json',
                method:'POST',
                url: my_url,
                data: {'email':user.email,'password':user.password}
            });
        }

        return userService;
    });
