sourceAdminApp.directive('checkImage', function() {
    return {
      link: function(scope, element, attrs) {
         element.bind('error', function() {
            element.attr('src', 'assets/img/no-user-found.jpg'); // set default image
            });
            }
        }
    })
.directive('checkProductImage', function() {
    return {
      link: function(scope, element, attrs) {
         element.bind('error', function() {
            element.attr('src', 'assets/img/no_product_image.jpg'); // set default image
            });
            }
        }
    })
.directive("select", function() {
    return {
      restrict: "E",
      require: "?ngModel",
      scope: false,
      link: function (scope, element, attrs, ngModel) {
        if (!ngModel) {
          return;
        }
        element.bind("keyup", function() {
          element.triggerHandler("change");
        })
      }
    }
  })
.directive('myRepeatDirective', function() {
  return function(scope, element, attrs) {
    if (scope.$last){
      console.log($('.ng-thumb'))
            // var grid = $('.grid').imagesLoaded().progress( function() {
            //     grid.masonry({
            //       // options
            //       itemSelector: '.grid-item',
            //       columnWidth: 220,
            //       gutter: 15,
            //       fitWidth: true,
            //         });
            //     grid.masonry('reloadItems');
            //     });

    }
  };
})

