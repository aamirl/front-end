
var purple = '#9b59b6';
var purpleLight = '#BE93D0';
var purpleDark = '#7c4792';
var success = '#17B6A4';
var successDark = '#129283';
var primary = '#2184DA';
var primaryDark = '#1e77c5';
var info = '#38AFD3';
var inverse = '#3C454D';
var warning = '#fcaf41';
var danger = '#F04B46';
var dangerLight = '#F58A87';
var dangerDark = '#c03c38';
var lime = '#65C56F';
var grey = '#aab3ba';
var white = '#fff';
var fontFamily = '"Nunito", sans-serif';
var fontWeight = '300';
var fontStyle = 'normal';


/* -------------------------------
   1.0 CONTROLLER - App
------------------------------- */

sourceAdminApp.controller('appController', ['$rootScope', '$scope','chatWSService','$location','apiCall','$cookies','$window', function($rootScope, $scope, chatWSService, $location, apiCall, $cookies, $window) {
    $scope.$on('$includeContentLoaded', function() {
        App.initComponent();
    });
    $scope.$on('$viewContentLoaded', function() {
        App.initComponent();
    });
    $scope.$on('$stateChangeStart', function() {
        // if($cookies.get("sellyxtoken")){
        //     var req = {
        //       method: "GET",
        //       url: "https://auth.sellyx.com/auth/validate?key="+ $cookies.get('sellyxtoken'),
        //       failure_message: true,
        //     }
     
        //     apiCall.getapi(req).then(function (response){
        //       if(response.success){
        //         var user = response.success.data.user;
        //           if(!$cookies.getObject('userInfo') || $cookies.getObject('userInfo').id != user.id){
        //                 var url = $location.url();
        //                 console.log(url)
        //                 $location.path('/redirect').search({redirection: url})
        //             }
        //         }
        //     },
        //     function(response){
        //         console.log(response)
        //     });
        // };

        //reset favicon
        var favType = "image/x-icon"
        favLink = $('link[type="' + favType + '"]').remove().attr("href");
        $('<link href="' + favLink + '" rel="shortcut icon" type="' + favType + '" />').appendTo('head');

        if($('.modal-backdrop').length){
            $('.modal-backdrop').remove();
        }
        //close chat socket
        chatWSService.close();
        // reset layout setting
        $scope.loaded = false;
        $rootScope.setting.layout.pageSidebarMinified = false;
        $rootScope.setting.layout.pageFixedFooter = false;
        $rootScope.setting.layout.pageRightSidebar = false;
        $rootScope.setting.layout.pageTwoSidebar = false;
        $rootScope.setting.layout.pageTopMenu = false;
        $rootScope.setting.layout.pageBoxedLayout = false;
        $rootScope.setting.layout.pageWithoutSidebar = false;
        $rootScope.setting.layout.pageContentFullHeight = false;
        $rootScope.setting.layout.pageContentWithoutPadding = false;
        $rootScope.setting.layout.paceTop = false;
        App.scrollTop();
        $('.pace .pace-progress').addClass('hide');
        $('.pace').removeClass('pace-inactive');
    });
    $scope.$on('$stateChangeSuccess', function() {
        Pace.restart();
        App.initPageLoad();
        App.initSidebarSelection();
        $scope.loaded = true;
        $window.ga('send', 'pageview', $location.path());
    });
    $scope.$on('$stateNotFound', function() {
        Pace.stop();
    });
    $scope.$on('$stateChangeError', function() {
        Pace.stop();
    });
}]);



/* -------------------------------
   2.0 CONTROLLER - Sidebar
------------------------------- */

sourceAdminApp.controller('sidebarController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    App.initSidebar();
}]);

/* -------------------------------
   5.0 CONTROLLER - Page Loader
------------------------------- */

sourceAdminApp.controller('pageLoaderController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
}]);


