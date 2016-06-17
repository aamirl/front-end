sourceAdminApp.controller('header', ['$rootScope', '$scope', '$http', '$timeout', '$cookies', '$location', '$window', '$state', 'sessionService', 'apiCall', 'Auth', 'Alertify','storageService', function($rootScope, $scope, $http, $timeout, $cookies, $location, $window, $state, sessionService, apiCall, Auth, Alertify,storageService){
	if($cookies.get('mobile')){
    	$('#header, #footer').css('display', 'none');
    	}
	$scope.x = 0;
	$scope.y = 40;
	$rootScope.loadMore = false;
	$scope.filter = {};
	$scope.search = {query: ''};
	$scope.model = {addresses: ''}
	$rootScope.setting.layout.pageWithoutSidebar = true;
	$rootScope.items = [];
	$scope.currencies = ROOT_CURRENCIES;
	$scope.initializing = true;
	$scope.loadListing = true;
	$scope.googleMaps = true;
	$rootScope.infiniteScroll = true;
	$scope.searchDropdown = 'All';
	$scope.categories = {
      01 : 'Books',
      02 : 'Movies/Music',
      03 : 'Electronics',
      04 : 'Clothing',
      05 : 'Jewelry',
      06 : 'Shoes / Accessories',
      07 : 'Games/Toys',
      08 : 'Home / Garden',
      09 : 'Health',
      10 : 'Beauty',
      11 : 'Food / Beverages',
      12 : 'Sports / Outdoors',
      13 : 'Automotive',
      14 : 'Industrial',
      15 : 'Pets/Animals',
      16 : 'Office / School',
      17 : 'Travel',
      18 : 'Tickets',
      19 : 'Other',
    }
$scope.deleteParams = function() {
        $location.search('key', null)
        $location.search('service', null)
        $location.search('redirection', null)
      }

if($location.search().redirection){
	$location.url($location.search().redirection)
	}
if($location.search().key){
	$location.search({key: null})
	}
if(!$cookies.get('timezone')){
	$scope.timezone = jstz.determine();
	$cookies.put('timezone', $scope.timezone.name())
	}
    if($cookies.get('sellyxtoken')){
        var req1 = {
          method: "GET",
          url: "https://auth.sellyx.com/auth/validate?key="+ $cookies.get('sellyxtoken'),
          failure_message: true,
        }
 
        apiCall.getapi(req1).then(function (response){
          // console.log(response);
          if(response.success){
          	var user = response.success.data.user;
			  if(!$cookies.getObject('userInfo') || $cookies.getObject('userInfo').id != user.id){
			  		var url = $location.url();
			  		$location.path('/redirect').search({redirection: url})
			  	}
			  else {
			    userInfo = $cookies.getObject('userInfo');
			    $scope.userInfo = userInfo;
			    $scope.chosenCurrency = $cookies.get('currency')? $cookies.get('currency') : 'USD';
				// $scope.chosenStandard = ($cookies.get('standard') == 'US'? 'US System' : 'Metric System');
				$scope.chosenStandard = 'US System';
				$rootScope.currencySymbol = $scope.currencies[$scope.chosenCurrency].symbol;
				$scope.loggedIn = true;
				$scope.avatar = "https://sellyx-ecom.s3-us-west-1.amazonaws.com/"+$scope.userInfo.id+".jpg";
				$scope.userName = $scope.userInfo.name.display;

			    if(!$cookies.get('sellerInfo')){
			      		req = {
			              method: 'POST',
			              url: 'users/a/entities/summary',
			              }
			            apiCall.getapi(req).then(function(obj){
			              if(obj.success){
			                var sellerInfo = obj.success.data;
			                $location.path($location.search().redirection);
			                $scope.deleteParams();
			              }
			               $cookies.putObject('sellerInfo', sellerInfo);
			               $cookies.put("entity", sellerInfo[0].id)
			            })
			    }
			    else{
			      $location.path($location.search().redirection);
			      $scope.deleteParams();
			    }

			  }
          }
          else if(response.failure){
          		$cookies.remove('userInfo')
			   	$cookies.remove("sellyxtoken");
			    $cookies.remove("sellerInfo");
			   	$cookies.remove("exp_time");
				$cookies.remove("entity");
				$cookies.remove("entityInfo");
          	if(!$cookies.get('currency')){
				$scope.chosenCurrency = 'USD';
				$scope.chosenStandard = 'US System'
				$rootScope.currencySymbol = $scope.currencies[$scope.chosenCurrency].symbol;
				$cookies.put('standard', 'US')
				$cookies.put('currency', $scope.chosenCurrency)
				}
			else{
				$scope.chosenCurrency = $cookies.get('currency');
				$scope.chosenStandard = ($cookies.get('standard') == 'US'? 'US System' : 'Metric System');
				$rootScope.currencySymbol = $scope.currencies[$scope.chosenCurrency].symbol;
				}
			$scope.loggedIn = false;
			$('.login-buttons').show();
          	return;
          	}
        }, function (response){
          console.log(response);
        })
}
else{
	if(!$cookies.get('currency')){
		$scope.chosenCurrency = 'USD';
		$scope.chosenStandard = 'US System'
		$rootScope.currencySymbol = $scope.currencies[$scope.chosenCurrency].symbol;
		$cookies.put('standard', 'US')
		$cookies.put('currency', $scope.chosenCurrency)
		}
	else{
		$scope.chosenCurrency = $cookies.get('currency');
		$scope.chosenStandard = ($cookies.get('standard') == 'US'? 'US System' : 'Metric System');
		$rootScope.currencySymbol = $scope.currencies[$scope.chosenCurrency].symbol;
		}
	$scope.loggedIn = false;
	$timeout(function(){
		$('.login-buttons').show();
		})
}

if($location.search().q){
	$scope.search = {query: $location.search().q };
	}
if($location.search().type){
	switch($location.search().type){
		case '1': $scope.searchDropdown = 'For Sale';
				  break;
		case '2': $scope.searchDropdown = 'For Borrow';
				  break;
		case '3': $scope.searchDropdown = 'Service';
				  break;
		case '4,5': $scope.searchDropdown = 'Housing';
				  break;
		case '6,7,8': $scope.searchDropdown = 'Employment/Careers';
				  break;
		default : $scope.searchDropdown = 'All Types';
		}
	}
if($location.search().categories){
	console.log($location.search().categories)
	$scope.searchDropdown = $scope.categories[parseInt($location.search().categories)]
	}

$rootScope.load = function(load,event){
	$rootScope.infiniteScroll = true;
	$rootScope.clearSearch = false;
	$rootScope.listings_loaded = false;
	$('.no-results').hide();
	$('.searchbar').hide();
	$('.mobile-searchbar').hide();
 	var data = {};
 	if(event){
 	  var button = angular.element($(event.currentTarget))
 	  var label = button.html()
      button.html('<i class="fa fa-spinner fa-spin"></i>');
      button.addClass('disabled').attr('disabled',true);
 		}
	if(load){
		if(load != 'load'){
			$scope.x = 0;
			$scope.y = 40;
			$rootScope.items = [];
			if($scope.search.query!== '' && $scope.search.query!== undefined){
				$rootScope.clearSearch = true;
				data.q = $scope.search.query;
				}
			if(!$.isEmptyObject($scope.filter)){
				angular.forEach($scope.filter, function(v,k){
					if(k != 'type' && k!='categories' && !$('#'+k).is(":visible")){
						delete $scope.filter[k];
						return true;
						}
					if(k == 'minprice' || k == 'maxprice'){
						data.price = "" + ($scope.filter.minprice? $scope.filter.minprice : 0 ) + "," +($scope.filter.maxprice? $scope.filter.maxprice : 100000000 )
					}
					else{
						if(v.join){
							data[k] = v.join(',');
							}
						else{
							data[k] = v;
							}
						}
					})
				$rootScope.clearSearch = true;
				}
			if(load != 'previous'){
				$scope.watchQuery = true;
				$location.search(data)
				}
			}
		}
	if($scope.model.addresses){
		$scope.lat = $scope.model.addresses.geometry.location.lat;
		$scope.lon = $scope.model.addresses.geometry.location.lng;
		$cookies.putObject('loc', $scope.model.addresses)
		$rootScope.user_locate = $scope.model.addresses.formatted_address;

		}
	else if($cookies.get('loc')){
		$scope.userLocation = $cookies.getObject('loc');
		$scope.lat = $scope.userLocation.geometry.location.lat;
		$scope.lon = $scope.userLocation.geometry.location.lng;
		}
	else{
		if($scope.user_location.latitude){
			$scope.lat = $scope.user_location.latitude;
			$scope.lon = $scope.user_location.longitude;
			}
		else{
			$scope.lat = $scope.user_location.lat;
			$scope.lon = $scope.user_location.lon;
			}
		}
	if(!$.isEmptyObject($location.search())){
		$rootScope.clearSearch = true;
		data = $location.search();
		}
	if(load == 'go'){
		if($location.path() != '/'){
			$rootScope.dontLoad = true;
			$location.path('/');
			}
		// else{
		// 	$location.path('/')
		// 	}
		}
		data.x = $scope.x;
		data.y = $scope.y;
		!data.distance? data.distance = 50 : '' ;
		// $location.search('x', null);
		// $location.search('y', null);
		// $location.search('distance', null);

	var req = {
		method : "POST",
		url : "https://ec.sellyx.com/listings/p/get",
		data: data,
		headers: {latlon: $scope.lat+','+$scope.lon, currency: $cookies.get('currency'), standard: $cookies.get('standard'), 'Time-Zone': $cookies.get('timezone')}
	};
	$http(req).then(function(res){
		if(res.data.success){
			var arr = res.data.success.data;
			$rootScope.items = $rootScope.items.concat(arr);
			$('#filter_modal').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
			$('.mobile-searchbar').hide();
			$scope.x += 40;
		    if(res.data.success.counter <= $scope.x){
		    	$rootScope.loadMore = false;
		    }
		    else{
		    	$rootScope.loadMore = true;
		    	if($scope.x == 40){
					$rootScope.infiniteScroll = true;
					}
				else{
		    		$rootScope.infiniteScroll = false;	
					}
		    }
		    // $rootScope.reload();
		} else {
			// $scope.filter = {};
			// $scope.search = {query: ''};
			// // $scope.load('new')
		    $rootScope.loadMore = false;
			$('#filter_modal').modal('hide');
			if($('.mobile-bar').is(':visible')){
				$('.mobile-searchbar').show();
				}
			else{
				$('.searchbar').show();	
				}
			$('.no-results').show();
		}
	}, function(res){
		console.log(res);
	})
	.finally(function(){
        if(button){
          button.html(label)
          button.removeClass('disabled').attr('disabled',false);
          }
        $rootScope.listings_loaded = true;
       	$('.show-footer').show();

        });
}

$scope.retrieveLocation = function(){
	var locationReq = { method : "GET", url : "https://accounts.sellyx.com/get/location?key=TlqTXUwUSj71d6WfOcNU0Fua2veObAeXzAnOfktM"};
	$http(locationReq).then(function (res){
		if($cookies.get("userloc")){
			if($cookies.get("loc")){
				console.log($cookies.getObject("userloc"))
				console.log(JSON.stringify(res.data))
				if(JSON.stringify($cookies.getObject("userloc")) != JSON.stringify(res.data)){
					$cookies.remove('loc');
					}
				}
			}
		$cookies.putObject("userloc", res.data)
		$scope.user_location = res.data
		if($scope.user_location.city.indexOf('(') != -1){
				$scope.user_location.city = $scope.user_location.city.substring(0, $scope.user_location.city.indexOf('('))
				}
		$rootScope.user_locate = $scope.user_location.city+", "+$scope.user_location.state;
		if($cookies.get("loc")){
			$scope.user_location = $cookies.getObject("loc");
			$rootScope.user_locate = $scope.user_location.formatted_address
			}
		if($location.path() == '/'){
			if(!$rootScope.dontLoad){
				$scope.load();
				}
			else{
				$rootScope.dontLoad = false;
				}
			}

	},function (res){
		$scope.user_location = {lat: 34.024212, lon: -118.496475, city: 'Santa Monica', state: 'CA' }
		$rootScope.user_locate = $scope.user_location.city+", "+$scope.user_location.state;
		$cookies.putObject('userloc', $scope.user_location)
		$scope.load();
	})
	}

// if(!$cookies.get("userloc")){
// 	$scope.retrieveLocation();
// 	}
// else{
// 	$scope.user_location = $cookies.getObject('loc')? $cookies.getObject('loc') : $cookies.getObject("userloc");
// 	if($cookies.get('loc')){
// 	$rootScope.user_locate = $scope.user_location.formatted_address
// 		}
// 	else{
// 		if($scope.user_location.city.indexOf('(') != -1){
// 			$scope.user_location.city = $scope.user_location.city.substring(0, $scope.user_location.city.indexOf('('))
// 			}
// 		$rootScope.user_locate = $scope.user_location.city+", "+$scope.user_location.state;
// 		}
// 	if($location.path() == '/'){
// 			if(!$rootScope.dontLoad){
// 				$scope.load();
// 				}
// 			else{
// 				$rootScope.dontLoad = false;
// 				}
// 			}
// 	}

$rootScope.filtering = function(){
	$scope.removeListingType = false;
	if($scope.filter.categories || $location.search().categories){
		$scope.removeListingType = true;
		}
	if(!$.isEmptyObject($location.search())){
		angular.forEach($location.search(), function(v,k){
			$scope.filter[k] = v;
			})
		}
	console.log($scope.filter)
	if($(window).width() > 767) {
    	$('.empty-option').remove();
    	}
	$('#filter_modal').modal('show');
}
$scope.refreshAddresses = function(address) {
	if($scope.googleMaps){
		$scope.googleMaps = false;
		return;
		}
	else{
	    var params = {address: address, sensor: false };
	    return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {params: params})
	      .then(function(response) {
	        return $scope.addresses = response.data.results
	      });
	  }
    };
$scope.changeStandard = function(standard){
    $cookies.put('standard', standard)
    $scope.chosenStandard = (standard == 'US'? 'US System' : 'Metric System')
    $window.location.reload();
    }
$scope.changeCurrency = function(currency){
    $cookies.put('currency', currency);
    $scope.chosenCurrency = currency;
	$rootScope.currencySymbol = $scope.currencies[$scope.chosenCurrency].symbol;
    $window.location.reload();
    }

$scope.changeListingType = function(list){
	if(list.length){
		if(list.length == 2 && $.inArray('4', list) == 0 && $.inArray('5', list) == 1){
			$scope.housing = true;
			}
		else{
			$scope.housing = false;
		}
		if(list.length == 2 && $.inArray('6', list) == 0 && $.inArray('7', list) == 1){
			$scope.employment = true;
			}
		else{
			$scope.employment = false;
			}
		}
	}

$scope.randomNum = function(arr){
	var i = arr.length;
	var ran = Math.floor(Math.random()*i);
	console.log(ran);
	return "https://sellyx-ecom.s3-us-west-1.amazonaws.com/l_"+arr[ran]+"?AWSAccessKeyId=AKIAIZYV5W77V235JRWQ";
}

$scope.goHome = function(){
	if($location.path() != '/'){
		$scope.loadListing = false;
		$location.path('/').search('')
		}
	else{
		if($.isEmptyObject($location.search())){
			return;
			}
		else{
			$scope.search.query="";
			$scope.filter = {};
			$location.path('/').search('')
			$timeout(function(){
				$window.location.reload()
				},100)
			}
		}
	}

$scope.resetFilters = function(){
	$scope.filter = {};
	}

$scope.showSearch = function(){
	if($('.searchbar').is(":visible")){
		$('.searchbar').slideToggle(200);
		}
	else{
		$('.searchbar').slideToggle(200);
		}

	}

$scope.showMobileSearch = function(){
	if($('.mobile-searchbar').is(":visible")){
		$('.mobile-searchbar').slideToggle(200);
		}
	else{
		$('.mobile-searchbar').slideToggle(200);
		}

	}
$scope.loginRedirect = function(){
	$window.location.href='https://auth.sellyx.com/login?service=www&redirection='+encodeURIComponent($location.url());
	}
$scope.registerRedirect = function(){
	$window.location.href='https://auth.sellyx.com/register?service=www&redirection='+encodeURIComponent($location.url());
	}


$scope.$watch(function(){ return $location.search() }, function(params){
 if($location.path() != '/'){
 	return;
 	}
 if ($scope.initializing) {
    $timeout(function() { $scope.initializing = false; });
    return;
  }
 else if($location.search().h){
 	$location.search('h',null);
 	return;
 	}
  else {
  	if(!$scope.loadListing){
  		$scope.loadListing = true;
  		return;
  		}
  	else{
	  	if($location.path() == '/'){
		    if($scope.watchQuery){
			$scope.watchQuery = false;
			return;
			}
			if($location.search().q){
				$scope.search = {query: $location.search().q };
				}
			else{
				$scope.search = {query: ''}
				}
			$rootScope.load('previous')
		}
		}
  }
});

$scope.openCurrency = function(currency){
	if(currency){
		$scope.showCurrency = true;
		}
	else{
		$scope.showCurrency = false;
		}
	$('#currency_modal').modal('show');
	}

$scope.searchFilter = function(type, value, event){
	$scope.searchDropdown = angular.element($(event.currentTarget)).children('a').html();
	$scope.filter = {};
	if(type != ''){
		if(type != 'categories' && value == 4){
			$scope.filter[type] = value + ',5'
			}
		else if(type!= 'categories' && value == 6){
			$scope.filter[type] = value + ',7,8'
			}
		else{
			if(type == 'categories'){
				$scope.filter[type] = pad(value);
				console.log($scope.filter)
				}
			else{
				$scope.filter[type] = value;
				}
			}
		}
	}
function pad(d) {
	return (d < 10) ? '0' + d.toString() : d.toString();
	}
$rootScope.clearSearchFilter = function(){
	$location.search({});
	$scope.filter = {};
	$scope.searchDropdown = 'All Types'
	}

$scope.logout = function(){
    $cookies.remove("userInfo")
    $cookies.remove("sellerInfo");
   	$cookies.remove("exp_time");
	$cookies.remove("entity");
	$cookies.remove("entityInfo");
	$cookies.remove("standard");
	$cookies.remove("currency");
	$cookies.remove("messages");
	$cookies.remove("orders");

	$scope.loggedIn = false;
	$timeout(function(){
		$('.login-buttons').show();
		})

	$window.location.href='https://auth.sellyx.com/logout?service=www&redirection='+encodeURIComponent($location.url());
	}
$scope.retrieveLocation();
}])