// The app/scripts/app.js file, which defines our AngularJS app
define(['angular',
        'angularroute',
        'angularuiroute',
        'services/services',
        'filters/filters', 
        'controllers/controllers',
        'directives/directives',
        'angularloadingbar'],
        function (angular) {
            var app = angular.module('cincaiTalk',['ngRoute', 'services', 'filters', 'controllers', 'directives', 'ui.router', 'angular-loading-bar']);
            app.config(['$routeProvider', '$stateProvider', '$urlRouterProvider', '$httpProvider',
            function ($routeProvider, $stateProvider, $urlRouterProvider, $httpProvider) {

                $urlRouterProvider.otherwise("/public");

                //Add new sources here
                $stateProvider
                    .state('publicwall', {
                        url: "/public",
                        template: '<div publicwall></div>'
                    })
                    .state('fnbwall', {
                        url: "/Food&Beverage",
                        template: '<div fnbwall></div>'
                    })
                    .state('complainwall', {
                        url: "/complain",
                        template: '<div complainwall></div>'
                    })
                    .state('entertainmentwall', {
                        url: "/entertainment",
                        template: '<div entertainmentwall></div>'
                    })
                    .state('lovewall', {
                        url: "/loveStory",
                        template: '<div lovewall></div>'
                    })
                    .state('otherwall', {
                        url: "/other",
                        template: '<div otherwall></div>'
                    })
                    .state('snrwall', {
                        url: "/Sales&Rent",
                        template: '<div snrwall></div>'
                    })
                    .state('sportwall', {
                        url: "/Sport",
                        template: '<div sportwall></div>'
                    })
                    .state('lnfwall', {
                        url: "/Lost&Found",
                        template: '<div lnfwall></div>'
                    })
                    .state('about', {
                        url: "/about",
                        template: '<div about></div>'
                    })
            }

            ])
             .constant('itemPerPage', '9');
            app.config(function ($httpProvider) { //if not this code, deployd get current user have problem
                $httpProvider.defaults.withCredentials = true;
                $httpProvider.defaults.useXDomain = true;
            });
            return app;
        });
