angular.module('mmibty.services',[])
	.factory('mmibtyAPI',function($http){
		var result={};

		//======= admin services =======//

		result.adminClearMarked=function(){
			return $http({
				method: 'DELETE',
				url:'admin/cleanmarked'
			});
		}

		result.adminCreateUser=function(userID,userName){
			return $http({
				method: 'POST',
				url: "admin/createuser",
				data:{"userID":userID,"userName":userName}
			});
		};

		result.adminRemoveUser=function(userID){
			return $http({
				method: 'POST',
				url: "admin/removeuser",
				data:{"userID":userID}
			});
		};

		result.adminGetUsers=function(){
			return $http({
				method: 'GET',
				url: "admin/users"
			});
		};

		//check if user is admin
		result.isAdmin = function(){
			var my_url = "admin/isadmin";
			return $http({
				method: 'GET',
				url: my_url
			});
		};

		// ======================================= User Services ======================================= //
		//get user name associated with machine
		result.getName = function(){
			var my_url = "rest/user/name/";
			return $http({
				method: 'GET',
				url: my_url
			});
		};

		//when a user loves a track
		result.setLove = function(uri){
			var my_url = "rest/user/love";
			return $http({
				method: 'PUT',
				url: my_url,
				data:{"track_uri":uri}
			});
		};

		//when a user hates a track
		result.setHate = function(uri){
			var my_url = "rest/user/hate";
			return $http({
				method: 'PUT',
				url: my_url,
				data:{"track_uri":uri}
			});
		};

		//get user trackstatistics and info
		result.getUserStats = function(){
			var my_url = "rest/user/stats";
			return $http({
				method: 'GET',
				url: my_url
			});
		};

		//get playlist tracks
		result.getPlaylistTracks = function(){
			var my_url = "rest/playlist/";
			return $http({
				method: 'GET',
				url: my_url
			});
		};

		//add tracks to playlist
		result.addTrack = function(payload){
			var my_url = "rest/playlist/track/add";
			return $http({
				method: 'POST',
				url: my_url,
				data: payload
			});
		};

		//track remove from playlist
		result.removeTrack = function(track_uri){
			var my_url="rest/playlist/track/remove?track_uri="+track_uri;
			return $http({
				method:'DELETE',
				url:my_url
			});
		};

		return result;
	});
