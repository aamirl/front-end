sourceAdminApp.controller('user', ['$rootScope', '$scope', '$http', '$timeout', '$cookies', '$location', 'apiCall', 'DTColumnBuilder', 'DTOptionsBuilder','$compile', 'gritter', 'Alertify', 'storageService', 'angularGridInstance', function($rootScope, $scope, $http, $timeout, $cookies, $location, apiCall, DTColumnBuilder, DTOptionsBuilder,$compile, gritter, Alertify, storageService, angularGridInstance){
$('#content').addClass('loading-display')
$scope.testObject = {};
var initializing = true;
$scope.tab = {active: true};
$scope.userItems = [];
$scope.reviewObject = {};
$scope.listing = {message: ''}
$scope.gridWidth = 190;
if ($(window).width() < 768) {
  $scope.gridWidth = 150
  }
if($cookies.getObject('userInfo')){
  $scope.userInfo = $cookies.getObject('userInfo');
  }

$scope.getUserInfo = function(){
  var user;
  if(!$location.search().u || $location.search().u == ''){
    user = 'no_user';
    }
  else{
    user = $location.search().u
  }

  $('.no-user').hide();
  $scope.following = false;
	var req = {
		method : "POST",
		url : "https://ec.sellyx.com/entities/p/get",
		data: {id: user, type: $location.search().t},
		headers: {currency: $cookies.get('currency'), standard: $cookies.get('standard'), 'Time-Zone':$cookies.get('timezone')}
	};
	$http(req).then(function(res){
		if(res.data.success){
			$scope.userDetails = res.data.success.data;
      if($scope.userDetails.reviews){
        $scope.rating = $scope.userDetails.reviews.rating;
        }
      if($scope.userInfo && $scope.userDetails.follows){ 
        if($scope.checkId($scope.userInfo.id, $scope.userDetails.follows)){
          $scope.following = true;
          } 
        }
			$scope.loadUserItems()
		} 
		else {
		  $('#content').removeClass('loading-display')
	      $('.listing-loading').hide();
	      $('.show-listing').hide();
	      $('.no-user').show();
        $('.show-footer').show();
		}
	}, function(res){
		console.log(res);
	})	
}

$scope.viewProduct = function(id){
	$scope.productId = id;
	$location.path('/listings').search({l: $scope.productId})
	}

$scope.loadUserItems = function(load){
  $scope.noListings = false;
  $scope.userLoad = false;
  if(!load){
    $scope.x = 0;
    $scope.y = 10;
    $scope.userItems = [];
    }
   if($cookies.get('userloc')){
    $scope.user_location = $cookies.getObject('userloc');
    if($scope.user_location.latitude){
      $scope.lat = $scope.user_location.latitude;
      $scope.lon = $scope.user_location.longitude;
      }
    else{
      $scope.lat = $scope.user_location.lat;
      $scope.lon = $scope.user_location.lon;
      }
  }
  var req = {
       method: 'POST',
       url : 'listings/p/get',
       data: { entity : $scope.userDetails.id, x: $scope.x, y: $scope.y},
       headers: {latlon: $scope.lat+','+$scope.lon},
       failure_message: true,
      };

  apiCall.getapi(req)
      .then(
      function(obj){
          if(obj.success){
            $('.show-footer').show();
          	$('#content').removeClass('loading-display')
            $('.listing-loading').hide();
            $('.no-listing').hide();
            $('.show-listing').show();
    //         if(!$scope.userDetails.country){
				// initialize();
				// }
            var arr = obj.success.data;
            $scope.userItems = $scope.userItems.concat(arr);
            $scope.x += 10;
            if(obj.success.counter <= $scope.x){
              $scope.userLoad = false;
              }
            else{
              $scope.userLoad = true;
              }
            // $scope.reload();
            }
          else{
            $scope.noListings = true;
            $('.show-footer').show();
            $('#content').removeClass('loading-display')
            $('.listing-loading').hide();
            $('.no-listing').hide();
            $('.show-listing').show();
            console.log(obj.failure);
          }
      },
      function(obj){
          console.log(obj);
  });
  }

$scope.retrieveReviews = function(){
  var req = {
       method: 'POST',
       url : 'reviews/p/get',
       data: { for : $scope.userDetails.id},
       failure_message: true,
      };

  apiCall.getapi(req)
      .then(
      function(obj){
          if(obj.success){
            $scope.reviews = obj.success.data;
            $('#reviewTable').DataTable().clear().rows.add($scope.reviews).draw();
          }
          else console.log(obj.failure);
      },
      function(obj){
          console.log(obj);
  });
  }

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
      position: {lat: $scope.userDetails.addresses[0].lat, lng: $scope.userDetails.addresses[0].lon},
      map: map,
      animation : google.maps.Animation.DROP,
      shape: shape
    });

    bounds.extend(marker.position);

}

