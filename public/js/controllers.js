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

		this.adminClearMarked = function(){
			mmibtyAPI.adminClearMarked().then(
				(function(response){
					if(response==200){
						mmibtyBootbox.show(mmibtyBootbox.dialogType.alert,
							'Cleanup',
							'Songs marked for death, removed!');
					}
					this.getPlaylistTracks();
				}).bind(this)
				,(function(response){
					mmibtyBootbox.show(mmibtyBootbox.dialogType.alert,
						'Cleanup Failure',
						'Failure on removing marked songs');
					this.getPlaylistTracks();
				}).bind(this)
			);
		};

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



		// =========== Track =========== //

		//mark for deletion if track delta is bigger than 5
		this.isMarked = function(track){
			//TODO REMOVE hardcoded marked for death value
			return (track.hate.length-track.love.length)>5
		}

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

		this.setLove = function(track){
			mmibtyAPI.setLove(track.track_uri).then(
				(function(response){
					if(response.status==200){
						var index= track.love.indexOf(this.name);
						var hateIndex = track.hate.indexOf(this.name);
						if(index==-1){ //toggle love
							track.love.push(this.name);
							if(hateIndex!=-1) track.hate.splice(hateIndex,1);
						}else{
							track.love.splice(index,1);}
					}
					}).bind(this),
						function(){alert("failed on set/unset Love");});
		};

		this.setHate = function(track){
			mmibtyAPI.setHate(track.track_uri).then(
				(function(response){
					if(response.status==200){
						var index= track.hate.indexOf(this.name);
						var loveIndex= track.love.indexOf(this.name);
						if(index==-1){ //toggle love
							track.hate.push(this.name);
							if(loveIndex!=-1) track.love.splice(loveIndex,1);
						}else{
							track.hate.splice(index,1);}
					}
				}).bind(this),
				function(){alert("failed on set/unset Hate");});
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
