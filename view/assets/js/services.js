var services = angular.module('services', []);


/////////// API Call Service//////////////
services.service('getTemplate', ['$http', '$q', 'cacheService','apiCall', function($http, $q, cacheService, apiCall) {

  this.get = function(row){
    var data = {};
    var category = {
        category : row.data.data.line.category.data.toString()
    }

      req = {
        url: '9000/products/p/template',
        data : category,
      };

      return apiCall.getapi(req).then(

        function (obj){
          cacheService.setData(category.category, obj.success.data);
          return obj.success.data;
      }, 
      function (obj){
        console.log("Server Error");
      });
  }

}])

services.filter('tweetLinky',['$filter',
    function($filter) {
        return function(text, target) {
            if (!text) return text;

            var replacedText = $filter('linky')(text, target);

            var targetAttr = "";
            if (angular.isDefined(target)) {
                targetAttr = ' target="' + target + '"';
            }

            // replace #hashtags and send them to twitter
            var replacePattern1 = /(^|\s)#(\w*[a-zA-Z_]+\w*)/gim;
            replacedText = text.replace(replacePattern1, '$1<a href="http://www.sellyx.com/#/?h=true&q=$2"' + targetAttr + '>#$2</a>');

            return replacedText;
        };

    }
])

services.service('checkExpTime', ['$cookies', 'apiCall', "$q", "$http",'$cookies',
  function ($cookies, apiCall, $q, $http, $cookies){
      this.refresh = function(){
      console.log("checking the time");
    var now = (new Date()).getTime();
    var keyTime = $cookies.get("exp_time");
    if((keyTime - now) < 5*60*1000 && (keyTime - now) > 0){
      console.log("I will refersh the key");
      
      var req = {
        method : "GET",
        url : "https://auth.sellyx.com/auth/refresh?key="+$cookies.get("sellyxtoken")
      }

      apiCall.getapi(req).then(function(res){
        var key = res.success.data.key;
            var exp_time = res.success.data.exp_time;
            KEY_GLO = key;
            $cookies.put("sellyxtoken", key, {domain: '.sellyx.com'});
            $cookies.put("exp_time", exp_time);
      }, function(res){

      })
    }
    else {

    }
  }

}])

services.factory('chatWSService', ['api', '$cookies', '$location', 'Alertify', function (api,$cookies, $location, Alertify) {
    var ws;
    return {
        start: function (url, handShake, callback) {
            try {
                ws = new WebSocket(url);
                ws.onopen = function(){
                ws.send(handShake);
                }
                ws.onmessage = function(msg){
                    callback(msg);
                }
                ws.onclose = function(){
                  console.log("WebSocket is closed")
                  if($location.path() == '/chat'){
                      // $location.path('/rooms')

                    }
                }
            } catch(e){
                console.log(e)
                alert("Unable to connect to server");
            }
        },
        send : function(msg){
            ws.send(msg);
        },
        close : function(){
            try{
                ws.close();
                console.log("close web socket")
            } catch(e){
                console.log(e)

            }
        }

    }
}])


services.service('gritter', [ function() {
    return{
    add: function(obj){
    $.gritter.add({
        title: obj.title? obj.title : '',
        text: obj.text? obj.text : '',
        image: obj.image? obj.image : '',
        sticky: false,
        time: '2500',
        class_name: obj.class? obj.class: '',
    });
  }
}
}])



services.service('api', ['$http', '$q' , function($http, $q) {

  this.call= function(obj){
    
    !obj.method?obj.method="POST":obj.method;

  var deferred = $q.defer();

  return $http(obj)
    .then(
        function (response){
            deferred.resolve(response.data);
            return deferred.promise;

    if(obj.redirect) $location.path(obj.redirect)
        }, 
        function (response) {
      // the following line rejects the promise 
            deferred.reject(response.data);
              // promise is returned
            return deferred.promise;
        });
    }
}])