var handleEmailPageSetting = function() {

    /* 9.1 Email - Sidebar
    ------------------------------------------------ */
	if ($('[data-toggle="email-sidebar"]').length !== 0) {
        $('[data-toggle="email-sidebar"]').click(function(e) {
            e.preventDefault();
            if ($(this).closest('.dropdown').hasClass('open')) {
                $(this).closest('.dropdown').removeClass('open');
            } else {
                $(this).closest('.dropdown').addClass('open');
            }
        });
    }
    
    
    /* 9.2 Email Inbox - Check All Button
    ------------------------------------------------ */
    
	if ($('[data-click="check-all"]').length !== 0) {
        $('[data-click="check-all"]').click(function(e) {
            e.preventDefault();
        
            var targetCheckbox = $(this).find('.fa');
        
            if ($(targetCheckbox).hasClass('fa-square-o')) {
                $(targetCheckbox).removeClass('fa-square-o').addClass('fa-check-square-o text-inverse');
                $('.email-checkbox').find('input[type="checkbox"]').prop('checked', false);
                $('[data-toggle="email-checkbox"]').click();
            } else {
                $(targetCheckbox).removeClass('fa-check-square-o text-inverse').addClass('fa-square-o');
                $('.email-checkbox').find('input[type="checkbox"]').prop('checked', true);
                $('[data-toggle="email-checkbox"]').click();
            }
        });
	}
	
	
    /* 9.3 Email Inbox - Checkbox
    ------------------------------------------------ */
    
	if ($('[data-toggle="email-checkbox"]').length !== 0) {
        $('[data-toggle="email-checkbox"]').click(function(e) {
            e.preventDefault();
        
            var targetCheckbox = $(this).closest('.email-checkbox').find('input[type="checkbox"]');
            var targetRow = $(this).closest('tr');
        
            if ($(targetCheckbox).is(':checked')) {
                $(targetCheckbox).prop('checked', false);
                $(targetRow).removeClass('checked');
            } else {
                $(targetCheckbox).prop('checked', true);
                $(targetRow).addClass('checked');
            }
        });
    }
};



/* -------------------------------
   10.0 CONTROLLER - Email Inbox
------------------------------- */

sourceAdminApp.controller('emailInboxController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    $rootScope.setting.layout.pageContentFullHeight = true;
    $rootScope.setting.layout.pageContentWithoutPadding = true;
    $rootScope.setting.layout.pageSidebarMinified = true;
    
    handleEmailPageSetting();
}]);



/* -------------------------------
   11.0 CONTROLLER - Email Compose
------------------------------- */

sourceAdminApp.controller('emailComposeController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    $rootScope.setting.layout.pageContentFullHeight = true;
    $rootScope.setting.layout.pageContentWithoutPadding = true;
    $rootScope.setting.layout.pageSidebarMinified = true;
    
    handleEmailPageSetting();
    
	if ($('#mail-compose-box').length !== 0) {
	    $rootScope.$on('$viewContentLoaded', function() {
	        setTimeout(function(){
                var targetOffset = $('#mail-compose-box').offset();
                var targetHeight = $(window).height() - targetOffset.top - 66;
                    targetHeight = ($(window).width() < 768) ? 400 : targetHeight;
                $('#mail-compose-box').summernote({
                    height: targetHeight,
                });
	        },0);
	    });
    }
}]);



/* -------------------------------
   12.0 CONTROLLER - Email Detail
------------------------------- */

sourceAdminApp.controller('emailDetailController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    $rootScope.setting.layout.pageContentFullHeight = true;
    $rootScope.setting.layout.pageContentWithoutPadding = true;
    $rootScope.setting.layout.pageSidebarMinified = true;
    
    handleEmailPageSetting();
}]);

/* -------------------------------
   19.0 CONTROLLER - Table Manage Default
------------------------------- */

sourceAdminApp.controller('tableManageDefaultController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    if ($('#data-table').length !== 0) {
        $('#data-table').DataTable({
            responsive: true
        });
    }
}]);



/* -------------------------------
   20.0 CONTROLLER - Table Manage Autofill
------------------------------- */

sourceAdminApp.controller('tableManageAutofillController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    if ($('#data-table').length !== 0) {
        $('#data-table').DataTable({
            autoFill: true,
            responsive: true
        });
    }
}]);



/* -------------------------------
   21.0 CONTROLLER - Table Manage Buttons
------------------------------- */

sourceAdminApp.controller('tableManageButtonsController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    if ($('#data-table').length !== 0) {
        $('#data-table').DataTable({
            dom: 'Bfrtip',
            buttons: [
                'copy', 'csv', 'excel', 'pdf', 'print'
            ],
            responsive: true
        });
    }
}]);



/* -------------------------------
   22.0 CONTROLLER - Table Manage ColReorder
------------------------------- */

sourceAdminApp.controller('tableManageColReorderController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    if ($('#data-table').length !== 0) {
        $('#data-table').DataTable({
            colReorder: true,
            responsive: true
        });
    }
}]);



/* -------------------------------
   23.0 CONTROLLER - Table Manage FixedColumns
------------------------------- */

sourceAdminApp.controller('tableManageFixedColumnsController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    if ($('#data-table').length !== 0) {
        $('#data-table').DataTable({
            scrollY:        300,
            scrollX:        true,
            scrollCollapse: true,
            paging:         false,
            fixedColumns:   true,
            responsive: true
        });
    }
}]);



/* -------------------------------
   24.0 CONTROLLER - Table Manage FixedHeader
------------------------------- */

sourceAdminApp.controller('tableManageFixedHeaderController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    if ($('#data-table').length !== 0) {
        $('#data-table').DataTable({
            lengthMenu: [20, 40, 60],
            fixedHeader: {
                header: true,
                headerOffset: $('#header').height()
            },
            responsive: true
        });
    }
}]);



