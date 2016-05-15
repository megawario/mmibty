angular.module('mmibty.services',[])
    .factory('mmibtyAPI',function($http){
	var result={};

	//TODO change this to a server request in order to fetch using the token.
	//get data on music
	result.searchTrack = function(data){
	    var my_url = "https://api.spotify.com/v1/search?q="+data+"&type=track";
	    return $http({
		method: 'GET',
		url: my_url
	    });
	};
	
	return result;
    });
