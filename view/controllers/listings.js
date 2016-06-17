sourceAdminApp.controller('listings', ['$rootScope', '$scope', '$http', '$timeout', '$cookies', '$location', 'apiCall', 'Alertify', '$window', 'gritter', 'storageService', function($rootScope, $scope, $http, $timeout, $cookies, $location, apiCall, Alertify, $window, gritter, storageService){
  $('#content').addClass('loading-display')
  var initializing = true;
  $scope.gridWidth = 190;
  if ($(window).width() < 768) {
    $scope.gridWidth = 150
    }
 $scope.card = {
    name: '',
    number: '',
    exp_month: '',
    exp_year: '',
    cvc: ''
  };

  $scope.offer = {
    price: '',
    qty: '1',
  }

  $scope.interest = {
    price: '',
    contact: '1',
    message: '',
    custome: '',
  }
  $scope.listing = {message: ''}
  $scope.cardId = '';
  $scope.userItems = [];
  $scope.showRating = false;
  $scope.sellyxPayOption = false;
  $scope.purchasing = false;
  $scope.addCard = false;
   if($cookies.getObject('userInfo')){
      $scope.userInfo = $cookies.getObject('userInfo');
    }


$scope.$watch(function(){ return $location.search().l }, function(params){
  if (initializing) {
    $timeout(function() { initializing = false; });
  } else {
    if(params == undefined){
      return;
    }
    if($scope.watchQuery){
      $scope.watchQuery = false;
      return;
    }
    else{
      $scope.viewProduct(params,'watch')
      }
  }
});
$scope.load = function(load){
  var listing;
  if(!$location.search().l || $location.search().l == ''){
    listing = 'error';
    }
  else{
    listing = $location.search().l;
  }
  $('.no-listing').hide();
  $scope.following = false;
  $scope.favorite = false;
	var req = {
		method : "POST",
		url : "https://ec.sellyx.com/listings/p/get",
		data: {id: listing},
		headers: {currency: $cookies.get('currency'), standard: $cookies.get('standard'), 'Time-Zone': $cookies.get('timezone')}
	};
	$http(req).then(function(res){
		if(res.data.success){
			$scope.productDetails = res.data.success.data;
      $scope.purchaseAvatar = 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/s_'+$scope.productDetails.images[0]+'';
			$scope.displayImage = 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/l_'+$scope.productDetails.images[0]+'';
      $scope.productImages = [];
      $scope.tweetLink = encodeURIComponent('http://www.sellyx.com/#/listings?l='+$scope.productDetails.id);
			angular.forEach($scope.productDetails.images, function(v,k){
              var img = 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/l_'+v;
              $scope.productImages.push({
                thumb: img,
                img: img,
                })
              })
			if($scope.productDetails.quantity){
        if($scope.productDetails.quantity > $scope.productDetails.quantity_mpo){
				  $scope.number = $scope.productDetails.quantity_mpo - 1;
          }
        else{
          $scope.number = $scope.productDetails.quantity - 1;
          }
				}
      $scope.priceConversion = parseFloat($scope.productDetails.price.converted.substr($scope.productDetails.price.converted.indexOf(' ')+1).replace(/,/g, '')).toFixed(2)
      $scope.priceConversionCommas = commaSeparateNumber($scope.priceConversion)
      $scope.originalPriceConversion = commaSeparateNumber($scope.productDetails.price.data.toFixed(2))
      if($scope.userInfo && $scope.productDetails.followers){
        if($scope.checkId($scope.userInfo.id, $scope.productDetails.followers)){
          $scope.following = true;
          }
         }
      if($scope.userInfo && $scope.productDetails.favorites){ 
        if($scope.checkId($scope.userInfo.id, $scope.productDetails.favorites)){
          $scope.favorite = true;
          } 
        }
      if(!load){
        $scope.loadUserItems();
        $scope.getReviews();
        }
      else{
        $('#content').removeClass('loading-display')
        $('.listing-loading').hide();
        $('.no-listing').hide();
        $('.show-listing').show();
        initialize();
      }
    } 
		else {
      $('.show-footer').show();
      $('#content').removeClass('loading-display')
      $('.listing-loading').hide();
      $('.show-listing').hide();
      $('.no-listing').show();
		}
	}, function(res){
		console.log(res);
    $('.show-footer').show();
    $('#content').removeClass('loading-display')
    $('.listing-loading').hide();
    $('.show-listing').hide();
    $('.no-listing').show();
	})	
}

$scope.loadUserItems = function(load,event){
  if(event){
    var button = angular.element($(event.currentTarget))
    var label = button.html()
      button.html('<i class="fa fa-spinner fa-spin"></i>');
      button.addClass('disabled').attr('disabled',true);
    }
  if(!load){
    $scope.x = 0;
    $scope.y = 10;
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
       data: { entity : $scope.productDetails.entity.id, x: $scope.x, y: $scope.y},
       headers: {latlon: $scope.lat+','+$scope.lon}
      };

  apiCall.getapi(req)
      .then(
      function(obj){
          if(obj.success){
            $('#content').removeClass('loading-display')
            $('.listing-loading').hide();
            $('.no-listing').hide();
            $('.show-listing').show();
            initialize();
            var arr = obj.success.data;
            $scope.userItems = $scope.userItems.concat(arr);
          }
          else console.log(obj.failure);
          $scope.x+=10
          if(obj.success.counter <= $scope.x){
            $scope.userLoad = false;
          }
          else{
            $scope.userLoad = true;
          }
          $('.show-footer').show();
      },
      function(obj){
          console.log(obj);
  })
    .finally(function(){
        if(button){
          button.html(label)
          button.removeClass('disabled').attr('disabled',false);
          }
        });
  }

$scope.getReviews = function(){
  var req = {
             method: 'POST',
             url : 'entities/p/get',
             data: {id: $scope.productDetails.entity.id},
             failure_message: true,
            };

        apiCall.getapi(req)
            .then(
            function(obj){
                if(obj.success){
                  if(obj.success.data.reviews){
                    $scope.rating = obj.success.data.reviews.rating;
                    $scope.showRating = true;
                    }
                }
                else console.log(obj.failure);
            },
            function(obj){
                console.log(obj);
        });
  }
$scope.viewProduct = function(id,watch){
  $scope.watchQuery = true;
  $location.search({l: id})
  if($scope.userItems.length == 0){
    $scope.load();
    }
  else{
    $scope.load('dontLoad')
    }
  window.scrollTo(0, 0);
  if(watch){
    $scope.watchQuery = false;
    }
  }
$scope.openMessages = function(){
  $('.message').val('')
    if($scope.loginCheck()){
    return;
    }
  $scope.thread = false;
  $scope.message_loaded = false;
    var req = {
     method: 'POST',
     url : 'messages/a/get/thread/listing',
     data: {listing: $scope.productDetails.id},
     failure_message: true,
    };

    apiCall.getapi(req)
        .then(
          function(obj){
              if(obj.success){
                $scope.thread_id = obj.success.data.id;
                $scope.thread = true;
              }
              else {

                }
          },
          function(obj){
              console.log(obj);
          })
        .finally(function(){
          $scope.message_loaded = true;
        })
	$('#message_modal').modal('show');
	}
$scope.convertMessage = function(){
  $('#output').text($scope.listing.message);
  }

$scope.openInterests = function(){
  $scope.interest = {
    price: '',
    contact: '1',
    message: '',
    custome: '',
  }
    if($scope.loginCheck()){
    return;
    }
	$('#interest_modal').modal('show');
	}

$scope.openKey = function(){
  $scope.purchased = false;
  $scope.addCard = false;
  $scope.cardsLoaded = false;
  $scope.cardId = '';
  $scope.offer = {
    price: '',
    qty: '1',
    }
  if($scope.productDetails.p_type){
    $scope.offer.price = $scope.priceConversion;
    }
  if($scope.loginCheck()){
    return;
    }
  $scope.card = {};
  $scope.cardError = '';
  $scope.sellyxError = '';

  var req = {
     method: 'POST',
     url : 'payments/sources/a/all',
     data: {id: $scope.userInfo.id},
     failure_message: true,
    };

  apiCall.getapi(req)
      .then(
        function(obj){
            if(obj.success){
              $scope.savedCards = obj.success.data;
            }
            else {
              $scope.addCard = true;
              console.log(obj.failure);
              }
        },
        function(obj){
            console.log(obj);
        })
      .finally(function(){
        $scope.cardsLoaded = true;
        })
  $('#key_modal').on('shown.bs.modal',function(){
    if($scope.productDetails.p_type){
      if($scope.productDetails.p_type.data == 1){
        $('.offer-price').prop('disabled', true);
        }
      else{
        $('.offer-price').prop('disabled', false);
      }
      }
  })
	$('#key_modal').modal('show');
	}

$scope.viewUser = function(id,type){
	$location.path('/user').search({u: id, t: type})
	}

$scope.getNumber = function(num) {
    return new Array(num);   
}

$scope.loginCheck = function(){
  if(!$cookies.get('sellyxtoken') || !$cookies.getObject("userInfo")){
    $('#login_modal').modal('show')
    $scope.url = encodeURIComponent($location.url());
      return true;
    }
  }

$scope.submitForm = function(){
  if(parseFloat($scope.offer.price) < .50){
        gritter.add({text:'The lowest offer you can make for any item is $0.50',title:'Error', image: 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/Failure.png'})
        return;
        }
  $scope.cardError = '';
    var form = $('#payment-form');

    // Disable the submit button to prevent repeated clicks
    var label = form.find('button').html();
    $scope.purchasing = true;
    form.find('button').html('<i class="fa fa-spinner fa-pulse"></i>').prop('disabled', true);

    Stripe.card.createToken(form, function(status, response){
      console.log(response)
      if(response.error){
        form.find('button').html(label).prop('disabled', false);
        $scope.purchasing = false;
        $scope.$apply(function(){
          $scope.cardError = '*' + response.error.message;
          })
        }

      else{
        var price = $scope.offer.price? $scope.offer.price : $scope.priceConversion;
        var quantity = $scope.offer.qty && $scope.offer.qty > 1 ? $scope.offer.qty : '1';
        $scope.amount = $rootScope.currencySymbol + $scope.fixedNumber(price * quantity *1.03, 2);
        var data = {
          id: $scope.productDetails.id,
          amount: (price * quantity * 1.03),
          quantity: quantity,
          transactions : [
            {
              amount: $scope.fixedNumber(price*quantity*1.03, 2),
              type: 'stripe',
              token: response.id,
            }
          ]
        }
        var req = {
                 method: 'POST',
                 url : 'listings/a/order/authorize',
                 data: data,
                 failure_message: true,
                };

            apiCall.getapi(req)
                .then(
                function(obj){
                    if(obj.success){
                      console.log(obj.success.id)
                      if($scope.offer.price < $scope.priceConversion){
                        $scope.bestOffer = true;
                        }
                      else{
                        $scope.bestOffer = false;
                        }

                      $scope.purchased = true;

                    }
                    else {
                      console.log(obj.failure);
                      $scope.cardError = '*' + obj.failure.msg;
                    }
                    $scope.purchasing = false;
                    form.find('button').html(label).prop('disabled', false);

                },
                function(obj){
                  $scope.purchasing = false;
                  form.find('button').html(label).prop('disabled', false);
                    console.log(obj);
            });
        }
    });

    // Prevent the form from submitting with the default action
    return false;
  }

$scope.savedCardPurchase = function(){
  if(parseFloat($scope.offer.price) < .50){
        gritter.add({text:'The lowest offer you can make for any item is $0.50',title:'Error', image: 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/Failure.png'})
        return;
        }
    $scope.purchasing = true;
    if($scope.cardId == ''){
      gritter.add({text:'You must select a saved card.',title:'Error', image: 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/Failure.png'})
      $scope.purchasing = false;
      return;
      }
    var price = $scope.offer.price? $scope.offer.price : $scope.priceConversion;
    var quantity = $scope.offer.qty && $scope.offer.qty > 1 ? $scope.offer.qty : '1';
    $scope.amount = $rootScope.currencySymbol + $scope.fixedNumber(price * quantity * 1.03, 2);
    var data = {
      id: $scope.productDetails.id,
      amount: (price * quantity * 1.03),
      quantity: quantity,
      transactions : [
        {
          amount: $scope.fixedNumber(price*quantity*1.03, 2),
          type: 'stripe',
          card: $scope.cardId,
        }
      ]
    }
    var req = {
             method: 'POST',
             url : 'listings/a/order/authorize',
             data: data,
             failure_message: true,
            };

        apiCall.getapi(req)
            .then(
            function(obj){
                if(obj.success){
                  console.log(obj.success.id)
                    if($scope.offer.price < $scope.priceConversion){
                        $scope.bestOffer = true;
                        }
                      else{
                        $scope.bestOffer = false;
                        }

                      $scope.purchased = true;
                }
                else {
                  console.log(obj.failure);
                  $scope.cardError = '*' + obj.failure.msg;
                }
                $scope.purchasing = false;

            },
            function(obj){
              $scope.purchasing = false;
        });
  }

$scope.sellyxPay = function(event){
  if(parseFloat($scope.offer.price) < .50){
        gritter.add({text:'The lowest offer you can make for any item is $0.50',title:'Error', image: 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/Failure.png'})
        return;
        }
  $scope.purchasing = true;
  $scope.sellyxError = '';
  var price = $scope.offer.price? $scope.offer.price : $scope.productDetails.price.data;
  var quantity = $scope.offer.qty && $scope.offer.qty > 1 ? $scope.offer.qty : '1';
  $scope.amount = '$' + $scope.fixedNumber(price * quantity, 2)
  var data = {
    id: $scope.productDetails.id,
    price: (price * quantity),
    quantity: quantity,
    transactions : [
      {
        amount: $scope.fixedNumber(price*quantity, 2),
        type: 'sellyx',
      }
    ]
  }
  var req = {
           method: 'POST',
           url : 'listings/a/order/authorize',
           data: data,
           button: angular.element($(event.currentTarget)),
           failure_message: true,
           custom_currency: true,
          };

      apiCall.getapi(req)
          .then(
          function(obj){
              if(obj.success){
                console.log(obj.success.id)
                if($scope.offer.price < $scope.priceConversion){
                        $scope.bestOffer = true;
                        }
                      else{
                        $scope.bestOffer = false;
                        }
                $scope.purchasing = false;
                $scope.purchased = true;
              }
              else {
                console.log(obj.failure);
                $scope.purchasing = false;
                $scope.sellyxError = '*'+obj.failure.msg;
                }
              
          },
          function(obj){
              console.log(obj);
              $scope.purchasing = false;

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
        message: $('#output').text(),
        subject: 'Listing: '+ $scope.productDetails.title,
        listing: $scope.productDetails.id,
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

// $scope.sendInterest = function(event){
//   if($scope.interest.price == ''){
//     gritter.add({text:'Please enter an offer', title:'Error', image: 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/Failure.png'})
//     return;
//     }
//   var req = {
//        method: 'POST',
//        url : 'interests/a/new',
//        data: {
//         id: $scope.productDetails.id,
//         location: $scope.productDetails.location,
//         price: $scope.interest.price,
//         message: $scope.interest.message,
//         contact: $scope.interest.contact,
//        },
//        button: angular.element($(event.currentTarget)),
//       };
    
//     if($scope.interest.contact == 5){
//       if($scope.interest.custom){
//         req.data.custom = $scope.interest.custom;
//         }
//       else{
//         gritter.add({text:'Please enter a contact method',title:'Error', image: 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/Failure.png'})
//         return;
//         }
//       }


//   apiCall.getapi(req)
//       .then(
//       function(obj){
//           if(obj.success){
//             $('#interest_modal').modal('hide');
//             gritter.add({text:'Your interest was sent!',title:'Success', image: 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/Success.png'})
//           }
//           else console.log(obj.failure);
//       },
//       function(obj){
//           console.log(obj);
//   });
//   }

$scope.watchListing = function(id, event){
  if($scope.loginCheck()){
    return;
    }
  if($scope.following){
    $scope.following = false;
    }
  else{
    $scope.following = true;  
    }

      var req = {
       method: 'POST',
       url : 'listings/a/follow',
       data: {
        id: id,
        add: $scope.following,
       },
      };


  apiCall.getapi(req)
      .then(
      function(obj){
          if(obj.success){
            console.log(obj.success)
          }
          else console.log(obj.failure);
      },
      function(obj){
          console.log(obj);
  });

  }

$scope.flagListing = function(id, event){
  if($scope.loginCheck()){
    return;
    }

  Alertify.confirm('Are you sure you would like to flag this listing?')
  .then(function(){
    if($scope.productDetails.flags){
      if($scope.checkId($scope.userInfo.id, $scope.productDetails.flags.entities))
        gritter.add({text:'You have already flagged this listing.',title:'Error', image: 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/Failure.png'})
        return;
      }
        var req = {
         method: 'POST',
         url : 'listings/a/flag',
         data: {
          id: id,
         },
        };

      apiCall.getapi(req)
          .then(
          function(obj){
              if(obj.success){
                gritter.add({text:'This listing has been flagged.',title:'Success', image: 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/Success.png'})
              }
              else console.log(obj.failure);
          },
          function(obj){
              console.log(obj);
      });
    })

  }

$scope.openShareModal = function(){
  $('#share_modal').modal('show');
  }

$scope.favoriteListing = function(id, event){
    if($scope.loginCheck()){
    return;
    }
  if($scope.favorite){
    $scope.favorite = false;
    }
  else{
    $scope.favorite = true;  
    }

      var req = {
       method: 'POST',
       url : 'listings/a/favorite',
       data: {
        id: id,
        add: $scope.favorite,
       },
      };


  apiCall.getapi(req)
      .then(
      function(obj){
          if(obj.success){
            console.log(obj.success)
          }
          else console.log(obj.failure);
      },
      function(obj){
          console.log(obj);
  });

  }
$scope.checkId = function(userid, arr){
  var found = arr.some(function (el) {
    return el.id === userid;
  });
  if (found) {return true}
  else{return false}
  }

$scope.switchPay = function(){
  if(!$scope.productDetails){
    return;
    }
  if($scope.productDetails.p_type.data == 1){
    $timeout(function(){
      $('.offer-price').prop('disabled', true);
      })
    }
  if($scope.productDetails){
    if(!$scope.sellyxPayOption){
      $scope.sellyxPayOption = true;
      $scope.offer.price = $scope.productDetails.price.data.toFixed(2);
      }
    else{
      $scope.sellyxPayOption = false;
      $scope.offer.price = $scope.priceConversion;
      }
    }
  }

$scope.newCard = function(){
  if($scope.addCard){
    $scope.addCard = false;
    }
  else{
    $scope.addCard = true;
    }
  }

$scope.selectCard = function(event){
  var card = angular.element($(event.currentTarget))
  $scope.cardId = card.data('card');
  if(card.hasClass('selected-card')){
    card.removeClass('selected-card')
    $scope.cardId = '';
    }
  else{
    $('.selected-card').removeClass('selected-card')
    card.addClass('selected-card')
    }
  }


function initialize() {
            var mapOptions = {
                zoom: 7,
                maxZoom: 13,
                scrollwheel: false,
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
      position: {lat: $scope.productDetails.location.coordinates.lat, lng: $scope.productDetails.location.coordinates.lon},
      map: map,
      animation : google.maps.Animation.DROP,
      shape: shape
    });

    bounds.extend(marker.position);

}
function commaSeparateNumber(val){
    while (/(\d+)(\d{3})/.test(val.toString())){
      val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
    }
    return val;
  }

$scope.fixedNumber = function( num, precision ) {
    return (+(Math.round(+(num + 'e' + precision)) + 'e' + -precision)).toFixed(precision);
    }

  

$scope.priceError = function(event){
    if($scope.offer.price.length < 2){
      if($scope.offer.price == '.'){
        $scope.offer.price = '0.';
      }
      return;
      }
    var parts = $scope.offer.price.split('.', 2)
    if(parts[1].length > 2){
      $scope.offer.price = $scope.offer.price.substr(0, $scope.offer.price.length - 1)
    }
    if(isNaN(parseFloat($scope.offer.price * $scope.offer.qty))){
      $scope.offer.price = '';
      gritter.add({text:'Please enter a valid number.',title:'Error', image: 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/Failure.png'})
      }
  if($scope.offer.price.length < 3){
    return;
    }
  if(event.keyCode >= 48 && event.keyCode <= 57){
    if(parseFloat($scope.offer.price) < .50){
        $scope.offer.price = '';
        gritter.add({text:'The lowest offer you can make for any item is $0.50',title:'Error', image: 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/Failure.png'})
        }
    }
  };

$scope.load();
}])