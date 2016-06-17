sourceAdminApp.controller('contactCtrl', ['$rootScope', '$scope', '$http', '$timeout', '$cookies', '$location', 'storageService', function($rootScope, $scope, $http, $timeout, $cookies, $location, storageService){


function initialize() {
            var mapOptions = {
                zoom: 6,
                maxZoom: 11,
                center: new google.maps.LatLng(0, 0)
            };
            
            map = new google.maps.Map(document.getElementById('map'), mapOptions); 
        	var bounds = new google.maps.LatLngBounds ();
            setMarkers(map, bounds);
            map.fitBounds (bounds);

        }

function setMarkers(map, bounds){
    var shape = {
        coords: [1, 1, 1, 20, 18, 20, 18, 1],
        type: 'circle'
      };
                                      // parseInt(location.locations.longitude)
    var marker = new google.maps.Marker({
      position: {lat: 34.0219, lng: -118.4814},
      map: map,
      animation : google.maps.Animation.DROP,
      shape: shape
    });

    bounds.extend(marker.position);

}
angular.element(document).ready(function () {
       initialize();
    });
	
}])