$scope.dtOptions = DTOptionsBuilder.fromSource()
    .withPaginationType('full_numbers')
    .withOption('rowCallback' , rowCallback)
    .withOption('createdRow', function(row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
        })
    $scope.dtColumns = [
        DTColumnBuilder.newColumn('by').withClass('no-sorting').withTitle('Reviews').renderWith(function(d,t,r,m){
            $scope.userType = r.by.type;
            return '<div class="col-xs-12 col-sm-5 review-style" style="padding-top: 5px">'+
                    '<div class="media-left">'+
                    '<a href="" style="padding-left: 10px; cursor: text">'+
                      '<img style="width: 45px" class="email-image" check-image src="https://sellyx-ecom.s3-us-west-1.amazonaws.com/'+r.by.id+'.jpg" />'+
                    '</a>'+
                  '</div>'+
                  '<div class="media-body" style="width:100%">'+
                    '<h5 class="media-heading" style="text-align:left"><b><a href="/#/user?u='+r.by.id+'&t='+$scope.userType+'">'+r.by.name+'</a></b></h5>'+
                  '</div>'+
                '</div>'+
                  '<div class="col-xs-12 col-sm-7 review-data" style="text-align: left"><uib-rating ng-init="reviewObject['+"'"+r.id+"'"+'] = '+r.rating+'" style="outline: 0" class="star-rating" ng-model="reviewObject['+"'"+r.id+"'"+']" max="5" data-readonly="true"></uib-rating><span style="position:relative; bottom:5px" class="review-date">'+r.setup.added.converted.readable+'</span><p style="margin-top: 10px">'+r.message+'</p></div>'+
                  '<div class="col-xs-12" style="text-align: left; margin-top: 20px">'+
                  '<div class="col-xs-6 col-sm-5"><a style="position:relative; top: 5px" class="display-comments clickable">'+r.comments.length+' comments</a></div>'+
                  '<div class="col-xs-6 col-sm-7">'+
                  '<button style="font-size: 15px; float: right" class="btn-primary" ng-click="commentReview('+"'"+r.id+"'"+',$event)">Comment</button>'+
                  // '<button ng-click="upvote('+"'"+r.id+"'"+',$event)" style="font-size: 15px; margin-left: 10px"><i class="fa fa-thumbs-o-up"></i> <span>'+r.upvotes.length+'</span></button>'+
                  // '<button ng-click="downvote('+"'"+r.id+"'"+',$event)" style="margin-left: 10px; font-size: 15px"><i class="fa fa-thumbs-o-down"></i> '+r.downvotes.length+'</button>'+
                  // '<button style="margin-left: 10px; font-size: 15px"><i class="fa fa-flag-o"></i></button></div>'+
                  '</div>'+
                  '<div class="col-xs-12 comment'+r.id+'" style="display:none" ng-click="$event.stopImmediatePropagation()"><textarea style="width: 100%; height: 150px; margin-top: 15px; margin-bottom: 15px"></textarea><button style="float: right" type="button" class="btn btn-primary" ng-click="submitComment('+"'"+r.id+"'"+',$event)">Submit Comment</button></div>'
          }),     
        ]
    function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull){
        $('.display-comments', nRow).unbind('click');
        $('.display-comments', nRow).bind('click', function(event) {
            $scope.$apply(function() {
                $scope.displayComments(aData, event);
            });
        });
        return nRow;
        }

  $scope.commentReview = function(id,event){
    event.stopImmediatePropagation();
    $('.comment'+id).slideToggle();
    
    }

  $scope.displayComments = function(data, event){
    var dt = $('#reviewTable').DataTable();
    var tr = angular.element($(event.currentTarget)).closest('tr')
    var row = dt.row(tr);
    $scope.childrow = tr;
    $scope.comments = data.comments;
    if($scope.comments.length == 0){
      return;
      }
    var str = '';

    str+= '<h3 style="text-align: left">'+$scope.comments.length+' COMMENTS</h3>';
    angular.forEach($scope.comments, function(v,k){
      str+= '<div style="text-align:left; border-top:1px solid #DDD; padding: 10px">'+
              '<div class="media-left">'+
              '<a href="" style="padding-left: 10px; cursor: text">'+
                '<img style="width: 45px" class="email-image" check-image src="https://sellyx-ecom.s3-us-west-1.amazonaws.com/'+v.entity.id+'.jpg" />'+
              '</a>'+
            '</div>'+
            '<div class="media-body">'+
              '<h5 class="media-heading"><a href="/#/user?u='+v.entity.id+'&t='+v.entity.type+'"><b>'+v.entity.name+'</b></a></h5>'+
              '<h5 style="margin-top: 0">'+v.setup.added.converted.readable+'</h5>'+
              '<div class="message-body">'+
               '<pre style="padding-top: 15px !important; padding-right: 70px !important;padding-left: 0; background:none; border: none; font-family: '+"'Lato'"+', Sans-serif">'+v.comment+'</pre>'+
               '</div>'+
            '</div>'+
            '</div>'+
            // (v.entity.id == $scope.userInfo.id? '<div style="text-align: right; margin-bottom: 10px"><button ng-click="deleteComment('+"'"+v.id+"'"+')" style="color: red" class="delete-comment"><i class="fa fa-trash"></i> Delete Comment</button></div>': '')+
          '</div>'
      })
    if(row.child.isShown()){
        row.child.hide();
        }
    else{
        row.child(str).show();
        $(tr).next().css('background','whitesmoke');
        $compile(angular.element($('.email-image, .delete-comment')))($scope)
        }

    }

  $scope.submitComment = function(id,event){
    if($scope.loginCheck()){
    return;
    }
    if($('.comment'+id+' textarea').val() == ''){
      gritter.add({text:'You must submit a comment.',title:'Error', image: 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/Failure.png'})
      return;
      }
    var req = {
       method: 'POST',
       url : 'reviews/a/comment/add',
       data: { id : id, comment: $('.comment'+id+' textarea').val()},
       button: angular.element($(event.currentTarget)),
      };

  apiCall.getapi(req)
      .then(
      function(obj){
          if(obj.success){
            $('.comment'+id).slideToggle();
            $('.comment'+id+' textarea').val('');
            $timeout(function(){
              $scope.retrieveReviews();
              },300)
            gritter.add({text:'Your comment was submitted.',title:'Success', image: 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/Success.png'})

          }
          else console.log(obj.failure);
      },
      function(obj){
          console.log(obj);
  });
    }

  $scope.loginCheck = function(){
  if(!$cookies.get('sellyxtoken') || !$cookies.getObject("userInfo")){
    $('#login_modal').modal('show');
    $scope.url = encodeURIComponent($location.url())
      return true;
    }
  }

  $scope.deleteComment = function(id){
    Alertify.confirm('Are you sure you would like to delete this comment?')
        .then(function(){
          var req = {
                     method: 'POST',
                     url : 'reviews/a/comment/delete',
                     data: { id : id},
                     button: angular.element($(event.currentTarget)),
                    };

                apiCall.getapi(req)
                    .then(
                    function(obj){
                        if(obj.success){
                          $('.comment'+id).slideToggle();
                          $('.comment'+id+' textarea').val('');
                          $timeout(function(){
                            $scope.retrieveReviews();
                            },250)
                             }
                        else console.log(obj.failure);
                    },
                    function(obj){
                        console.log(obj);
                });
            })
    }

  $scope.upvote = function(id, event){
    if($scope.loginCheck()){
      return;
      }
    var req = {
       method: 'POST',
       url : 'reviews/a/upvote',
       data: { id : id},
       button: angular.element($(event.currentTarget)),
      };

    $(req.button).find('span').html(parseInt($(req.button).find('span').html()) + 1)

    // apiCall.getapi(req)
    //     .then(
    //     function(obj){
    //         if(obj.success){
    //           $(req.button).find('span').html($(req.button).find('span').html() + 1)
    //         }
    //         else console.log(obj.failure);
    //     },
    //     function(obj){
    //         console.log(obj);
    // });
    }

$scope.downvote = function(id, event){
    if($scope.loginCheck()){
      return;
      }
    var req = {
       method: 'POST',
       url : 'reviews/a/downvote',
       data: { id : id},
       button: angular.element($(event.currentTarget)),
      };

    $(req.button).find('span').html(parseInt($(req.button).find('span').html()) + 1)

    // apiCall.getapi(req)
    //     .then(
    //     function(obj){
    //         if(obj.success){
    //           $(req.button).find('span').html($(req.button).find('span').html() + 1)
    //         }
    //         else console.log(obj.failure);
    //     },
    //     function(obj){
    //         console.log(obj);
    // });
    }

  $scope.openMessages = function(){
  $('.message').val('')
    if($scope.loginCheck()){
    return;
    }
  $scope.convertMessage = function(){
  $('#output').text($scope.listing.message);
  }
  $scope.thread = false;
  $scope.message_loaded = true;
  $('#message_modal').modal('show');
  $('.message').on('keyup',function(){
    $('#output').text($('.message').val());
    });
  }

  $scope.sendMessage = function(event){
  if ($('.message').val() == '') {
      gritter.add({text:'You must submit a message',title:'Error', image: 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/Failure.png'})
    return;
  }

  var req = {
       method: 'POST',
       url : 'messages/a/upsert',
       data: {
        recipients: $scope.userDetails.id,
        message: $('#output').text(),
        subject: $('.subject').val(),
       },
       button: angular.element($(event.currentTarget)),
      };

  apiCall.getapi(req)
      .then(
      function(obj){
          if(obj.success){
            $('#message_modal').modal('hide');
            gritter.add({text:'Your message was sent',title:'Success', image: 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/Success.png'})
          }
          else console.log(obj.failure);
      },
      function(obj){
          console.log(obj);
  });
  }

  $scope.downvote = function(id, event){
    if($scope.loginCheck()){
      return;
      }
    var req = {
       method: 'POST',
       url : 'reviews/a/downvote',
       data: { id : id},
       button: angular.element($(event.currentTarget)),
      };

    apiCall.getapi(req)
        .then(
        function(obj){
            if(obj.success){

            }
            else console.log(obj.failure);
        },
        function(obj){
            console.log(obj);
    });
    }
  $scope.followEntity = function(event){
    if($scope.loginCheck()){
      return;
      }
    if($cookies.getObject("userInfo").id != $location.search().u){
      if($scope.following){
        $scope.following = false;
        }
      else{
        $scope.following = true;  
        }
      }
    var req = {
       method: 'POST',
       url : 'entities/a/follow',
       data: {type: $location.search().t? $location.search().t : 't1' , id: $location.search().u , add: $scope.following },
       button: angular.element($(event.currentTarget)),
      };

    apiCall.getapi(req)
        .then(
        function(obj){
            if(obj.success){

            }
            else console.log(obj.failure);
        },
        function(obj){
            console.log(obj);
    });
    }

// $scope.reload = function(){
//   $timeout(function(){
//     angularGridInstance.gallery.refresh();
//     },500)
//   }

$scope.checkId = function(userid, arr){
  var found = arr.some(function (el) {
    return el.id === userid;
  });
  if (found) {return true}
  else{return false}
  }

$scope.scrollTop = function(user, type){
  $location.search({u: user, t: type})
  window.scrollTo(0, 0);
}

$scope.$watch(function(){ return $location.search().u }, function(params){
  if (initializing) {
    $timeout(function() { initializing = false; });
    } 
  else {
    if(params == undefined){
      return;
    }
    else{
      $scope.tab = {active: true}
      $('#reviewTable').DataTable().clear().rows.add([]).draw();
      $scope.getUserInfo()
      }
  }
});
$scope.getUserInfo();
}])