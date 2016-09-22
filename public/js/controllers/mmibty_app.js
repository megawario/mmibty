/**
 * Created by Mpinto on 21/09/2016.
 */

//Controller for the pick section of the playlist
angular.module('mmibty_app.controllers',['mmibty_app.services'])
    .controller('SearchSongsController',function($scope,SpotifyService,MMIBTYService) {
        this.searchInput="";
        this.searchResultArray=[];
        this.search_load=false;

        this.search_failed=false;
        this.search_failed_msg="test";

        //add track
        this.addTrack = function(track){
            var payload = {track_uri:track}
            mmibtyAPI.addTrack(payload).then(
                (function(response){
                    if(response.status==201){ //track created
                        this.getPlaylistTracks(); //refresh playlist
                        this.getUserStatus();     //refresh user stats
                        mmibtyBootbox.show(mmibtyBootbox.dialogType.alert,
                            "Song added","Your song has been added. Enjoy!");
                    }
                }).bind(this),
                (function(response){
                    mmibtyBootbox.show(mmibtyBootbox.dialogType.alert,
                        'Error Adding',
                        response.data.error+" \n "+response.data.message);
                }).bind(this)
            )};

        //delete track - just delete track from the array, easier than requesting another load.
        this.removeTrack = function(track){
            mmibtyAPI.removeTrack(track.track_uri).then(
                (function(response){
                    if(response.status==200){
                        //individual remove, without going to server
                        //TODO better fetch
                        /*
                         for(var i=0;i < this.playlistTracksArray.length;i++) {
                         var index = this.playlistTracksArray[i].tracks.indexOf(track); //remove track from the array.
                         if(index!=-1){
                         this.playlistTracksArray[i].tracks.splice(index, 1);
                         break;
                         }
                         }*/
                    }
                    this.getUserStatus();
                    this.getPlaylistTracks();
                }).bind(this),function(){alert("Could not remove track");}
            );
        };

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
            SpotifyService.searchTrack(search)
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
            MMIBTYService.getURL(nextUrl)
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
    });