services.service('sharedRow', function () {
    var row = {};

    return {
        getRow: function () {
            return row;
        },
        setRow: function(value) {
            row = value;
        }
    };
});
services.service('getInformation', [ ,function () {
    this.message_orders = function(){

    }
}]);
services.service('apiCall', ['$http', '$q' , '$cookies','Alertify','$window','$location', function($http, $q , $cookies, Alertify, $window, $location) {

  this.getapi= function(obj){
    var do_not_show = false;
    $('.loading_notification').removeClass('hide');
    if(obj.button){
      var label = obj.button.html()
      obj.button.html('<i class="fa fa-spinner fa-spin"></i>');
      obj.button.addClass('disabled').attr('disabled',true);
      }
    if(obj.url.search('http') == -1){
      obj.url = 'https://ec.sellyx.com/' + obj.url;
    }
    if(obj.url.search('/a/') !== -1){
      !obj.headers?obj.headers={}:null;
      obj.headers.key = $cookies.get("sellyxtoken")
      obj.headers.entity = $cookies.get("entity")
      obj.custom_currency? obj.headers.currency = 'USD' : obj.headers.currency = $cookies.get("currency");
      obj.headers.standard = $cookies.get("standard")
      obj.headers['Content-Type'] = 'application/json';
      obj.headers['Time-Zone'] = $cookies.get('timezone')
      }
    if(obj.url.search('/p/') !== -1){
      !obj.headers?obj.headers={}:null;
      obj.headers.currency = $cookies.get("currency")
      obj.headers.standard = $cookies.get("standard")
      obj.headers['Content-Type'] = 'application/json';
      obj.headers['Time-Zone'] = $cookies.get('timezone')
      }

    !obj.method?obj.method="POST":obj.method;

    if(obj.failure_message){
      do_not_show = true;
      }

	  var deferred = $q.defer();

	  return $http(obj)
	  	.then(
			function (response){
			    deferred.resolve(response.data);
          if(!do_not_show){
              if(response.data.failure){
                if(parseInt(response.data.failure.code) == 101){
                  window.location.href="https://auth.sellyx.com/login?service=ecommerce&redirection="+$location.path();
                  }
                else{
                  Alertify.alert(response.data.failure.msg)
                  }
                }
              }
      		 	return deferred.promise;

        if(obj.redirect) $location.path(obj.redirect)
			}, 
			function (response) {
          // the following line rejects the promise 
				deferred.reject(response.data);
        Alertify.alert('There was a server error. Please wait a few minutes before trying again. If this message keeps appearing, please contact Sellyx.')
				  // promise is returned
				return deferred.promise;
    		})
      .finally(function(){
        $('.loading_notification').addClass('hide');
        if(obj.button){
          obj.button.html(label)
          obj.button.removeClass('disabled').attr('disabled',false);
          }

        });
    	}


	}]);

////// Registeration Service/////////////
services.factory('registerServ', ['apiCall', '$location', '$cookies',
	function(apiCall, $location, $cookies){
    
    return function (obj) {
        var req = {
             method: 'POST',
             url: '8080/register/user/new',
             
             data: obj 
        };

    var user =  apiCall.getapi(req)
      .then(
          function (result) {
           if(!result.success) return false;
           else{ 
                //var session = sessionService.generateUniqueId();
                $location.path('/verif');
                }
          },
          function (result) {
            // handle errors here
            console.log('error', result.statusText);
          });
    };
  }]);


//////LOGIN SERVICE//////////////

