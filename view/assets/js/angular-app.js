/*   
Template Name: Source Admin - Responsive Admin Dashboard Template build with Twitter Bootstrap 3.3.5
Version: 1.2.0
Author: Sean Ngu
Website: http://www.seantheme.com/source-admin-v1.2/admin/
*/

var sourceAdminApp = angular.module('sourceAdminApp', [
    'ui.router',
    'ui.bootstrap',
    'oc.lazyLoad',
    'ngCookies',
    'ngSanitize',
    'ui.select',
    'jkuri.gallery',
    'services',
    'Alertify',
    'ngWebSocket',
    'wu.masonry',
    'angularGrid',
    'infinite-scroll',
    'ngAnimate',
    'datatables',
]);

sourceAdminApp.config(['$stateProvider', '$urlRouterProvider','$locationProvider','$cookiesProvider', function($stateProvider, $urlRouterProvider, $locationProvider, $cookiesProvider) {
    $urlRouterProvider.otherwise('/');
    $cookiesProvider.defaults.domain = '.sellyx.com';

    $stateProvider
        .state('index', {
            url: '/',
            data: { pageTitle: 'Home' },
            views: { '' : {
                    templateUrl: 'template/app.html',
                    controller: 'homeCtrl as home',
                    resolve: {
                    service: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            files: [
                                    'assets/plugins/ui-select/dist/select.css',
                                    'assets/plugins/ng-alertify/dist/ng-alertify.css',
                            ] 
                        });
                    }]
                }
                },
            'filterModal@index': { templateUrl: 'views/filters.html'},
            'homePage@index': { templateUrl: 'views/home.html'},
            'currencyModal@index': { templateUrl: 'views/currency-modal.html'},
           }
       })
        .state('redirect', {
        url: "/redirect",
        templateUrl : 'template/redirection.html'
        })
        .state('app', {
            url: '/',
            templateUrl: 'template/app.html',
            abstract: true,
            resolve: {
                    service: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            files: [
                                    'assets/plugins/ui-select/dist/select.css',
                                    'assets/plugins/ngGallery/src/css/ngGallery.css',
                                    'assets/plugins/ng-alertify/dist/ng-alertify.css',
                                    'assets/plugins/gritter/css/jquery.gritter.css',
                            ] 
                        });
                    }]
                }
        })
        .state('app.listings', {
            url: 'listings',
            data: { pageTitle: 'Listings' },
            views: { '' : {
                    templateUrl: 'views/view_listings.html',
                    controller: 'listings',
                    resolve: {
                    service: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            files: [
                            ] 
                        });
                    }]
                }
                },
                'filterModal@app': { templateUrl: 'views/filters.html'},
                'currencyModal@app': { templateUrl: 'views/currency-modal.html'},
                'messageModal@app.listings': { templateUrl: 'views/messages.html'},
                'shareModal@app.listings': { templateUrl: 'views/share.html'},
                'interestModal@app.listings': { templateUrl: 'views/interests.html'},
                'keyModal@app.listings': { templateUrl: 'views/key.html'},
                'loginModal@app.listings': { templateUrl: 'views/login-modal.html'},

           }
        })
        .state('app.user', {
            url: 'user',
            data: { pageTitle: 'User Page' },
            views: { '' : {
                    templateUrl: 'views/view_user.html',
                    controller: 'user',
                    resolve: {
                    service: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            files: [
                                    'assets/plugins/gritter/css/jquery.gritter.css',
                                    'assets/plugins/ng-alertify/dist/ng-alertify.css',
                            ] 
                        });
                    }]
                }
                },
            'filterModal@app': { templateUrl: 'views/filters.html'},
            'currencyModal@app': { templateUrl: 'views/currency-modal.html'},
            'messageModal@app.user': { templateUrl: 'views/messages.html'},
            'loginModal@app.user': { templateUrl: 'views/login-modal.html'},

           }
        })
        .state('app.chat', {
            url: 'chat',
            data: { pageTitle: 'Chat Room' },
            views: { '' : {
                    templateUrl: 'views/chat_room.html',
                    controller: 'chatCtrl',
                    resolve: {
                    service: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            files: [
                            ] 
                        });
                    }]
                }
                },
            'filterModal@app': { templateUrl: 'views/filters.html'},
            'currencyModal@app': { templateUrl: 'views/currency-modal.html'},
            'messageModal@app.chat': { templateUrl: 'views/messages.html'},
            'shareModal@app.chat': { templateUrl: 'views/share.html'},
            'interestModal@app.chat': { templateUrl: 'views/interests.html'},
            'keyModal@app.chat': { templateUrl: 'views/key.html'},
            'loginModal@app.chat': { templateUrl: 'views/login-modal.html'},
           }
        })
        .state('app.rooms', {
            url: 'rooms',
            data: { pageTitle: 'Rooms' },
            views: { '' : {
                    templateUrl: 'views/rooms.html',
                    controller: 'roomsCtrl',
                    resolve: {
                    service: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            files: [
                            ] 
                        });
                    }]
                }
                },
            'filterModal@app': { templateUrl: 'views/filters.html'},
            'currencyModal@app': { templateUrl: 'views/currency-modal.html'},
            'loginModal@app.rooms': { templateUrl: 'views/login-modal.html'},
           }
        })
        .state('app.about', {
            url: 'about',
            data: { pageTitle: 'About Sellyx' },
            views: { '' : {
                    templateUrl: 'views/about.html',
                    // controller: 'roomsCtrl',
                    resolve: {
                    service: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            files: [
                            ] 
                        });
                    }]
                }
                },
                'currencyModal@app': { templateUrl: 'views/currency-modal.html'},
           }
        })
        .state('app.howItWorks', {
            url: 'how-it-works',
            data: { pageTitle: 'How It Works' },
            views: { '' : {
                    templateUrl: 'views/how-it-works.html',
                    // controller: 'roomsCtrl',
                    resolve: {
                    service: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            files: [
                            ] 
                        });
                    }]
                }
                },
                'currencyModal@app': { templateUrl: 'views/currency-modal.html'},
           }
        })
        .state('app.contact', {
            url: 'contact',
            data: { pageTitle: 'Contact' },
            views: { '' : {
                    templateUrl: 'views/contact.html',
                    controller: 'contactCtrl',
                    resolve: {
                    service: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            files: [
                            ] 
                        });
                    }]
                }
                },
                'currencyModal@app': { templateUrl: 'views/currency-modal.html'},
           }
        })
        .state('app.privacy', {
            url: 'privacy',
            data: { pageTitle: 'Privacy Policy' },
            views: { '' : {
                    templateUrl: 'views/privacy.html',
                    // controller: 'contactCtrl',
                    resolve: {
                    service: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            files: [
                            ] 
                        });
                    }]
                }
                },
                'currencyModal@app': { templateUrl: 'views/currency-modal.html'},
           }
        })
        .state('app.terms', {
            url: 'terms-conditions',
            data: { pageTitle: 'Terms & Conditions' },
            views: { '' : {
                    templateUrl: 'views/termsandconditions.html',
                    // controller: 'terms',
                    resolve: {
                    service: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            files: [
                            ] 
                        });
                    }]
                }
                },
                'currencyModal@app': { templateUrl: 'views/currency-modal.html'},
           }
        })
}]);

sourceAdminApp.run(['$rootScope', '$state', 'setting','$window', function($rootScope, $state, setting, $window) {
    $rootScope.$state = $state;
    $rootScope.setting = setting;
    $window.ga('create', 'UA-78880806-1', 'auto');

}]);