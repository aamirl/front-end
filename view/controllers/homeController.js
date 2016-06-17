sourceAdminApp.controller('homeCtrl', ['$rootScope', '$scope', '$http', '$timeout', '$cookies', '$location', 'chatWSService', '$compile', 'api', 'apiCall', 'Alertify','angularGridInstance', 'storageService', function($rootScope, $scope, $http, $timeout, $cookies, $location, chatWSService, $compile, api, apiCall, Alertify,angularGridInstance, storageService){

$rootScope.setting.layout.pageContentWithoutPadding = true;
$scope.rooms = [];
$('.modal-backdrop').remove()
$scope.gridWidth = 220;
$scope.gutterWidth = 20;
if ($(window).width() < 768) {
  $scope.gridWidth = 145;
  $scope.gutterWidth = 8;
}

$scope.showRooms = function(){
	$scope.sellyxKey = $cookies.get("sellyxtoken");
  $scope.user_location = $cookies.getObject('userloc')
    var req = {
       method : "GET",
       url : "https://chatting.sellyx.com/room/list?longitude="+($scope.user_location.lon? $scope.user_location.lon : $scope.user_location.longitude)+"&latitude="+($scope.user_location.lat? $scope.user_location.lat : $scope.user_location.latitude)+"&radius=10000000",
       headers : {
           authorization : $scope.sellyxKey
       },
       failure_message: true,
   }
   apiCall.getapi(req).then(function(res){
       if(res.success){
           $scope.rooms = res.success.data;
           if($scope.rooms.length > 0){
            var roomObject = {};
            for(var i = 0; i < $scope.rooms.length; i++){
              if($scope.rooms[i].product_id in roomObject){
                $scope.rooms.splice(i,1)
                i -= 1;
                continue;
                }
              else{
                roomObject[$scope.rooms[i].product_id] = i;
                }
              }
           	initialize();
       		}
       		else{
       		initializeDefault();
       		}
       }
       else{
        $('#login_modal').modal('show');
        $scope.url = encodeURIComponent($location.url())
          initializeDefault();
       }
   }, function(res){
   }).finally(function(){
   })
	}  

$scope.viewRoom = function(room_key){
  $location.path('/chat').search({key: room_key})
  }

$scope.viewDemo = function(key){
  $location.path('/chat').search({'key': key})
  }

function initialize() {
	var map;
	var oms;
	var usualColor = 'eebb22';
	var spiderfiedColor = 'ffee22';
	var iconWithColor = function(color) {
	    return 'http://chart.googleapis.com/chart?chst=d_map_xpin_letter&chld=pin|+|' +
	      color + '|000000|ffff00';
	  }
	var shadow = new google.maps.MarkerImage(
	    'https://www.google.com/intl/en_ALL/mapfiles/shadow50.png',
	    new google.maps.Size(37, 34),  // size   - for sprite clipping
	    new google.maps.Point(0, 0),   // origin - ditto
	    new google.maps.Point(10, 34)  // anchor - where to meet map location
	  );
      
	var mapOptions = {
      scrollwheel: false,
	    zoom: 9,
	    minZoom: 2,
	    maxZoom:13,
	    center: new google.maps.LatLng(($scope.user_location.latitude? $scope.user_location.latitude : $scope.user_location.lat), ($scope.user_location.longitude?$scope.user_location.longitude:$scope.user_location.lon)),
	    mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById('map'), mapOptions); 
	oms = new OverlappingMarkerSpiderfier(map);
	// var bounds = new google.maps.LatLngBounds();
	var infoWindow = new google.maps.InfoWindow;

	setMarkers(map);

	// map.fitBounds(bounds);
    
    function setMarkers(map, bounds){
    var shape = {
        coords: [1, 1, 1, 20, 18, 20, 18, 1],
        type: 'poly'
      };

    oms.addListener('click', function(marker, event) {
        infoWindow.setContent(marker.html);
        infoWindow.open(map, marker);
        $compile($('.view-demo'))($scope)
    });

	oms.addListener('spiderfy', function(markers) {
        for(var i = 0; i < markers.length; i++) {
            markers[i].setIcon(iconWithColor(spiderfiedColor));
            markers[i].setShadow(null);
        } 
        infoWindow.close();
    });

    oms.addListener('unspiderfy', function(markers) {
        for(var i = 0; i < markers.length; i++) {
            markers[i].setIcon(iconWithColor(usualColor));
            markers[i].setShadow(shadow);
        }
    });
    var product_object = {};
    for (var i = 0; i < $scope.rooms.length; i++) {
        var location = $scope.rooms[i];
        if($scope.rooms[i].product_id in product_object){
          continue;
          }
        else{
          product_object[$scope.rooms[i].product_id] = i;
        }
            try {
            var html = '<div id="">'+
                      '<div id="siteNotice"><br>'+
                      '<div id="bodyContent">'+
                      '<div style="margin-bottom: 10px"><img src="https://sellyx-ecom.s3-us-west-1.amazonaws.com/s_'+location.product_image+'"></div>'+
                      '<p><b>Product</b> '+location.product_name +'</p>'+
                      (location.product_description?'<p><b>Description</b> '+location.product_description + '</p>' : '')+ 
                      '<p><b>Price</b> $'+location.product_price + '</p>'+
                      '<button type="button" class="btn btn-success view-demo" ng-click="viewDemo('+"'"+location.room_key+"'"+')">View Demo</button>'+
                      '</div>'+
                      '</div>';
            
            } catch(e) {

            }
            var marker = new google.maps.Marker({
              position: {lat: parseFloat(location.location[1]), lng: parseFloat(location.location[0])},
              map: map,
              animation : google.maps.Animation.DROP,
              // icon: image,
              shape: shape,
              html: html,
              // title: location[0],
              // zIndex: location[3]
            });
            oms.addMarker(marker)
            marker[location.user_token] = marker; 
            // bounds.extend(marker.position);
            // bindInfoWindow(marker, map, infoWindow, html);
    }


    // function bindInfoWindow(marker, map, infoWindow, html) {
    //     google.maps.event.addListener(marker, 'click', function() {
    //         infoWindow.setContent(html);
    //         // map.setZoom(8);
    //         infoWindow.open(map, this);
    //         $compile($('.view-demo'))($scope)
    //     });
    // }

}         

	}

function initializeDefault() {
        map = new google.maps.Map(document.getElementById('map'), {
    	center: {lat: 34.024212, lng: -118.496475},
    	zoom: 10,
      scrollwheel: false,

  			});


    }

$scope.viewProduct = function(id){
	$rootScope.listingRoute = true;
	$scope.productId = id;
	$location.path('/listings').search({l: $scope.productId})
	}

$scope.viewUser = function(id,type){
	$scope.userId = id;
	$location.path('/user').search({u: $scope.userId, t: type })
	}
$scope.$watch(function(){ return $location.search() }, function(params){
    if(params == undefined){
      return;
    }

    $scope.active = {tab: true}
});
// $rootScope.reload = function(){
// 	$timeout(function(){
// 		angularGridInstance.gallery.refresh();
// 		},400)
// 	}
$scope.sortBy = function(type, value){
  $scope.searchObject = $.extend($location.search(),{sort: type, rank: value})
  $location.search($scope.searchObject)
  }
}])