services.factory('loginServ', ['apiCall','$state', '$cookies', 'sessionService', 'Auth','$window',
  function(apiCall, $state, $cookies, sessionService, Auth, $window){
    return function(resource) {

      var req = {
         method: 'POST',
         url: '8080/login/sellyx',
         headers: {
           'id': "34857"
         },
         data: resource
        };

     apiCall.getapi(req)

      .then(
          function (result) {
           
            ///// if the response is failed return false
            if(result.failure) return console.log(result.failure);
            //if the response is success
            else if (result.success) {
              $('#loginModal').modal('hide');
                ///// get the key from the response
                var id =result.success;
                ////// set the key for the user and create a cookie 
                sessionService.setToken(id);
                Auth.login(id);
                req={
                    method: 'POST',
                    url : 'users/a/get'                  
                    }
                apiCall.getapi(req).then(function(obj){
                  if(obj.success){
                    var userInfo = obj.success.data;
                    req = {
                      method: 'POST',
                      url: 'users/a/entities/summary',
                      }
                    apiCall.getapi(req).then(function(obj){
                      if(obj.success){
                        var sellerInfo = obj.success.data;
                      }
                       $cookies.put("sellerInfo", sellerInfo);
                        $cookies.put("entity", sellerInfo[0].id)
                    })
                    $cookies.put("userInfo", userInfo);
                    $cookies.put("currency", userInfo.currency);
                    $cookies.put("standard", userInfo.standard)
                    $state.transitionTo('manager.account'); 
                  } else console.log("failing gettint user info from the server");
                }, function(obj){
                  console.log(obj);
                })
                ///// reroute the user to the account page

                
            }
            else console.log("something wierd");

        },
        function (result) {
            // handle errors here
            console.log('error', result.statusText);
          });

     
  	};
  }]);

//////PATH SERVICES////////////////
services.factory('Paths', [
  function(){
    return {
  	    dist: {
  		    js: {
  			    main: 'dist/js/'
  		    }
  	    },
  	    img: 'dist/css/img/'
      };
  }]);

services.factory('status', [
  function(){
    return {
      change : function(event){
        event.stopImmediatePropagation();
            $scope.statusRow = angular.element($(event.currentTarget));
            if($scope.statusRow.parents('.child-row').length > 0){
              var all = Sellyx.row.data($scope.statusRow.parents('.child-row').parents('tr').prev('tr'));
              var child = true;
              }
            else{
              var all = Sellyx.row.data($scope.statusRow);
              var child = false;
              }

            var g = {
                url : ROOT_CONFIG_PATH + ($scope.statusRow.data('path')||'') + ($scope.statusRow.data('method')?$scope.statusRow.data('method'):'status') ,
                data : '&id=' + all.data.id + '&status=' + $scope.statusRow.data('status') + ($scope.statusRow.data('extra') ? '&extra=' + $scope.statusRow.data('extra') : '' ),
                button : $scope.statusRow,
                update : {
                    row : all.row
                    },
                success : function(data){
                  
                    }
                }

            if($scope.statusRow.data('remove')) g.update.remove = true;
            else if($scope.statusRow.data('merge')) g.update.merge = true;
            g.update.child = child;
            console.log(g);
            Sellyx.ajax.standard(g)

        }
      };
  }]);


//////// generate new session id service/////////////
services.factory('sessionService',['$cookies', '$http','$rootScope','$cookies', function($cookies, $http, $rootScope, $cookies){
  return { 
   generateUniqueId: function(){
                        var d = new Date().getUTCMilliseconds();
                        var p = Math.random().toString(16).split('.')[1] ;
                        return (p+"0"+d);
                    },
                  
              
    setToken : function( newToken ) {
            token = newToken;
            if(newToken != null){
                if($cookies.get("sellyxtoken") == null || $cookies.get("sellyxtoken") != token){
                    //if there is no token in the cookie create a cookie with the user key and expiration time
                    var expireDate = new Date();
                    expireDate.setDate(expireDate.getDate() + 5);
                    // $cookies.put('sellyxtoken', newToken, {expires: expireDate, domain: '.sellyx.com'});
                    }
                }
      else{
                // if there is already token for that user just delet theat token because it will be already expired
                $cookies.remove("sellyxtoken");
                }
            // add the token to the header
            // $http.defaults.headers.common["key"]=(newToken != null)?newToken:null;
    },
    ///////////// get the key
    getToken : function() {
                            return token;
    }
  }}]);


