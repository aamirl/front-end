sourceAdminApp.controller('redirectionCtrl',  ['$scope', 'locServ', '$location', 'sessionService', 'Auth', 'apiCall','$window', '$http','$rootScope','$cookies','storageService',
    function($scope, locServ, $location, sessionService, Auth, apiCall, $window, $http, $rootScope, $cookies, storageService){
    $scope.deleteParams = function() {
        $location.search('key', null)
        $location.search('service', null)
        $location.search('redirection', null)
      }
    $scope.timezone = jstz.determine();
    $cookies.put('timezone', $scope.timezone.name());
    $cookies.remove('entity') 
    if($cookies.get('sellyxtoken')){
        var req1 = {
          method: "GET",
          url: "https://auth.sellyx.com/auth/validate?key="+ $cookies.get('sellyxtoken'),
        }
 
        apiCall.getapi(req1).then(function (response){
          // console.log(response);
          if(response.success){
            
          }
        }, function (response){
          console.log(response);
        })
  // if(!$cookies.getObject('userInfo')){
    req={
            method: 'POST',
            url : 'users/a/get'                  
            }
        apiCall.getapi(req).then(function(obj){
          if(obj.success){
            var seen = []
            var userInfo = obj.success.data;
            var store_userInfo = {
                name: userInfo.name,
                id: userInfo.id, 
                email: userInfo.email,
              } 
            req = {
              method: 'POST',
              url: 'users/a/entities/summary',
              }
            apiCall.getapi(req).then(function(obj){
              if(obj.success){
                var sellerInfo = obj.success.data;
              }
               $cookies.put('sellerInfo', JSON.stringify(sellerInfo));
               $cookies.put("entity", sellerInfo[0].id)

              req = {
               method: 'POST',
               url : 'messages/a/count',
               failure_message: true,
              };

              apiCall.getapi(req)
                .then(
                function(obj){
                    if(obj.success){
                      $cookies.put('messages',obj.success.data);
                    }
                    else console.log(obj.failure);
                },
                function(obj){
                    console.log(obj);
              });

            req = {
               method: 'POST',
               url : 'listings/a/orders/get/selling/count',
               failure_message: true,
              };

              apiCall.getapi(req)
                .then(
                function(obj){
                    if(obj.success){
                      $cookies.put('orders', obj.success.data);
                    }
                    else console.log(obj.failure);
                      $location.url($location.search().redirection);
                      $scope.deleteParams();
                },
                function(obj){
                    console.log(obj);
            });
            })
            $rootScope.firstLogged = true;
            $cookies.putObject("userInfo", store_userInfo)
            $cookies.put("currency", userInfo.currency);
            $cookies.put("standard", 'US')


          } else console.log("failed getting into user info from the server");
        }, function(obj){
            $window.location.href='https://auth.sellyx.com/logout?service=www';
        })
  // }
  // else {
  //   userInfo = $cookies.getObject('userInfo');
  //   if(!JSON.parse($cookies.get('sellerInfo'))){
  //     req = {
  //             method: 'POST',
  //             url: 'users/a/entities/summary',
  //             }
  //           apiCall.getapi(req).then(function(obj){
  //             if(obj.success){
  //               var sellerInfo = obj.success.data;
  //               $location.path($location.search().redirection);
  //               $scope.deleteParams();
  //             }
  //              $cookies.putObject('sellerInfo', sellerInfo);
  //              $cookies.put("entity", sellerInfo[0].id)
  //           })
  //   }
  //   else{
  //     $location.path($location.search().redirection);
  //     $scope.deleteParams();
  //   }

  // }
    
     }
     if(!$location.search().redirection || $location.search().redirection == 'redirect'){
        $location.path('/')
        };
}])