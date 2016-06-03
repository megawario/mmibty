angular.module('mmibty.filters',[])
    .filter('cutwords',
	    function () { 
		return function (value, wordwise, max, tail) {
		    if (!value) return '';
		    
		    max = parseInt(max, 10);
		    if (!max) return value;
		    if (value.length <= max) return value;
		    
		    value = value.substr(0, max);
		    if (wordwise) {
			var lastspace = value.lastIndexOf(' ');
			if (lastspace != -1) {
			    //Also remove . and , so its gives a cleaner result.
			    if (value.charAt(lastspace-1) == '.' || value.charAt(lastspace-1) == ',') {
				lastspace = lastspace - 1;
			    }
			    value = value.substr(0, lastspace);
			}
		    }	    
		    return value + (tail || ' …');
		};
	    })
//convert ms to hh:mm
    .filter('mstotime', function() {
	return function(millseconds) {
	    var seconds = Math.floor(millseconds / 1000);
	    var days = Math.floor(seconds / 86400);
	    var hours = Math.floor((seconds % 86400) / 3600);
	    var minutes = Math.floor(((seconds % 86400) % 3600) / 60);
	    var timeString = '';
	    //if(days > 0) timeString += days;
	    if(hours > 0) timeString += hours + ":";
	    if(minutes >= 0) timeString += minutes;
	    return timeString;
	}
    });
