angular.module('mmibty.controllers',
	['mmibty.services'])

//controller for adventures
	.controller('mmibtyController',function($scope,mmibtyAPI,mmibtyBootbox) {

		//witch tab is selected
		this.selectedTab=0;

		//selects witch tab
		this.selected = function(index){
			return this.selectedTab===index;
		}


		//======= Admin =======//
		//admin vars
		this.isAdmin=false; //set administrator
		this.admin_user_list = undefined;
		this.admin_new_user_ip = undefined;
		this.admin_new_user_name = undefined;

		//fetches users
		this.adminGetUsers = function(){
			mmibtyAPI.adminGetUsers().then(
				(function(response){
					if(response.status==200){
						this.admin_user_list=response.data;
					}
					else{alert('failed to load user data');}
				}).bind(this));
		};

		//remove user access from database
		this.adminRemoveUser=function(userIP,userName) {
			mmibtyBootbox.show(mmibtyBootbox.dialogType.confirm,
				'Remove User',
				"Are you sure you want to remove user "+userName+" with ip "+userIP+" from the face of this app?\n" +
				"This process is irreversible!", "",
				(function(confirm){
					if(confirm){
						mmibtyAPI.adminRemoveUser(userIP).then((function(response){
							if(response.status==200){
								this.adminGetUsers();
							}else{
								alert("error happened while trying to remove;");
							};
						}).bind(this));}
				}).bind(this))};

		//adds a new user - refreshes user view
		this.adminAddUser = function (){
			//TODO Fix here the search for undefined
			if(this.admin_new_user_name !== "undefined" && this.admin_new_user_name!==""
				&&  this.admin_new_user_ip !== "undefined" && this.admin_new_user_ip!==""){
				//submit to database
				mmibtyAPI.adminCreateUser(this.admin_new_user_ip,this.admin_new_user_name).then(
					(function(response){
						if(response.status==200){
							this.adminGetUsers(); //refresh view
							this.admin_new_user_ip="";
							this.admin_new_user_name="";
						}
						else{alert("error adding");} //TODO add nice looking error msg
					}).bind(this)
				);
			}else{ //does nothing - displays error message TODO make a nice looking error message
				alert("fields missing could not add user");
			};
		};

		//login on the site
		this.login = function(){
			mmibtyAPI.login().then(
				function(response){ alert("Login successfull!!!");},
				function(response){alert("Login failed!!!");}
			);
		};

		//===== Search functionality =====//
		this.searchInput="";
		this.searchResultArray=[];
		this.search_load=false;

		this.search_failed=false;
		this.search_failed_msg="";

		//add track
		this.addTrack = function(track){
			var payload = {track_uri:track}
			mmibtyAPI.addTrack(payload).then(
				(function(response){
					if(response.status==200){
						this.getPlaylistTracks(); //refresh playlist
						this.getUserStatus();     //refresh user stats
						//TODO do something with the response if needed ie show window saying it went well.
					}
				}).bind(this),
				(function(response){
					mmibtyBootbox.show(mmibtyBootbox.dialogType.alert,
						'Error Adding',
						response.data.error+" \n "+response.data.message);
				}).bind(this)
			)};

		//searches for song music use this.search to find it
		this.searchTrack = function(){
			this.search_failed=false;
			this.searchResultArray=[];
			if(typeof this.searchInput == undefined || this.searchInput == ""){
				this.search_failed=true;
				return;
			}
			this.search_load=true;
			var search = this.searchInput.replace(" ","+");
			mmibtyAPI.searchTrack(search)
				.then(
					(function(response){ //on success
						if(response.data=="" || typeof response.data==undefined || response.data.tracks.total==0) {
							this.search_failed=true;
							this.search_failed_msg="No search results found for "+this.searchInput;
						}else {
							this.searchResultArray.push(response.data);
						}
						this.search_load=false;
					}).bind(this),
					(function(response){ //on fail fetch
						this.search_failed=true;
						this.search_failed_msg="Could not fetch info from server";
						this.search_load=false;
					}).bind(this));
		};

		//fetch the rest of the tracks from the search, pushing the rest to the search array.
		this.getMoreTracks = function(nextUrl){
			this.search_load=true;
			mmibtyAPI.getURL(nextUrl)
				.then(
					(function(response){
						this.searchResultArray.push(response.data);
						this.search_load=false;
					}).bind(this),
					(function(response){
						this.search_failed=true;
						this.search_failed_msg="Failed fetching the rest server info :(";
						this.search_load=false;
					}).bind(this));
		};

		//adds keypress to the search bar
		this.keypressSearch = function(keyEvent){
			if(keyEvent.which == 13) this.searchTrack();
		};

		

		// =========== Playlist =========== //

		//model for the playlist tracks
		this.playlistTracksArray=[];
		
		//errors for playlist screen "our music"
		this.playlist_failure=false;
		this.playlist_failure_msg="";
		this.playlist_loading=false;
		
		//fetch and append the playlistTracks
		this.getPlaylistTracks = function(){
			this.playlist_failure=false;
			this.playlist_loading=true;
			this.playlistTracksArray=[];

			mmibtyAPI.getPlaylistTracks().then(
				(function(response){
					this.playlistTracksArray.push(response.data);
					alert(JSON.stringify(this.playlistTracksArray));
					this.playlist_loading=false;
				}).bind(this),
				(function(response){
					this.playlist_failure=true;
					this.playlist_failure_msg="Error while loading playlist from server!! Mário probably forgot to add the refresh token... bastard";
					this.playlist_loading=false;
				}).bind(this)
			);
		};

		//fetch and append the rest of the playlist tracks
		this.getMorePlaylistTracks = function(nextUrl){
			this.playlist_failure=false;
			this.playlist_loading=true;
			mmibtyAPI.getURL(nextUrl)
				.then(
					(function(response){
						this.playlistTracksArray.push(response.data);
						this.playlist_loading=false;
					}).bind(this),
					(function(response){
						this.playlist_failure=true;
						this.playlist_failure_msg="Error while fetching more infro from server :(";
						this.playlist_loading=false;
					}).bind(this));
		}


		// ========== USER STATS ========== //
		this.name="";//name for the page
		this.userStats={};

		//fetch user musical stats and owned songs
		this.getUserStatus = function(){
			mmibtyAPI.getUserStats().then(
				(function(response){
					this.userStats = response.data;
				}).bind(this),function(){
					alert("error while fetching status");
				}
			);
		}

		this.love=false;
		this.hate=false;

		this.getLove = function(url){return this.love};
		this.getHate = function(url){return this.hate};

		this.setLove = function(url){
			alert("Its not a bug - it is a feature :D - not available yet");
			//mmibtyAPI.setLove(url).then(
			//	(function(response){this.getLove(response.data.track_uri);}).bind(this),
			//			function(){alert("failed on seting Love");});
		};
		this.setHate = function(url){
			alert("Its not a bug - it is a feature :D - not available yet");
			//mmibtyAPI.setHate(url).then(
			//(function(response){this.getHate(response.data.track_uri);}).bind(this),function(){alert("failed on setting Hate");});
		};

		// ========== Start ========== //
		this.getPlaylistTracks();
		this.getUserStatus();

		//get name of machine:
		mmibtyAPI.getName().then((function(response){
			this.name=response.data.name;
		}).bind(this));

		//sets admin mode for view:
		mmibtyAPI.isAdmin().then((function(response){
			this.isAdmin=true;
			this.adminGetUsers();
		}).bind(this));

	});