/////////////// Auth service//////////////
services.factory('Auth', ['$cookies', function($cookies) {
    var authenticated;
    var isSeller;
    var isMaster;
    var user = {};
    var seller = {};
    return {
        isAuthenticated: function () {
          if ($cookies.get('sellyxtoken') != null){
          authenticated = true;
        }
        else {
          authenticated = false;
        }
            return authenticated;
        },
        isSeller: function () {
          user = $cookies.getObject('userInfo')
          if (JSON.parse($cookies.get('sellerInfo')) != null){
          isSeller = true;
        }
            return isSeller;
        },
        isMaster: function(){
          if(!$cookies.getObject('entityInfo')){
            isMaster = false;
            return isMaster
            }
          else{
            user = $cookies.getObject('userInfo');
            seller = $cookies.getObject('entityInfo');
            if(user.id != seller.master){
              isMaster = false;
            }
            else{
              isMaster = true;
            }
            return isMaster;
            }
        },
        getUser: function() {
            return user;
        },
        login: function(loginUser) {
            user =  loginUser;
            authenticated = true;
            //actual code for logging in taken out for brevity
        },
        logout: function(){
        }
    };
}]);

services.factory('locServ', ['apiCall', '$cookies','$q', function( apiCall, $cookies, $q){
  return {
    getLocation : function(){

            var getPosition = function(latitude,longitude){
            var req = {
              url : 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+latitude+','+longitude+'&sensor=true',
              method : 'GET'
            }
            // var request = new XMLHttpRequest();
            // var method = 'GET';
            // var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+latitude+','+longitude+'&sensor=true';
            // var async = true;
            apiCall.getapi(req).then(
              function (obj){
                extract(obj).then( function (response){
                for (var i in ROOT_COUNTRIES) { 
                  if(ROOT_COUNTRIES[i].country_code == response.country){
                    var countryId = ROOT_COUNTRIES[i].countryId;
                    var g = {
                      'city' : response.city,
                      'postal' : response.postal,
                      'coordinates' : {
                          'lat' : latitude,
                          'lon' : longitude
                          },
                      'country' : {
                          'name' : ROOT_COUNTRIES[i].country_name,
                          'id' : ROOT_COUNTRIES[i].countryId,
                          'code' : ROOT_COUNTRIES[i].country_code
                          }
                        }
                    $cookies.put("user_current_location", g);
                  }
                } 
              },function (response){});
              },
              function (obj){
                return obj;
              });
          }
        //     request.open(method, url, async);
        //     request.onreadystatechange = function(){
        //       if(request.readyState == 4 && request.status == 200){
        //         return request.responseText;
        //         var data = JSON.parse(request.responseText);
        //         address = data.results[0];
        //         address = address.address_components[5].short_name;
        //         console.log(address);
        //         for (var i in ROOT_COUNTRIES) { 
        //           if(ROOT_COUNTRIES[i].country_code == address){
        //             $cookies.put('country', ROOT_COUNTRIES[i].countryId);
        //             console.log(ROOT_COUNTRIES[i].countryId);
        //           }
        //         };
        //         // return address;
        //       }
        //     };
        //     request.send();
        //   };

        var successCallback = function(position){
          var x = position.coords.latitude,
              y = position.coords.longitude;
              getPosition(x,y);
        }
        var errorCallback = function(error){
          var errorMessage = 'Unknown error';
          switch(error.code) {
            case 1:
              errorMessage = 'Permission denied';
              break;
            case 2:
              errorMessage = 'Position unavailable';
              break;
            case 3:
              errorMessage = 'Timeout';
              break;
          }
        };

        var options = {
          enableHighAccuracy: true,
          timeout: 3000,
          maximumAge: 0
        };

        function extract(obj){
          var deferred = $q.defer();
          var data = obj;
          // var latlon = (obj.latlon?obj.latlon:false);
          var address = {};
          for (var i = 0; i < data.results.length; i++) {
            switch(data.results[i].types[0]){
                  case 'street_number':
                      !address.street1?address.street1 = data.results[i].address_components[0].long_name:address.street1 += ' ' + data.results[i].address_components[0].long_name;
                      break;
                  case  'street_number':
                  case  'route' :
                      !address.street1?address.street1 = data.results[i].address_components[0].long_name:address.street1 += ' ' + data.results[i].address_components[0].long_name;
                      break;
                  case 'premise':
                  case 'subpremise':
                      !address.street2?address.street2 = data.results[i].address_components[0].long_name:address.street2 += ' ' + data.results[i].address_components[0].long_name;
                      break;
                  case 'locality':
                      !address.city?address.city=data.results[i].address_components[0].long_name:null;
                      break;
                  case 'administrative_area_level_1':
                      !address.state?address.state=data.results[i].address_components[0].long_name:null;
                      break;
                  case 'country':
                      // TODO : HANDLE THIS ISSUE WHERE COUNTRY NAME DOESNT EQUAL THE GOOGLE NAME
                      !address.country?address.country=data.results[i].address_components[0].short_name:null;
                      break;
                  case 'postal_code':
                      !address.postal?address.postal=data.results[i].address_components[0].long_name:null;
                      break;
                  }
          };
            
          deferred.resolve(address);
            return deferred.promise;
          }

  navigator.geolocation.getCurrentPosition(successCallback,errorCallback,options);  
    }
  }
}])


  services.factory('storageService', ['$rootScope', function ($rootScope) {

    return {
        
        get: function (key) {
           return JSON.parse(localStorage.getItem(key));
        },

        save: function (key, data) {
           localStorage.setItem(key, JSON.stringify(data));
        },

        remove: function (key) {
            localStorage.removeItem(key);
        },
        
        clearAll : function () {
            localStorage.clear();
        }
    };
  }]);

  services.factory('cacheService', ['$http', 'storageService', function ($http, storageService) {
    
    return {
        
        getData: function (key) {
            return storageService.get(key);
        },

        setData: function (key,data) {
            storageService.save(key, data);
        },
        
        removeData: function (key) {
            storageService.remove(key);
        }
    };
  }]);

  services.factory("stringify", [function() {
  var stringifyProperty= function(property) {
    if(property== null) {
      return "";
    } else {
      return property.toString();
    }
  };

  var iterate = function(obj){
                var send = {};
                angular.forEach(obj, function(v,k){
                    if(typeof v == 'object'){
                          // if(v.data) send[k] = stringifyProperty(v.data);
                          send[k] = iterate(v);
                    }
                    else {
                          send[k] = stringifyProperty(v);
                    }
                })

                return send;
      }
    
  return {
    stringifyObjectData: function(object) {
      return iterate(object);
    }
  };

       
      // var simpleProperties= ["projectName","description","hours","meetingNotes"];
      // for(var p= 0; p < simpleProperties.length; p++) {
      //   project[simpleProperties[p]]= stringifyProperty(project[simpleProperties[p]]);
      // }

      // for(var t= 0; t < project.tasks.length; t++) {
      //   project.tasks[t].description= stringifyProperty(project.tasks[t].description);
      // }

    
    
}]);




// ///////////// Sellyx Services ////////////
// services.factory('Sellyx', function() {
//   return{
//     values : {

//       set : function(obj){
//           var inputData = obj.data;
//           var divs = obj.divs;
//           // var addition = (obj.addition ? obj.addition : '');
//           var locked = (obj.locked ? obj.locked : false);
//           var match = (obj.match ? obj.match : '.send');
//           var attr = (obj.html) ? obj.html : 'id';
//               divs.find(match).each(function(i,o){
//                     console.log('hellolasdkjf');
//                     angular.element($event.currentTarget.hasClass('input-error')) ? angular.element($event.currentTarget.removeClass('input-error')) : null;
//                     $this = $(this);
//                     var editVal;
//                     var id = angular.element($event.currentTarget.attr(attr));

//                     if(!id){
//                       return;
//                       }

//                 })
//         }, 
//       },
//     };
// });
