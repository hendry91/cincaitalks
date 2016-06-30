/* 
//== Library Version
- AngularJS - 1.5.0
- Angular Local Storage - 0.2.5
- Angular Translate - 2.10.0
- RequireJS - 2.1.22
- JQuery - 2.2.1
- JQueryCaret - v0.3.1
- JQueryUI - 1.11.4
- KendoUI - 2015.3.1304
- MomentJS - 2.11.2
- bootstrap - v4 alpha 2
//== Etc
*/

require.config({
    paths: {
        angular: '../lib/angular/angular.min',
        angularroute: '../lib/angular/angular-route.min',
        angularresource: '../lib/angular/angular-resource.min',
        angularstorage: '../lib/angular/angular-local-storage.min',
        angularcookie: '../lib/angular/angular-cookies.min',
        angularsanitize: '../lib/angular/angular-sanitize.min',
        angulartranslate: '../lib/angular/angular-translate.min',
        angulartranslateloaderstaticfiles: '../lib/angular/angular-translate-loader-static-files.min',
        angularuiroute: '../lib/angular/angular-ui-router.min',
        angularloadingbar: '../lib/angular/loading-bar.min',
        jquery: '../lib/jquery/jquery.min',
        autogrow: '../lib/jquery/jquery.ns-autogrow.min',
        jqueryui: '../lib/jqueryui/jquery-ui.min',
        domReady: '../lib/requirejs/domReady',
        bootstrap: '../lib/bootstrap/bootstrap.min',
        masonry: '../lib/masonry/masonry.pkgd.min',
        twbsPagination: '../lib/bootstrap/twbsPagination',
        moment: '../lib/moment/moment.min',
        momenttimezone: '../lib/moment/moment-timezone-with-data.min'
    },
    shim: {
        angular: {
            deps: ['jquery', 'jqueryui'],
            exports: 'angular'
        },
        angularroute: {
            deps: ['angular']
        },
        angularresource: {
            deps: ['angular']
        },
        angularstorage: {
            deps: ['angular']
        },
        angularcookie: {
            deps: ['angular']
        },
        angularsanitize: {
            deps: ['angular']
        },
        angulartranslate: {
            deps: ['angular']
        },
        angulartranslateloaderstaticfiles: {
            deps: ['angular', 'angulartranslate']
        },
        angularloadingbar: {
            deps: ['angular']
        },

        angularuiroute: {
            deps: ['angular']
        },
        
        bootstrap: {
            deps: ['jquery', 'jqueryui', 'angular', 'masonry']
        },
        twbsPagination: {
            deps: ['jquery', 'jqueryui', 'angular']
        },
        autogrow: {
            deps: ['jquery']
        }
        
    },
    waitSeconds: 60
});

require([
	'angular',
	'app',
    'bootstrap',
    'masonry',
    'twbsPagination',
    'moment',
    'momenttimezone',
    'autogrow',
    'services/deploydService',
    'services/authServices',
    'filters/formatFilters',
    'controllers/menuController',
    'controllers/breakLineController',
    'directives/directCreatePost',
    'directives/directSignupForm',
    'directives/directLoginForm',
    'directives/directPostDetails',
    'directives/directUserSetting',
    'directives/directEditPost',
    '../sources/wallposting/publicwall',
//    '../sources/wallposting/fnbwall',
//    '../sources/wallposting/complainwall',
//    '../sources/wallposting/entertainmentwall',
//    '../sources/wallposting/lovewall',
//    '../sources/wallposting/otherwall',
//    '../sources/wallposting/sportwall',
//    '../sources/wallposting/snrwall',
//    '../sources/wallposting/lnfwall',
    '../sources/about/about'
    
],
	function (angular) {

			require(['domReady!'], function (document) {
				angular.bootstrap(document, ['cincaiTalk']);
			});

	},
	function (err){
		console.error(err.message);
		alert("Connection timeout. Please retry again.");
	}
);

