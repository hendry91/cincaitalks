define(['angular','angularresource','angularstorage', 'angularcookie'], function(angular) {
  'use strict';
  return angular.module('services', ['ngResource','LocalStorageModule','ngCookies'])
  .config(['localStorageServiceProvider', function(localStorageServiceProvider){
  	  localStorageServiceProvider.setPrefix('cincaitalks');
    }]);
});
