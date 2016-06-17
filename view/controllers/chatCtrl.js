sourceAdminApp.controller('chatCtrl', ['$rootScope', '$scope', '$http', '$timeout', '$cookies', '$location', 'api', 'chatWSService', '$location', 'apiCall', 'gritter', 'storageService', 'Alertify', function($rootScope, $scope, $http, $timeout, $cookies, $location, api, chatWSService, $location, apiCall, gritter, storageService, Alertify){
   $scope.msgs = [];
    $scope.offer = {
	    price: '',
	    qty: '1'
	  }

  $scope.interest = {
    price: '',
    contact: '1',
    message: '',
    custome: '',
  	}
  $scope.listing = {message:''}
  $scope.cardId = '';
  $scope.showRating = false;
  $scope.sellyxPayOption = false;
  $scope.purchasing = false;
  $scope.addCard = false;
   if($cookies.getObject('userInfo')){
   		$scope.userInfo = $cookies.getObject('userInfo');
   	}
   $scope.username = $scope.userInfo? $scope.userInfo.name.display : 'Guest'+(Math.random() * 1000000) ;
   if($location.search().key){
    $cookies.put('room_key',$location.search().key)
    }
   var req = {
       method : "GET",
       url : "https://chatting.sellyx.com/room/enter?room="+$cookies.get('room_key'),
       headers : {
           Authorization : $cookies.get("sellyxtoken")
       }
   }
   
   api.call(req).then(function(res){
       if(res.success){
           $scope.data = res.success.data;
             $('.no-listing').hide();
				var req = {
					method : "POST",
					url : "https://ec.sellyx.com/listings/p/get",
					data: {id: $scope.data.product_id},
					headers: {currency: $cookies.get('currency'), standard: $cookies.get('standard'),'Time-Zone': $cookies.get('timezone')}
				};
				$http(req).then(function(res){
					if(res.data.success){
						$scope.productDetails = res.data.success.data;
            $scope.purchaseAvatar = 'https://sellyx-ecom.s3-us-west-1.amazonaws.com/s_'+$scope.productDetails.images[0]+'';
						if($scope.productDetails.quantity){
			        		if($scope.productDetails.quantity > $scope.productDetails.quantity_mpo){
							  $scope.number = $scope.productDetails.quantity_mpo - 1;
			          			}
			        	else{
			          		$scope.number = $scope.productDetails.quantity - 1;
			          		}
						    }
			     $scope.priceConversion = parseFloat($scope.productDetails.price.converted.substr($scope.productDetails.price.converted.indexOf(' ')+1).replace(/,/g, '')).toFixed(2)
			     $scope.priceConversionCommas = commaSeparateNumber($scope.priceConversion);
           $scope.originalPriceConversion = commaSeparateNumber($scope.productDetails.price.data.toFixed(2))
           $scope.tweetLink = encodeURIComponent('http://www.sellyx.com/#/listings?l='+$scope.productDetails.id);

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
					else {
				      $('#content').removeClass('loading-display')
				      $('.listing-loading').hide();
				      $('.show-listing').hide();
				      $('.no-listing').show();
						}
					}, function(res){
						console.log(res);
					})	
           var port = $scope.data.room_port - 2000;
           var url = "ws://"+$scope.data.room_ip+":"+port;
           handShake = "key="+$scope.data.room_dkey+"&name="+$scope.username+"&usertype=1";
           chatWSService.start(url, handShake, function (event) {
               if(event.data != "OK"){
                   var str = event.data;
                   var hashIndex = str.indexOf("#");
                   var secondHashIndex = str.indexOf("#", hashIndex+1);
                   var charBeforehash = str.charAt(hashIndex-1)
                   var msg = "";
                   var status = "";
                   var user = "";
                   if(charBeforehash == "$"){
                       status = str.charAt(hashIndex+1)
                       user = str.substr(secondHashIndex+1)
                       if(status == "1"){
                           msg = "joined the room"
                       }
                       if(status == "2"){
                           msg = "left the room"
                       }
                       if(status == "5"){
                       	   msg = "The seller exited the room. Feel free to stay in the chat room to view the chat history but you will no longer be able to send messages."
                       }
                   }
                   if(charBeforehash == "1"){
                       user = str.substring(hashIndex+1,secondHashIndex)
                       msg = str.substr(secondHashIndex+1);
                   }
                   if(user == $scope.username){
                       return
                   }
                   $scope.msgs.push({user : user, msg : msg})
                   $scope.$apply();
                   $timeout(function(){
                      $("#chatmessages").prop({ scrollTop: $("#chatmessages").prop("scrollHeight") });
                      },250)

               } 
               else {
                   // if(event.data == "OK"){
	                  //  console.log("handShake success");
                   //     $("#chat-modal").modal("show"); 
                   //     $scope.showChatButton = false;  
                   // }
                   console.log("hand shake success")
                   if(Hls.isSupported()) {
        					    var video = document.getElementById('video');
        					    var hls = new Hls();
        					    hls.loadSource('http://chatting.sellyx.com/hls/'+$scope.data.room_dkey+'.m3u8');
        					    hls.attachMedia(video);
        					    hls.on(Hls.Events.MANIFEST_PARSED,function() {
        					      video.play();
        					  });
        					 }
               }        
           });
       }
       else{
        $location.path('/rooms')
        $cookies.remove('room_key')
       }
   },function(obj){
    $location.path('/rooms')
   })
   $scope.sendMsg = function(msg){
       if(!msg){
           return
       }
       $scope.msgs.push({user : $scope.username, msg : msg})
       $timeout(function(){
       	$("#chatmessages").prop({ scrollTop: $("#chatmessages").prop("scrollHeight") });
       	},250)
       chatWSService.send(msg);
       $scope.newMsg = "";
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
    qty: '1'
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

$scope.viewUser = function(id){
	$location.path('/user').search({u: id})
	}

$scope.getNumber = function(num) {
    return new Array(num);   
}

$scope.openShareModal = function(){
  $('#share_modal').modal('show');
  }

$scope.loginCheck = function(){
  if(!$cookies.get('sellyxtoken')){
    Alertify.confirm('Oops it looks like you are not logged in to use this feature. Please login or sign up for a new account.')
      .then(function onOk(){
        if($location.search()){
          var parameters = '?';
          angular.forEach($location.search(), function(v,k){
            parameters += ('' + k + '='+ v + '&')
            })
          }
            $window.location.href='https://auth.sellyx.com/login?service=www&redirection=' + $location.path() + parameters;
      })
      $('#alertify-ok').html('Login / Sign Up')
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
    amount: (price * quantity),
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
              $scope.purchasing = false;
              console.log(obj);
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

$scope.loginCheck = function(){
  if(!$cookies.get('sellyxtoken') || !$cookies.getObject('userInfo')){
    $('#login_modal').modal('show')
    $scope.url = encodeURIComponent($location.url());
      return true;
    }
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

}])