/* -------------------------------
   25.0 CONTROLLER - Table Manage KeyTable
------------------------------- */

sourceAdminApp.controller('tableManageKeyTableController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    if ($('#data-table').length !== 0) {
        $('#data-table').DataTable({
            scrollY: 300,
            paging: false,
            autoWidth: true,
            keys: true,
            responsive: true
        });
    }
}]);



/* -------------------------------
   26.0 CONTROLLER - Table Manage Responsive
------------------------------- */

sourceAdminApp.controller('tableManageResponsiveController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    if ($('#data-table').length !== 0) {
        $('#data-table').DataTable({
            responsive: true
        });
    }
}]);



/* -------------------------------
   27.0 CONTROLLER - Table Manage RowReorder
------------------------------- */

sourceAdminApp.controller('tableManageRowReorderController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    if ($('#data-table').length !== 0) {
        $('#data-table').DataTable({
            rowReorder: true,
            responsive: true
        });
    }
}]);



/* -------------------------------
   28.0 CONTROLLER - Table Manage Scroller
------------------------------- */

sourceAdminApp.controller('tableManageScrollerController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    if ($('#data-table').length !== 0) {
        $('#data-table').DataTable({
            ajax:           "assets/plugins/DataTables/json/scroller-demo.json",
            deferRender:    true,
            scrollY:        300,
            scrollCollapse: true,
            scroller:       true,
            responsive: true
        });
    }
}]);



/* -------------------------------
   29.0 CONTROLLER - Table Manage Select
------------------------------- */

sourceAdminApp.controller('tableManageSelectController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    if ($('#data-table').length !== 0) {
        $('#data-table').DataTable({
            select: true,
            responsive: true
        });
    }
}]);



/* -------------------------------
   30.0 CONTROLLER - Table Manage Combine
------------------------------- */

sourceAdminApp.controller('tableManageCombineController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    if ($('#data-table').length !== 0) {
        $('#data-table').DataTable({
            dom: 'lBfrtip',
            buttons: [
                'copy', 'csv', 'excel', 'pdf', 'print'
            ],
            responsive: true,
            autoFill: true,
            colReorder: true,
            keys: true,
            rowReorder: true,
            select: true
        });
    }
}]);


/* -------------------------------
   38.0 CONTROLLER - Error
------------------------------- */

sourceAdminApp.controller('errorController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    $rootScope.setting.layout.paceTop = true;
}]);


/* -------------------------------
   41.0 CONTROLLER - Page with Fixed Footer
------------------------------- */

sourceAdminApp.controller('pageWithFixedFooterController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    $rootScope.setting.layout.pageFixedFooter = true;
}]);



/* -------------------------------
   42.0 CONTROLLER - Page with Right Sidebar
------------------------------- */

sourceAdminApp.controller('pageWithRightSidebarController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    $rootScope.setting.layout.pageRightSidebar = true;
}]);



/* -------------------------------
   43.0 CONTROLLER - Page with Minified Sidebar
------------------------------- */

sourceAdminApp.controller('pageWithMinifiedSidebarController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    $rootScope.setting.layout.pageSidebarMinified = true;
}]);



/* -------------------------------
   44.0 CONTROLLER - Page with Two Sidebar
------------------------------- */

sourceAdminApp.controller('pageWithTwoSidebarController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    $rootScope.setting.layout.pageTwoSidebar = true;
}]);



/* -------------------------------
   45.0 CONTROLLER - Page with Top Menu
------------------------------- */

sourceAdminApp.controller('pageWithTopMenuController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    $rootScope.setting.layout.pageTopMenu = true;
    $rootScope.setting.layout.pageWithoutSidebar = true;
}]);



/* -------------------------------
   46.0 CONTROLLER - Page with Mixed Menu
------------------------------- */

sourceAdminApp.controller('pageWithMixedMenuController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    $rootScope.setting.layout.pageTopMenu = true;
}]);



/* -------------------------------
   47.0 CONTROLLER - Page with Boxed Layout
------------------------------- */

sourceAdminApp.controller('pageWithBoxedLayoutController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    $rootScope.setting.layout.pageBoxedLayout = true;
}]);



/* -------------------------------
   48.0 CONTROLLER - Boxed Layout with Mixed Menu
------------------------------- */

sourceAdminApp.controller('pageBoxedLayoutWithMixedMenuController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    $rootScope.setting.layout.pageTopMenu = true;
    $rootScope.setting.layout.pageBoxedLayout = true;
}]);



/* -------------------------------
   49.0 CONTROLLER - Page without Sidebar
------------------------------- */

// sourceAdminApp.controller('pageWithoutSidebarController', function($scope, $rootScope, $state) {
//     $rootScope.setting.layout.pageWithoutSidebar = true;
// });
